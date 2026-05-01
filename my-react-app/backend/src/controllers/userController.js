const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const { v4: uuidv4 } = require('uuid');

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (id, email, password, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, role`,
      [uuidv4(), email, hashedPassword, firstName, lastName, role || 'staff']
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      user,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone, isActive, groupIds } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'Email, mot de passe, nom, prénom et rôle sont requis' });
    }

    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = uuidv4();
    const result = await pool.query(
      `INSERT INTO users (id, email, password, first_name, last_name, role, phone, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, true))
       RETURNING id, email, first_name, last_name, role, phone, is_active, created_at, updated_at`,
      [userId, email, hashedPassword, firstName, lastName, role, phone || null, isActive]
    );

    if (Array.isArray(groupIds) && groupIds.length > 0) {
      for (const groupId of groupIds) {
        await pool.query(
          `INSERT INTO user_groups (id, user_id, group_id)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [uuidv4(), userId, groupId]
        );
      }
    }

    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, role, phone, is_active, created_at, updated_at
       FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, role, phone, is_active, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, phone, isActive } = req.body;

    const result = await pool.query(
      `UPDATE users SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        role = COALESCE($3, role),
        phone = COALESCE($4, phone),
        is_active = COALESCE($5, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, email, first_name, last_name, role, phone, is_active`,
      [firstName, lastName, role, phone, isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'Le nouveau mot de passe est requis' });
    }

    const result = await pool.query('SELECT id, password FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    const user = result.rows[0];

    if (req.user.role !== 'admin') {
      if (!oldPassword) {
        return res.status(400).json({ error: 'L ancien mot de passe est requis' });
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Ancien mot de passe invalide' });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedPassword, id]);

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  changePassword,
  deleteUser,
};
