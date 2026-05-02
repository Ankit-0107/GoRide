const rideService = require('../services/rideService');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

/**
 * Socket.io Event Handlers
 * Manages real-time communication between server and clients
 */

// Track online users: Map<userId, Set<socketId>>
const onlineUsers = new Map();

const setupSocketHandlers = (io) => {

  // Authentication middleware for sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          socket.userId = user._id.toString();
          socket.userName = user.name;
          return next();
        }
      }
      // Allow unauthenticated connections (for guests viewing rides)
      socket.userId = null;
      socket.userName = 'Guest';
      next();
    } catch (err) {
      socket.userId = null;
      socket.userName = 'Guest';
      next();
    }
  });

  io.on('connection', async (socket) => {
    console.log(`✅ Client connected: ${socket.id} (${socket.userName})`);

    // ───────────────────────────────────────
    // ONLINE STATUS
    // ───────────────────────────────────────
    if (socket.userId) {
      // Track this socket for the user
      if (!onlineUsers.has(socket.userId)) {
        onlineUsers.set(socket.userId, new Set());
      }
      onlineUsers.get(socket.userId).add(socket.id);

      // Mark user online in DB
      await User.findByIdAndUpdate(socket.userId, { isOnline: true, lastSeen: new Date() });

      // Broadcast to all: this user is now online
      io.emit('userOnline', { userId: socket.userId, userName: socket.userName });
    }

    /**
     * Get all currently online user IDs
     */
    socket.on('getOnlineUsers', () => {
      const online = Array.from(onlineUsers.keys());
      socket.emit('onlineUsers', online);
    });

    // ───────────────────────────────────────
    // TYPING INDICATORS
    // ───────────────────────────────────────
    
    /**
     * User started typing in a chat
     * data: { chatType: 'user'|'community'|'ride', targetId: string }
     */
    socket.on('typing:start', (data) => {
      const { chatType, targetId } = data;
      if (chatType === 'user' && targetId) {
        // 1-on-1: emit only to the target user's sockets
        const targetSockets = onlineUsers.get(targetId);
        if (targetSockets) {
          targetSockets.forEach(sid => {
            io.to(sid).emit('typing:update', {
              userId: socket.userId,
              userName: socket.userName,
              chatType,
              targetId,
              isTyping: true,
            });
          });
        }
      } else if (chatType === 'community') {
        // Community: broadcast to all except sender
        socket.broadcast.emit('typing:update', {
          userId: socket.userId,
          userName: socket.userName,
          chatType,
          targetId: 'global',
          isTyping: true,
        });
      } else if (chatType === 'ride' && targetId) {
        // Ride room: broadcast to ride room except sender
        socket.to(`ride:${targetId}`).emit('typing:update', {
          userId: socket.userId,
          userName: socket.userName,
          chatType,
          targetId,
          isTyping: true,
        });
      }
    });

    /**
     * User stopped typing
     */
    socket.on('typing:stop', (data) => {
      const { chatType, targetId } = data;
      if (chatType === 'user' && targetId) {
        const targetSockets = onlineUsers.get(targetId);
        if (targetSockets) {
          targetSockets.forEach(sid => {
            io.to(sid).emit('typing:update', {
              userId: socket.userId,
              userName: socket.userName,
              chatType,
              targetId,
              isTyping: false,
            });
          });
        }
      } else if (chatType === 'community') {
        socket.broadcast.emit('typing:update', {
          userId: socket.userId,
          userName: socket.userName,
          chatType,
          targetId: 'global',
          isTyping: false,
        });
      } else if (chatType === 'ride' && targetId) {
        socket.to(`ride:${targetId}`).emit('typing:update', {
          userId: socket.userId,
          userName: socket.userName,
          chatType,
          targetId,
          isTyping: false,
        });
      }
    });

    // ───────────────────────────────────────
    // REAL-TIME NOTIFICATIONS
    // ───────────────────────────────────────
    
    /**
     * Join personal notification room
     */
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // ───────────────────────────────────────
    // RIDE EVENTS (existing)
    // ───────────────────────────────────────

    /**
     * Join a ride room for real-time updates
     */
    socket.on('joinRideRoom', (rideId) => {
      socket.join(`ride:${rideId}`);
      console.log(`👥 Client ${socket.id} joined ride room: ${rideId}`);
    });

    /**
     * Leave a ride room
     */
    socket.on('leaveRideRoom', (rideId) => {
      socket.leave(`ride:${rideId}`);
      console.log(`👋 Client ${socket.id} left ride room: ${rideId}`);
    });

    /**
     * Handle real-time location updates from vehicle
     */
    socket.on('vehicleLocationUpdate', async (data) => {
      const { rideId, location } = data;

      try {
        const result = await rideService.updateVehicleLocation(rideId, location);

        if (result.success) {
          io.to(`ride:${rideId}`).emit('locationUpdated', {
            rideId,
            location: result.ride.location,
            route: result.ride.route,
            timestamp: new Date()
          });

          console.log(`📍 Location updated for ride ${rideId}`);
        }
      } catch (error) {
        console.error('Socket location update error:', error);
        socket.emit('error', {
          message: 'Failed to update location'
        });
      }
    });

    /**
     * Handle new user joining the ride
     */
    socket.on('userJoined', async (data) => {
      const { rideId } = data;

      try {
        const result = await rideService.getRideById(rideId);

        if (result.success) {
          io.to(`ride:${rideId}`).emit('routeUpdated', {
            rideId,
            route: result.ride.route,
            waypoints: result.ride.waypoints,
            timestamp: new Date()
          });

          console.log(`🎉 New user joined ride ${rideId}`);
        }
      } catch (error) {
        console.error('Socket user joined error:', error);
      }
    });

    /**
     * Handle ride completion
     */
    socket.on('rideCompleted', (data) => {
      const { rideId } = data;

      io.to(`ride:${rideId}`).emit('rideEnded', {
        rideId,
        message: 'Ride has been completed',
        timestamp: new Date()
      });

      console.log(`🏁 Ride ${rideId} completed`);
    });

    /**
     * Handle new scheduled ride
     */
    socket.on('rideScheduled', (ride) => {
      socket.broadcast.emit('rideScheduled', ride);
      console.log(`📅 New ride scheduled: ${ride.title}`);
    });

    /**
     * Handle ride starting
     */
    socket.on('rideStarted', (rideId) => {
      io.emit('rideStarted', { rideId });
      console.log(`🚀 Ride started: ${rideId}`);
    });

    // ───────────────────────────────────────
    // DISCONNECT
    // ───────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`❌ Client disconnected: ${socket.id} (${socket.userName})`);

      if (socket.userId) {
        // Remove this socket from user's connections
        const userSockets = onlineUsers.get(socket.userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          // If no more sockets, mark offline
          if (userSockets.size === 0) {
            onlineUsers.delete(socket.userId);
            await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: new Date() });
            io.emit('userOffline', { userId: socket.userId });
          }
        }
      }
    });

  });

  // Helper: send notification to a specific user in real-time
  io.sendNotification = (userId, notification) => {
    io.to(`user:${userId}`).emit('notification', notification);
  };

  return io;
};

module.exports = setupSocketHandlers;
