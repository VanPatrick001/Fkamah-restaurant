const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const getAllGroups = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, is_active, created_at, updated_at
       FROM permission_groups ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const result = await pool.query(
      `INSERT INTO permission_groups (id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, is_active, created_at, updated_at`,
      [uuidv4(), name, description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const assignUsersToGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs are required' });
    }

    const entries = userIds.map((userId) => [uuidv4(), userId, groupId]);
    const query = `INSERT INTO user_groups (id, user_id, group_id) VALUES ${entries.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(', ')} ON CONFLICT DO NOTHING`;
    const values = entries.flat();

    await pool.query(query, values);
    res.json({ message: 'Users assigned to group successfully' });
  } catch (error) {
    console.error('Assign users to group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserGroups = async (req, res) => {
  try {
    const { id: userId } = req.params;

    const result = await pool.query(
      `SELECT g.id, g.name, g.description
       FROM permission_groups g
       JOIN user_groups ug ON g.id = ug.group_id
       WHERE ug.user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get user groups error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllGroups,
  createGroup,
  assignUsersToGroup,
  getUserGroups,
};
