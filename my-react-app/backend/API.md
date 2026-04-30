# Restaurant Management API - Detailed Endpoint Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### Register User
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "staff" // Optional: admin, manager, staff, cashier (default: staff)
}

Response: 201 Created
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "staff"
  },
  "token": "jwt_token"
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "staff"
  },
  "token": "jwt_token"
}
```

## User Management (Requires Auth)

### Get All Users
```
GET /auth/users
Headers: Authorization: Bearer <token>
Query: none

Response: 200 OK
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "staff",
    "phone": "123-456-7890",
    "is_active": true,
    "created_at": "2024-12-01T10:00:00Z"
  }
]
```

### Get User by ID
```
GET /auth/users/:id
Headers: Authorization: Bearer <token>
```

### Update User
```
PUT /auth/users/:id
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "manager",
  "phone": "987-654-3210",
  "isActive": true
}

Response: 200 OK
```

### Delete User
```
DELETE /auth/users/:id
Headers: Authorization: Bearer <token>
(Admin only)
```

## Menu Management

### Get All Categories
```
GET /categories
(Public access)

Response: 200 OK
[
  {
    "id": "uuid",
    "name": "Appetizers",
    "description": "Delicious appetizers",
    "image_url": "url",
    "display_order": 1,
    "is_active": true,
    "created_at": "2024-12-01T10:00:00Z"
  }
]
```

### Create Category
```
POST /categories
Headers: Authorization: Bearer <token>
Content-Type: application/json
(Admin/Manager only)

{
  "name": "Appetizers",
  "description": "Starting dishes",
  "imageUrl": "url",
  "displayOrder": 1
}

Response: 201 Created
```

### Get All Menu Items
```
GET /items
Query Parameters:
  - categoryId (optional): Filter by category

Response: 200 OK
[
  {
    "id": "uuid",
    "category_id": "uuid",
    "name": "Spring Rolls",
    "description": "Crispy spring rolls",
    "price": 5.99,
    "image_url": "url",
    "preparation_time": 15,
    "is_available": true,
    "is_vegetarian": true,
    "is_vegan": false,
    "created_at": "2024-12-01T10:00:00Z"
  }
]
```

### Get Menu Item by ID
```
GET /items/:id
Response: 200 OK
```

### Create Menu Item
```
POST /items
Headers: Authorization: Bearer <token>
Content-Type: application/json
(Admin/Manager only)

{
  "categoryId": "uuid",
  "name": "Spring Rolls",
  "description": "Crispy spring rolls",
  "price": 5.99,
  "imageUrl": "url",
  "preparationTime": 15,
  "isVegetarian": true,
  "isVegan": false
}

Response: 201 Created
```

### Update Menu Item
```
PUT /items/:id
Headers: Authorization: Bearer <token>
(Admin/Manager only)

{
  "name": "Premium Spring Rolls",
  "price": 7.99,
  "isAvailable": true
}

Response: 200 OK
```

### Delete Menu Item
```
DELETE /items/:id
Headers: Authorization: Bearer <token>
(Admin/Manager only)
```

## Table Management

### Get All Tables
```
GET /tables
Headers: Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "uuid",
    "table_number": 1,
    "capacity": 4,
    "section": "A",
    "status": "available",
    "qr_code": "url",
    "created_at": "2024-12-01T10:00:00Z"
  }
]
```

### Get Tables by Status
```
GET /tables/status/:status
Headers: Authorization: Bearer <token>
Valid statuses: available, occupied, reserved, maintenance
```

### Get Table by ID
```
GET /tables/:id
Headers: Authorization: Bearer <token>
```

### Create Table
```
POST /tables
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "tableNumber": 5,
  "capacity": 4,
  "section": "B",
  "qrCode": "url"
}

Response: 201 Created
```

### Update Table
```
PUT /tables/:id
Headers: Authorization: Bearer <token>

{
  "tableNumber": 5,
  "capacity": 4,
  "section": "B"
}

Response: 200 OK
```

### Update Table Status
```
PATCH /tables/:id/status
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "occupied" // available, occupied, reserved, maintenance
}

Response: 200 OK
```

### Delete Table
```
DELETE /tables/:id
Headers: Authorization: Bearer <token>
(Admin/Manager only)
```

## Order Management

### Create Order
```
POST /orders
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "tableId": "uuid",
  "userId": "uuid",
  "items": [
    {
      "menuItemId": "uuid",
      "quantity": 2,
      "specialInstructions": "No onions"
    }
  ],
  "notes": "Party of 4"
}

