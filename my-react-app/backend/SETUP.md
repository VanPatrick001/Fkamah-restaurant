# Quick Start Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 14 or higher
- PostgreSQL 12 or higher
- npm or yarn

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Create PostgreSQL Database

Open PostgreSQL and run:
```sql
CREATE DATABASE restaurant_db;
```

Or from command line:
```bash
createdb restaurant_db
```

### 3. Configure Environment Variables

The `.env` file is already created with default values. Update it with your database credentials if needed:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restaurant_db
DB_USER=postgres
DB_PASSWORD=password
```

### 4. Initialize Database Schema

Run the migration script to create all tables:
```bash
npm run db:migrate
```

### 5. Seed Sample Data (Optional)

Populate the database with sample data:
```bash
npm run db:seed
```

This will create:
- Sample users (admin, manager, staff)
- Menu categories (Appetizers, Main Courses, Desserts, Beverages)
- Sample menu items
- 16 restaurant tables

Default login credentials (after seeding):
- **Admin**: admin@restaurant.com / admin123
- **Manager**: manager@restaurant.com / manager123
- **Staff**: staff@restaurant.com / staff123

### 6. Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:5000`

## Verify Installation

To verify everything is working:

1. **Check health endpoint**:
   ```bash
   curl http://localhost:5000/health
   ```
   Expected response:
   ```json
   {"status":"healthy","timestamp":"2024-12-01T10:00:00.000Z"}
   ```

2. **Test login**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@restaurant.com",
       "password": "admin123"
     }'
   ```

## API Documentation

Full API documentation is available in [API.md](./API.md)

### Key Endpoints

- **Authentication**: `POST /api/auth/login`, `POST /api/auth/register`
- **Menu**: `GET /api/items`, `GET /api/categories`
- **Tables**: `GET /api/tables`, `PATCH /api/tables/:id/status`
- **Orders**: `POST /api/orders`, `GET /api/orders`, `PATCH /api/orders/:id/status`
- **Notifications**: `GET /api/notifications`, `PATCH /api/notifications/:id/read`

## WebSocket Connection

To connect via WebSocket (JavaScript example):

```javascript
const { io } = require('socket.io-client');

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token_here'
  }
});

// Listen for real-time updates
socket.on('notification', (data) => {
  console.log('Notification:', data);
});

socket.on('order-update', (data) => {
  console.log('Order updated:', data);
});
```

## Troubleshooting

### Issue: Database connection failed
**Solution**: 
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -l | grep restaurant_db`

### Issue: Port 5000 is already in use
**Solution**: 
- Change PORT in `.env` file
- Or kill the process: `lsof -ti:5000 | xargs kill -9` (macOS/Linux)

### Issue: WebSocket connection fails
**Solution**:
- Verify JWT token is valid
- Check `WS_ORIGIN` setting in `.env`
- Ensure WebSocket connection includes auth token

### Issue: "Module not found" error
**Solution**:
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then reinstall
- Check that all files are in the correct directories

## Next Steps

1. Review [README.md](./README.md) for detailed project information
2. Check [API.md](./API.md) for complete endpoint documentation
3. Customize the `.env` file for your environment
4. Add test cases in your test directory
5. Connect your frontend application to the API

## Support

For issues or questions, refer to:
- [README.md](./README.md) - Full project documentation
- [API.md](./API.md) - Detailed API reference
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - Development guidelines
