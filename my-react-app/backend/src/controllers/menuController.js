const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const createCategory = async (req, res) => {
  try {
    const { name, description, imageUrl, displayOrder } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const result = await pool.query(
      `INSERT INTO menu_categories (id, name, description, image_url, display_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, image_url, display_order, is_active, created_at`,
      [uuidv4(), name, description, imageUrl, displayOrder]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM menu_categories WHERE is_active = true ORDER BY display_order ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const { categoryId, name, description, price, imageUrl, preparationTime, isVegetarian, isVegan } = req.body;

    if (!categoryId || !name || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO menu_items (id, category_id, name, description, price, image_url, preparation_time, is_vegetarian, is_vegan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, category_id, name, description, price, image_url, preparation_time, is_available, is_vegetarian, is_vegan, created_at`,
      [uuidv4(), categoryId, name, description, price, imageUrl, preparationTime || 15, isVegetarian || false, isVegan || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllMenuItems = async (req, res) => {
  try {
    const { categoryId } = req.query;

    let query = `SELECT * FROM menu_items WHERE is_available = true`;
    const params = [];

    if (categoryId) {
      query += ` AND category_id = $1`;
      params.push(categoryId);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM menu_items WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, imageUrl, preparationTime, isAvailable, isVegetarian, isVegan } = req.body;

    const result = await pool.query(
      `UPDATE menu_items SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        image_url = COALESCE($4, image_url),
        preparation_time = COALESCE($5, preparation_time),
        is_available = COALESCE($6, is_available),
        is_vegetarian = COALESCE($7, is_vegetarian),
        is_vegan = COALESCE($8, is_vegan),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [name, description, price, imageUrl, preparationTime, isAvailable, isVegetarian, isVegan, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM menu_items WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
};
