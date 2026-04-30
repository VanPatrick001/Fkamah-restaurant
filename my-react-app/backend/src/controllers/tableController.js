const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity, section, qrCode } = req.body;

    if (!tableNumber || !capacity) {
      return res.status(400).json({ error: 'Table number and capacity are required' });
    }

    const result = await pool.query(
      `INSERT INTO tables (id, table_number, capacity, section, qr_code)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, table_number, capacity, section, status, qr_code, created_at`,
      [uuidv4(), tableNumber, capacity, section, qrCode]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create table error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Table number already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllTables = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM tables ORDER BY table_number ASC`);
    res.json(result.rows);
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTableById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tables WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get table error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await pool.query(
      `UPDATE tables SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update table error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { tableNumber, capacity, section, qrCode } = req.body;

    const result = await pool.query(
      `UPDATE tables SET
        table_number = COALESCE($1, table_number),
        capacity = COALESCE($2, capacity),
        section = COALESCE($3, section),
        qr_code = COALESCE($4, qr_code),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [tableNumber, capacity, section, qrCode, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update table error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tables WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTablesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const result = await pool.query('SELECT * FROM tables WHERE status = $1 ORDER BY table_number ASC', [status]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get tables by status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createTable,
  getAllTables,
  getTableById,
  updateTable,
  updateTableStatus,
  deleteTable,
  getTablesByStatus,
};
