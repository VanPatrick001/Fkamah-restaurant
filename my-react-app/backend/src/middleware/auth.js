const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (req.session?.userId) {
    try {
      const result = await pool.query(
        `SELECT id, email, first_name, last_name, role, phone, is_active
         FROM users WHERE id = $1`,
        [req.session.userId]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      req.user = result.rows[0];
      return next();
    } catch (error) {
      console.error('Session auth error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (token) {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      req.user = user;
      return next();
    } catch (error) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  }

  return res.status(401).json({ error: 'Access token or session required' });
};

const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = { authenticateToken, authorize };
