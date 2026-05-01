const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const logOrderHistory = async (client, orderId, userId, action, details = {}) => {
  await client.query(
    `INSERT INTO order_history (id, order_id, user_id, action, details)
     VALUES ($1, $2, $3, $4, $5)`,
    [uuidv4(), orderId, userId || null, action, details]
  );
};

const buildOrderResponse = async (orderId) => {
  const result = await pool.query(
    `SELECT o.id,
            o.table_id,
            o.order_type as type,
            o.user_id,
            o.status,
            o.payment_status,
            o.total_amount,
            o.tax_amount,
            o.discount_amount,
            o.notes,
            o.created_at,
            o.updated_at,
            t.table_number,
            json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'role', u.role) as waiter,
            json_agg(json_build_object(
              'id', oi.id,
              'menuItemId', oi.menu_item_id,
              'menuItem', json_build_object('id', mi.id, 'name', mi.name, 'price', mi.price, 'categoryId', mi.category_id),
              'quantity', oi.quantity,
              'unitPrice', oi.unit_price,
              'itemStatus', oi.item_status,
              'specialInstructions', oi.special_instructions
            )) as items
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     LEFT JOIN tables t ON o.table_id = t.id
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
     WHERE o.id = $1
     GROUP BY o.id, u.id, t.table_number`,
    [orderId]
  );

  return result.rows[0];
};

const createOrder = async (req, res) => {
  try {
    const { tableId, userId, items, notes, orderType } = req.body;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (orderType === 'dine-in' && !tableId) {
      return res.status(400).json({ error: 'Table ID is required for dine-in orders' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const orderId = uuidv4();

      await client.query(
        `INSERT INTO orders (id, table_id, user_id, order_type, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, tableId || null, userId, orderType || 'dine-in', notes]
      );

      let totalAmount = 0;

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

      await client.query(
        `UPDATE orders SET total_amount = $1 WHERE id = $2`,
        [totalAmount, orderId]
      );

      if (tableId) {
        await client.query(
          `UPDATE tables SET status = 'occupied' WHERE id = $1`,
          [tableId]
        );
      }

      await logOrderHistory(client, orderId, req.user?.id, 'created', {
        orderType: orderType || 'dine-in',
        tableId: tableId || null,
        items,
        notes,
        totalAmount,
      });

      await client.query('COMMIT');

      const finalOrder = await buildOrderResponse(orderId);
      res.status(201).json(finalOrder);
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
    const { status, tableId, active } = req.query;

    let query = `SELECT o.id,
                        o.table_id,
                        o.order_type as type,
                        o.user_id,
                        o.status,
                        o.payment_status,
                        o.total_amount,
                        o.tax_amount,
                        o.discount_amount,
                        o.notes,
                        o.created_at,
                        o.updated_at,
                        t.table_number,
                        json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'role', u.role) as waiter,
                        json_agg(json_build_object(
                          'id', oi.id,
                          'menuItemId', oi.menu_item_id,
                          'menuItem', json_build_object('id', mi.id, 'name', mi.name, 'price', mi.price, 'categoryId', mi.category_id),
                          'quantity', oi.quantity,
                          'unitPrice', oi.unit_price,
                          'itemStatus', oi.item_status,
                          'specialInstructions', oi.special_instructions
                        )) as items
                 FROM orders o
                 LEFT JOIN users u ON o.user_id = u.id
                 LEFT JOIN tables t ON o.table_id = t.id
                 LEFT JOIN order_items oi ON o.id = oi.order_id
                 LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id`;
    const params = [];

    const conditions = [];
    if (active === 'true') {
      conditions.push(`o.status NOT IN ('completed', 'cancelled')`);
    }
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

    query += ` GROUP BY o.id, u.id, t.table_number ORDER BY o.created_at DESC`;

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
      `SELECT o.id,
              o.table_id,
              o.order_type as type,
              o.user_id,
              o.status,
              o.payment_status,
              o.total_amount,
              o.tax_amount,
              o.discount_amount,
              o.notes,
              o.created_at,
              o.updated_at,
              t.table_number,
              json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'role', u.role) as waiter,
              json_agg(json_build_object(
                'id', oi.id,
                'menuItemId', oi.menu_item_id,
                'menuItem', json_build_object('id', mi.id, 'name', mi.name, 'price', mi.price, 'categoryId', mi.category_id),
                'quantity', oi.quantity,
                'unitPrice', oi.unit_price,
                'itemStatus', oi.item_status,
                'specialInstructions', oi.special_instructions
              )) as items
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN tables t ON o.table_id = t.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE o.id = $1
       GROUP BY o.id, u.id, t.table_number`,
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

    const existing = await pool.query('SELECT status FROM orders WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await pool.query(
      `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [status, id]
    );

    await logOrderHistory(pool, id, req.user?.id, 'status_changed', {
      from: existing.rows[0].status,
      to: status,
    });

    const order = await buildOrderResponse(id);
    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({ error: 'Payment status is required' });
    }

    const existing = await pool.query('SELECT payment_status FROM orders WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await pool.query(
      `UPDATE orders SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [paymentStatus, id]
    );

    await logOrderHistory(pool, id, req.user?.id, 'payment_status_changed', {
      from: existing.rows[0].payment_status,
      to: paymentStatus,
    });

    const order = await buildOrderResponse(id);
    res.json(order);
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, totalAmount, taxAmount, discountAmount, notes } = req.body;

    const existing = await pool.query(
      `SELECT status, total_amount, tax_amount, discount_amount, notes
       FROM orders WHERE id = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const current = existing.rows[0];

    await pool.query(
      `UPDATE orders SET
        status = COALESCE($1, status),
        total_amount = COALESCE($2, total_amount),
        tax_amount = COALESCE($3, tax_amount),
        discount_amount = COALESCE($4, discount_amount),
        notes = COALESCE($5, notes),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [status, totalAmount, taxAmount, discountAmount, notes, id]
    );

    await logOrderHistory(pool, id, req.user?.id, 'updated', {
      changed: {
        status: { from: current.status, to: status ?? current.status },
        totalAmount: { from: current.total_amount, to: totalAmount ?? current.total_amount },
        taxAmount: { from: current.tax_amount, to: taxAmount ?? current.tax_amount },
        discountAmount: { from: current.discount_amount, to: discountAmount ?? current.discount_amount },
        notes: { from: current.notes, to: notes ?? current.notes },
      },
    });

    const order = await buildOrderResponse(id);
    res.json(order);
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

      await logOrderHistory(client, id, req.user?.id, 'completed', {
        tableId: order.rows[0].table_id,
      });

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

      await logOrderHistory(client, id, req.user?.id, 'cancelled', {
        tableId: order.rows[0].table_id,
      });

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
  updatePaymentStatus,
  completeOrder,
  cancelOrder,
};