Response: 201 Created
{
  "id": "uuid",
  "table_id": "uuid",
  "user_id": "uuid",
  "status": "pending",
  "total_amount": 15.98,
  "items": [...]
}
```

### Get All Orders
```
GET /orders
Headers: Authorization: Bearer <token>
Query Parameters:
  - status (optional): pending, confirmed, preparing, ready, served, completed, cancelled
  - tableId (optional): Filter by table

Response: 200 OK
[
  {
    "id": "uuid",
    "table_id": "uuid",
    "user_id": "uuid",
    "status": "pending",
    "total_amount": 15.98,
    "tax_amount": 2.50,
    "discount_amount": 0,
    "items": [...]
  }
]
```

### Get Order by ID
```
GET /orders/:id
Headers: Authorization: Bearer <token>

Response: 200 OK
```

### Update Order
```
PUT /orders/:id
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed",
  "totalAmount": 18.50,
  "taxAmount": 2.50,
  "discountAmount": 0,
  "notes": "Updated notes"
}

Response: 200 OK
```

### Update Order Status
```
PATCH /orders/:id/status
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "preparing" // pending, confirmed, preparing, ready, served, completed, cancelled
}

Response: 200 OK
```

### Complete Order
```
PATCH /orders/:id/complete
Headers: Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Order completed successfully"
}
```

### Cancel Order
```
PATCH /orders/:id/cancel
Headers: Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Order cancelled successfully"
}
```

## Notifications

### Create Notification
```
POST /notifications
Headers: Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "uuid",
  "type": "order_update", // order_update, table_status, alert, system
  "title": "Order Ready",
  "message": "Your order is ready for serving",
  "orderId": "uuid" // Optional
}

Response: 201 Created
```

### Get Notifications
```
GET /notifications
Headers: Authorization: Bearer <token>
Query Parameters:
  - userId (optional): Filter by user
  - isRead (optional): true/false

Response: 200 OK
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "type": "order_update",
    "title": "Order Ready",
    "message": "Your order is ready",
    "is_read": false,
    "created_at": "2024-12-01T10:30:00Z"
  }
]
```

### Get Notification by ID
```
GET /notifications/:id
Headers: Authorization: Bearer <token>
```

### Mark Notification as Read
```
PATCH /notifications/:id/read
Headers: Authorization: Bearer <token>

Response: 200 OK
```

### Mark All Notifications as Read
```
PATCH /notifications/user/:userId/read-all
Headers: Authorization: Bearer <token>

Response: 200 OK
{
  "message": "All notifications marked as read"
}
```

### Get Unread Count
```
GET /notifications/user/:userId/unread-count
Headers: Authorization: Bearer <token>

Response: 200 OK
{
  "unreadCount": 5
}
```

### Delete Notification
```
DELETE /notifications/:id
Headers: Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Notification deleted successfully"
}
```

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Client Events (Emit)
```javascript
// New order created
socket.emit('order:created', {
  orderId: 'uuid',
  tableNumber: 5
});

// Order status changed
socket.emit('order:status-changed', {
  orderId: 'uuid',
  status: 'preparing'
});

// Table status changed
socket.emit('table:status-changed', {
  tableId: 'uuid',
  status: 'occupied'
});

// Send notification
socket.emit('notification:send', {
  recipientId: 'uuid',
  type: 'order_update',
  title: 'Order Ready',
  message: 'Your order is ready for serving'
});

// Kitchen item ready
socket.emit('kitchen:item-ready', {
  orderId: 'uuid',
  itemId: 'uuid'
});
```

### Server Events (Listen)
```javascript
// Receive notification
socket.on('notification', (data) => {
  console.log('New notification:', data);
});

// Order update
socket.on('order-update', (data) => {
  console.log('Order updated:', data);
});

// Table status update
socket.on('table-status', (data) => {
  console.log('Table status:', data);
});

// Kitchen update
socket.on('kitchen-update', (data) => {
  console.log('Kitchen update:', data);
});

// Error handler
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message describing the issue"
}
```

Common HTTP Status Codes:
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input or missing required fields
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions for the action
- `404 Not Found` - Resource not found
- `409 Conflict` - Conflict (e.g., duplicate email)
- `500 Internal Server Error` - Server error
