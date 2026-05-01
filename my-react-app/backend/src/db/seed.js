const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const seedDatabase = async () => {
  try {
    console.log('Seeding database with sample data...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO users (id, email, password, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [uuidv4(), 'admin@restaurant.com', adminPassword, 'Admin', 'User', 'admin']
    );

    // Create manager user
    const managerPassword = await bcrypt.hash('manager123', 10);
    await pool.query(
      `INSERT INTO users (id, email, password, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [uuidv4(), 'manager@restaurant.com', managerPassword, 'Manager', 'User', 'manager']
    );

    // Create cook user
    const cookPassword = await bcrypt.hash('cook123', 10);
    await pool.query(
      `INSERT INTO users (id, email, password, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [uuidv4(), 'cook@restaurant.com', cookPassword, 'Chef', 'Cuisinier', 'cook']
    );

    // Create waiter user
    const waiterPassword = await bcrypt.hash('waiter123', 10);
    await pool.query(
      `INSERT INTO users (id, email, password, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [uuidv4(), 'waiter@restaurant.com', waiterPassword, 'Serveur', 'Service', 'waiter']
    );

    // Create cashier user
    const cashierPassword = await bcrypt.hash('cashier123', 10);
    await pool.query(
      `INSERT INTO users (id, email, password, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [uuidv4(), 'cashier@restaurant.com', cashierPassword, 'Caissier', 'Encaissement', 'cashier']
    );

    // Create delivery user
    const deliveryPassword = await bcrypt.hash('delivery123', 10);
    await pool.query(
      `INSERT INTO users (id, email, password, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [uuidv4(), 'delivery@restaurant.com', deliveryPassword, 'Livreur', 'Logistique', 'delivery']
    );

    // Create staff user
    const staffPassword = await bcrypt.hash('staff123', 10);
    await pool.query(
      `INSERT INTO users (id, email, password, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [uuidv4(), 'staff@restaurant.com', staffPassword, 'Personnel', 'Général', 'staff']
    );

    // Create menu categories
    const categories = ['Appetizers', 'Main Courses', 'Desserts', 'Beverages'];
    const categoryIds = [];

    for (const category of categories) {
      const result = await pool.query(
        `INSERT INTO menu_categories (id, name, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [uuidv4(), category, `Delicious ${category}`]
      );
      categoryIds.push(result.rows[0].id);
    }

    // Create menu items
    const menuItems = [
      { category: 0, name: 'Spring Rolls', price: 5.99, vegetarian: true },
      { category: 0, name: 'Soup Dumpling', price: 6.99, vegetarian: false },
      { category: 1, name: 'Grilled Salmon', price: 18.99, vegetarian: false },
      { category: 1, name: 'Vegetable Stir Fry', price: 12.99, vegetarian: true },
      { category: 1, name: 'Chicken Teriyaki', price: 15.99, vegetarian: false },
      { category: 2, name: 'Chocolate Cake', price: 7.99, vegetarian: true },
      { category: 2, name: 'Cheesecake', price: 8.99, vegetarian: true },
      { category: 3, name: 'Iced Tea', price: 3.99, vegetarian: true },
      { category: 3, name: 'Soft Drink', price: 2.99, vegetarian: true },
    ];

    for (const item of menuItems) {
      await pool.query(
        `INSERT INTO menu_items (id, category_id, name, description, price, is_vegetarian)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [uuidv4(), categoryIds[item.category], item.name, `Delicious ${item.name}`, item.price, item.vegetarian]
      );
    }

    // Create tables
    for (let i = 1; i <= 16; i++) {
      const capacity = i <= 4 ? 2 : i <= 8 ? 4 : i <= 12 ? 6 : 8;
      const section = i <= 4 ? 'A' : i <= 8 ? 'B' : i <= 12 ? 'C' : 'D';

      await pool.query(
        `INSERT INTO tables (id, table_number, capacity, section)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (table_number) DO NOTHING`,
        [uuidv4(), i, capacity, section]
      );
    }

    // Create default permission groups
    const groupMap = {};
    const permissionGroups = [
      { name: 'Admins', description: 'Administrator group with all management permissions' },
      { name: 'Managers', description: 'Manager group with full restaurant control' },
      { name: 'Kitchen', description: 'Kitchen staff group for managing order preparation' },
      { name: 'Waiters', description: 'Waiter group for taking orders and serving tables' },
      { name: 'Cashiers', description: 'Cashier group for payment and invoice operations' },
      { name: 'Delivery', description: 'Delivery group for order delivery assignments' },
      { name: 'Staff', description: 'General staff group for support tasks' }
    ];

    for (const group of permissionGroups) {
      const result = await pool.query(
        `INSERT INTO permission_groups (id, name, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description RETURNING id`,
        [uuidv4(), group.name, group.description]
      );
      groupMap[group.name] = result.rows[0].id;
    }

    const groupPermissions = [
      { group: 'Admins', action: 'manage_users' },
      { group: 'Admins', action: 'manage_orders' },
      { group: 'Admins', action: 'manage_groups' },
      { group: 'Managers', action: 'manage_orders' },
      { group: 'Managers', action: 'manage_invoices' },
      { group: 'Kitchen', action: 'prepare_orders' },
      { group: 'Waiters', action: 'create_orders' },
      { group: 'Cashiers', action: 'process_payments' },
      { group: 'Delivery', action: 'deliver_orders' },
      { group: 'Staff', action: 'assist_operations' }
    ];

    for (const permission of groupPermissions) {
      await pool.query(
        `INSERT INTO group_permissions (id, group_id, action)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [uuidv4(), groupMap[permission.group], permission.action]
      );
    }

    const adminUser = await pool.query(`SELECT id FROM users WHERE email = $1`, ['admin@restaurant.com']);
    const managerUser = await pool.query(`SELECT id FROM users WHERE email = $1`, ['manager@restaurant.com']);
    const waiterUser = await pool.query(`SELECT id FROM users WHERE email = $1`, ['waiter@restaurant.com']);
    const cashierUser = await pool.query(`SELECT id FROM users WHERE email = $1`, ['cashier@restaurant.com']);
    const deliveryUser = await pool.query(`SELECT id FROM users WHERE email = $1`, ['delivery@restaurant.com']);
    const staffUser = await pool.query(`SELECT id FROM users WHERE email = $1`, ['staff@restaurant.com']);

    const defaultAssignments = [
      { userId: adminUser.rows[0]?.id, group: 'Admins' },
      { userId: managerUser.rows[0]?.id, group: 'Managers' },
      { userId: waiterUser.rows[0]?.id, group: 'Waiters' },
      { userId: cashierUser.rows[0]?.id, group: 'Cashiers' },
      { userId: deliveryUser.rows[0]?.id, group: 'Delivery' },
      { userId: staffUser.rows[0]?.id, group: 'Staff' }
    ];

    for (const assignment of defaultAssignments) {
      if (!assignment.userId) continue;
      await pool.query(
        `INSERT INTO user_groups (id, user_id, group_id)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [uuidv4(), assignment.userId, groupMap[assignment.group]]
      );
    }

    const cookUser = await pool.query(`SELECT id FROM users WHERE email = $1`, ['cook@restaurant.com']);
    if (cookUser.rows[0]?.id) {
      await pool.query(
        `INSERT INTO cooks (id, user_id, station)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO NOTHING`,
        [uuidv4(), cookUser.rows[0].id, 'Main Kitchen']
      );
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
