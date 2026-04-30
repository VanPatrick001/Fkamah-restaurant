# Restaurant Management Backend API

A comprehensive Node.js backend API for restaurant management with real-time features, built with Express, PostgreSQL, and WebSocket support.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Create and manage staff with different roles (admin, manager, staff, cashier)
- **Menu Management**: Full CRUD operations for menu items and categories
- **Table Management**: Manage restaurant tables with status tracking
- **Order Management**: Complete order lifecycle from creation to completion
- **Real-time Notifications**: WebSocket-based real-time notifications for orders and events
- **Payment Logging**: Track payment transactions
- **Database Schema**: Comprehensive PostgreSQL schema with relationships and constraints

## System Requirements

- Node.js 14+
- PostgreSQL 12+
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant-management-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=restaurant_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   PORT=5000
   JWT_SECRET=your_secure_secret_key
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE restaurant_db;
   ```

5. **Initialize database schema**
   ```bash
   npm run db:migrate
   ```

6. **Seed sample data (optional)**
   ```bash
   npm run db:seed
   ```

## Running the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The API server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Menu Management
- `GET /api/categories` - Get all menu categories
- `POST /api/categories` - Create a new category (admin/manager only)
- `GET /api/items` - Get all menu items
- `GET /api/items/:id` - Get a specific menu item
- `POST /api/items` - Create a new menu item (admin/manager only)
- `PUT /api/items/:id` - Update a menu item (admin/manager only)
- `DELETE /api/items/:id` - Delete a menu item (admin/manager only)

### Table Management
- `GET /api/tables` - Get all tables
- `GET /api/tables/:id` - Get a specific table
- `GET /api/tables/status/:status` - Get tables by status
- `POST /api/tables` - Create a new table
- `PUT /api/tables/:id` - Update table details
- `PATCH /api/tables/:id/status` - Update table status
- `DELETE /api/tables/:id` - Delete a table

### Order Management
- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get all orders (with filters)
- `GET /api/orders/:id` - Get a specific order
- `PUT /api/orders/:id` - Update order details
- `PATCH /api/orders/:id/status` - Update order status
- `PATCH /api/orders/:id/complete` - Mark order as completed
- `PATCH /api/orders/:id/cancel` - Cancel an order

### User Management
- `GET /api/auth/users` - Get all users (admin/manager only)
- `GET /api/auth/users/:id` - Get a specific user
- `PUT /api/auth/users/:id` - Update user details
- `DELETE /api/auth/users/:id` - Delete a user (admin only)

### Notifications
- `POST /api/notifications` - Create a notification
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/:id` - Get a specific notification
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/user/:userId/read-all` - Mark all notifications as read
- `GET /api/notifications/user/:userId/unread-count` - Get unread notification count
- `DELETE /api/notifications/:id` - Delete a notification

## Role-Based Access Control

- **Admin**: Full access to all operations
- **Manager**: Can manage menu, tables, orders, and staff
- **Staff**: Can create and manage orders and table status
- **Cashier**: Can complete orders and manage payments

## WebSocket Events

The API supports real-time communication through WebSocket for live updates:

### Client to Server Events
- `order:created` - New order created
- `order:status-changed` - Order status updated
- `table:status-changed` - Table status changed
- `notification:send` - Send notification to user
- `kitchen:item-ready` - Kitchen item ready for service

### Server to Client Events
- `notification` - Receive notifications
- `order-update` - Order status updates
- `table-status` - Table status changes
- `kitchen-update` - Kitchen status updates

## Database Schema

### Tables
- **users**: Staff and admin users
- **menu_categories**: Menu categories for organization
- **menu_items**: Individual menu items
- **tables**: Restaurant tables
- **orders**: Customer orders
- **order_items**: Items within each order
- **notifications**: User notifications
- **payment_logs**: Payment transaction records

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based authorization
- CORS protection
- Helmet for HTTP headers security
- SQL injection prevention through parameterized queries
- WebSocket authentication

## Development

### Project Structure
```
src/
├── config/       # Configuration files
├── controllers/  # Business logic controllers
├── db/          # Database initialization and seeding
├── middleware/  # Express middleware
├── routes/      # API route definitions
├── utils/       # Utility functions
└── server.js    # Main server file
```

### Adding New Features

1. Create a controller in `src/controllers/`
2. Create routes in `src/routes/`
3. Add database operations as needed
4. Mount routes in `src/server.js`

## Testing

To run tests:
```bash
npm test
```

## Deployment

1. Set environment variables on your production server
2. Ensure PostgreSQL is running and accessible
3. Run database migration: `npm run db:migrate`
4. Start the server: `npm start`

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure the database exists: `CREATE DATABASE restaurant_db;`

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill the process using the port: `lsof -ti:5000 | xargs kill -9` (macOS/Linux)

### WebSocket Connection Issues
- Verify `WS_ORIGIN` in `.env` matches client URL
- Check JWT token is valid and included in WebSocket connection

## License

MIT

## Support

For issues and questions, please create an issue in the repository.

## Future Enhancements

- Payment processing integration
- Analytics dashboard
- Inventory management
- Email/SMS notifications
- Multi-location support
- Advanced reporting
