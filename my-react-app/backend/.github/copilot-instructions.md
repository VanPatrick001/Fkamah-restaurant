# Restaurant Management Backend API - Copilot Instructions

## Project Overview

This is a production-ready Node.js backend API for restaurant management built with Express, PostgreSQL, and real-time WebSocket support.

## Technology Stack

- **Runtime**: Node.js 14+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Real-time**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **Encryption**: bcryptjs for password hashing
- **Security**: Helmet, CORS

## Getting Started

1. Install dependencies: `npm install`
2. Configure `.env` file with database credentials
3. Initialize database: `npm run db:migrate`
4. Seed sample data: `npm run db:seed` (optional)
5. Start development server: `npm run dev`
6. Server runs on port 5000

## Project Structure

- `src/config/` - Database configuration
- `src/controllers/` - Business logic for each entity
- `src/db/` - Database initialization and seeding
- `src/middleware/` - Authentication and authorization
- `src/routes/` - API endpoint definitions
- `src/utils/` - Helper functions and utilities
- `src/server.js` - Main application entry point

## Available Scripts

- `npm start` - Run production server
- `npm run dev` - Run development server with auto-reload
- `npm run db:migrate` - Initialize database schema
- `npm run db:seed` - Populate database with sample data

## Key Features

- **Authentication**: JWT-based user authentication with role-based access control
- **CRUD Operations**: Full Create, Read, Update, Delete for all entities
- **Real-time Updates**: WebSocket connections for instant notifications and order updates
- **Database Relationships**: Proper foreign keys and constraints for data integrity
- **Error Handling**: Comprehensive error handling with meaningful HTTP status codes

## API Base URL

`http://localhost:5000/api`

## Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Entity Models

### Users
- ID, email, password (hashed), name, role, phone, timestamps

### Menu Items
- ID, category, name, description, price, preparation time, dietary info

### Tables
- ID, table number, capacity, section, status, QR code

### Orders
- ID, table reference, user reference, status, amounts, items, timestamps

### Notifications
- ID, user reference, type, message, order reference, read status

## Common Challenges & Solutions

1. **Database Connection**: Ensure PostgreSQL is running and credentials are correct in `.env`
2. **CORS Issues**: Configure `CORS_ORIGIN` in `.env` to match frontend URL
3. **WebSocket Connection**: Verify client sends valid JWT in socket handshake
4. **Port Conflicts**: Change `PORT` variable if 5000 is already in use

## Development Notes

- Use parameterized queries to prevent SQL injection
- Always validate and sanitize user input
- Test all endpoint with various user roles
- Keep WebSocket events organized by type
- Update timestamps for audit trails
