// backend/services/socketService.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        // Allow anonymous connections with limited access
        socket.isAuthenticated = false;
        return next();
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      socket.userId = user._id;
      socket.userRole = user.role;
      socket.isAuthenticated = true;
      
      next();
    } catch (error) {
      socket.isAuthenticated = false;
      next();
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}, Authenticated: ${socket.isAuthenticated}`);
    
    // Join user-specific room if authenticated
    if (socket.isAuthenticated) {
      socket.join(`user:${socket.userId}`);
      
      if (socket.userRole === 'admin') {
        socket.join('admin');
      }
    }
    
    // Join market data room
    socket.join('market-data');
    
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
  
  return io;
};

// Broadcast stock price update
const broadcastStockUpdate = (stockData) => {
  if (io) {
    io.to('market-data').emit('stock:update', stockData);
  }
};

// Broadcast IPO update
const broadcastIPOUpdate = (ipoData) => {
  if (io) {
    io.to('market-data').emit('ipo:update', ipoData);
  }
};

// Send notification to specific user
const sendUserNotification = (userId, notification) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
};

// Broadcast to all admins
const broadcastToAdmins = (event, data) => {
  if (io) {
    io.to('admin').emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  broadcastStockUpdate,
  broadcastIPOUpdate,
  sendUserNotification,
  broadcastToAdmins
};