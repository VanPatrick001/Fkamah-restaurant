const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Public routes - read access
router.get('/categories', menuController.getAllCategories);
router.get('/items', menuController.getAllMenuItems);
router.get('/items/:id', menuController.getMenuItemById);

// Protected routes - admin/manager/cook for menu item management
router.post('/categories', authenticateToken, authorize(['admin', 'manager']), menuController.createCategory);
router.post('/items', authenticateToken, authorize(['admin', 'manager', 'cook']), menuController.createMenuItem);
router.put('/items/:id', authenticateToken, authorize(['admin', 'manager', 'cook']), menuController.updateMenuItem);
router.delete('/items/:id', authenticateToken, authorize(['admin', 'manager', 'cook']), menuController.deleteMenuItem);

module.exports = router;
