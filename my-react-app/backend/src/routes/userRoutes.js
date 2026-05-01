const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Admin user management routes
router.post('/users', authenticateToken, authorize(['admin']), userController.createUser);

// Protected routes
router.get('/users', authenticateToken, authorize(['admin', 'manager']), userController.getAllUsers);
router.get('/users/:id', authenticateToken, userController.getUserById);
router.put('/users/:id', authenticateToken, userController.updateUser);
router.patch('/users/:id/password', authenticateToken, userController.changePassword);
router.delete('/users/:id', authenticateToken, authorize(['admin']), userController.deleteUser);

module.exports = router;
