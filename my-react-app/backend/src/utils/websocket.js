const { verifyToken } = require('../utils/jwt');

const setupWebSocket = (io, sessionMiddleware) => {
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, async () => {
      const session = socket.request.session;
      if (session && session.userId) {
        socket.userId = session.userId;
        socket.userRole = session.userRole;
        return next();
      }

      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication failed'));
      }

      const user = verifyToken(token);
      if (!user) {
        return next(new Error('Invalid token'));
      }

      socket.userId = user.id;
      socket.userRole = user.role;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    if (socket.userId) {
      socket.join(`user-${socket.userId}`);
    }
    if (socket.userRole) {
      socket.join(`role-${socket.userRole}`);
    }

    socket.on('order:created', (data) => {
      io.to('role-manager').to('role-admin').emit('notification', {
        type: 'order_update',
        title: 'New Order',
        message: `New order created for table ${data.tableNumber}`,
        orderId: data.orderId,
        timestamp: new Date(),
      });
    });

    socket.on('order:status-changed', (data) => {
      io.to('role-staff').to('role-cashier').emit('order-update', {
        orderId: data.orderId,
        status: data.status,
        timestamp: new Date(),
      });
    });

    socket.on('table:status-changed', (data) => {
      io.emit('table-status', {
        tableId: data.tableId,
        status: data.status,
        timestamp: new Date(),
      });
    });

    socket.on('notification:send', (data) => {
      const { recipientId, type, title, message } = data;
      io.to(`user-${recipientId}`).emit('notification', {
        type,
        title,
        message,
        timestamp: new Date(),
      });
    });

    socket.on('kitchen:item-ready', (data) => {
      io.to('role-staff').to('role-manager').emit('kitchen-update', {
        orderId: data.orderId,
        itemId: data.itemId,
        message: 'Item ready for serving',
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });

    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  return io;
};

module.exports = { setupWebSocket };
