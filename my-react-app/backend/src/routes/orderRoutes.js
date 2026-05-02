const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, authorize } = require('../middleware/auth');

// All order routes require authentication
router.post('/orders', authenticateToken, authorize(['admin', 'manager', 'waiter', 'cashier']), orderController.createOrder);
router.get('/orders', authenticateToken, orderController.getAllOrders);
router.get('/orders/:id', authenticateToken, orderController.getOrderById);
router.put('/orders/:id', authenticateToken, authorize(['admin', 'manager', 'waiter']), orderController.updateOrder);
router.patch('/orders/:id/status', authenticateToken, authorize(['admin', 'manager', 'waiter']), orderController.updateOrderStatus);
router.patch('/orders/:id/payment', authenticateToken, authorize(['admin', 'manager', 'cashier']), orderController.updatePaymentStatus);
router.patch('/orders/:id/complete', authenticateToken, authorize(['admin', 'manager', 'staff', 'cashier']), orderController.completeOrder);
router.patch('/orders/:id/cancel', authenticateToken, authorize(['admin', 'manager', 'staff']), orderController.cancelOrder);
router.delete('/orders/:id', authenticateToken, authorize(['admin', 'manager', 'waiter', 'cashier']), orderController.deleteOrder);

module.exports = router;
