const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Public routes - read access
router.get('/tables', authenticateToken, tableController.getAllTables);
router.get('/tables/:id', authenticateToken, tableController.getTableById);
router.get('/tables/status/:status', authenticateToken, tableController.getTablesByStatus);

// Protected routes - staff and above
router.post('/tables', authenticateToken, authorize(['admin', 'manager', 'staff']), tableController.createTable);
router.put('/tables/:id', authenticateToken, authorize(['admin', 'manager', 'staff']), tableController.updateTable);
router.patch('/tables/:id/status', authenticateToken, authorize(['admin', 'manager', 'staff']), tableController.updateTableStatus);
router.delete('/tables/:id', authenticateToken, authorize(['admin', 'manager']), tableController.deleteTable);

module.exports = router;
