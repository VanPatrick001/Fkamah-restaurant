const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.get('/groups', authenticateToken, authorize(['admin', 'manager']), groupController.getAllGroups);
router.post('/groups', authenticateToken, authorize(['admin']), groupController.createGroup);
router.post('/groups/:id/users', authenticateToken, authorize(['admin']), groupController.assignUsersToGroup);
router.get('/groups/user/:id', authenticateToken, authorize(['admin', 'manager']), groupController.getUserGroups);

module.exports = router;
