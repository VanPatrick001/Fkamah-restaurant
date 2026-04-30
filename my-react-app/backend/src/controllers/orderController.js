const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const createOrder = async (req, res) => {
  try {
    const { tableId, userId, items, notes } = req.body;

    if (!tableId || !userId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const orderId = uuidv4();

      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (id, table_id, user_id, notes)
         VALUES ($1, $2, $3, $4)
         RETURNING id, table_id, user_id, status, total_amount, created_at`,
        [orderId, tableId, userId, notes]
      );

      let totalAmount = 0;

      // Add order items
      for (const item of items) {
        const { menuItemId, quantity, specialInstructions } = item;

        const menuItem = await client.query('SELECT price FROM menu_items WHERE id = $1', [menuItemId]);
        if (menuItem.rows.length === 0) {
          throw new Error(`Menu item ${menuItemId} not found`);
        }

        const unitPrice = menuItem.rows[0].price;
        const itemTotal = unitPrice * quantity;
        totalAmount += itemTotal;

        await client.query(
          `INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, special_instructions)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [uuidv4(), orderId, menuItemId, quantity, unitPrice, specialInstructions]
        );
      }

      // Update order total
      await client.query(
        `UPDATE orders SET total_amount = $1 WHERE id = $2`,
        [totalAmount, orderId]
      );

      // Update table status
      await client.query(
        `UPDATE tables SET status = 'occupied' WHERE id = $1`,
        [tableId]
      );

      await client.query('COMMIT');

      const finalOrder = await pool.query(
        `SELECT o.id, o.table_id, o.user_id, o.status, o.total_amount, o.notes, o.created_at,
                json_agg(json_build_object('id', oi.id, 'menu_item_id', oi.menu_item_id, 
                'quantity', oi.quantity, 'unit_price', oi.unit_price)) as items
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         WHERE o.id = $1
         GROUP BY o.id`,
        [orderId]
      );

      res.status(201).json(finalOrder.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { status, tableId } = req.query;

    let query = `SELECT o.id, o.table_id, o.user_id, o.status, o.total_amount, o.tax_amount, 
                        o.discount_amount, o.notes, o.created_at, o.updated_at,
                        json_agg(json_build_object('id', oi.id, 'menu_item_id', oi.menu_item_id, 
                        'quantity', oi.quantity, 'unit_price', oi.unit_price, 'item_status', oi.item_status)) as items
                 FROM orders o
                 LEFT JOIN order_items oi ON o.id = oi.order_id`;
    const params = [];

    const conditions = [];
    if (status) {
      conditions.push(`o.status = $${params.length + 1}`);
      params.push(status);
    }
    if (tableId) {
      conditions.push(`o.table_id = $${params.length + 1}`);
      params.push(tableId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` GROUP BY o.id ORDER BY o.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT o.id, o.table_id, o.user_id, o.status, o.total_amount, o.tax_amount, 
              o.discount_amount, o.notes, o.created_at, o.updated_at,
              json_agg(json_build_object('id', oi.id, 'menu_item_id', oi.menu_item_id, 
              'quantity', oi.quantity, 'unit_price', oi.unit_price, 'item_status', oi.item_status)) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = $1
       GROUP BY o.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await pool.query(
      `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, totalAmount, taxAmount, discountAmount, notes } = req.body;

    const result = await pool.query(
      `UPDATE orders SET
        status = COALESCE($1, status),
        total_amount = COALESCE($2, total_amount),
        tax_amount = COALESCE($3, tax_amount),
        discount_amount = COALESCE($4, discount_amount),
        notes = COALESCE($5, notes),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [status, totalAmount, taxAmount, discountAmount, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get order details
      const order = await client.query('SELECT table_id FROM orders WHERE id = $1', [id]);
      if (order.rows.length === 0) {
        throw new Error('Order not found');
      }

      // Update order status
      await client.query(
        `UPDATE orders SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [id]
      );

      // Update table status
      await client.query(
        `UPDATE tables SET status = 'available' WHERE id = $1`,
        [order.rows[0].table_id]
      );

      await client.query('COMMIT');

      res.json({ message: 'Order completed successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Complete order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const order = await client.query('SELECT table_id FROM orders WHERE id = $1', [id]);
      if (order.rows.length === 0) {
        throw new Error('Order not found');
      }

      await client.query(
        `UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [id]
      );

      await client.query(
        `UPDATE tables SET status = 'available' WHERE id = $1`,
        [order.rows[0].table_id]
      );

      await client.query('COMMIT');

      res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  completeOrder,
  cancelOrder,
};
