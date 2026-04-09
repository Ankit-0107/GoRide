const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Ride = require('../models/Ride');
const Message = require('../models/Message');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All routes in this file require admin privileges
router.use(protect, adminOnly);

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard stats
 */
router.get('/stats', async (req, res) => {
  try {
    const [userCount, rideCount, messageCount] = await Promise.all([
      User.countDocuments(),
      Ride.countDocuments(),
      Message.countDocuments(),
    ]);
    res.json({ success: true, stats: { users: userCount, rides: rideCount, messages: messageCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own admin account' });
    }

    await User.findByIdAndDelete(req.params.id);
    // Also clean up their messages
    await Message.deleteMany({ $or: [{ senderId: req.params.id }, { receiverId: req.params.id }] });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update a user's role
 */
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be "user" or "admin".' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.role = role;
    await user.save();
    res.json({ success: true, message: `User role updated to ${role}`, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/admin/rides
 * @desc    Get all rides (admin view)
 */
router.get('/rides', async (req, res) => {
  try {
    const rides = await Ride.find().sort({ createdAt: -1 });
    res.json({ success: true, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/admin/rides/:id
 * @desc    Delete any ride (admin)
 */
router.delete('/rides/:id', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    await Ride.findByIdAndDelete(req.params.id);
    // Also delete ride-related messages
    await Message.deleteMany({ rideId: req.params.id });

    res.json({ success: true, message: 'Ride and associated messages deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/admin/messages
 * @desc    Get all messages (admin view)
 */
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/admin/messages/:id
 * @desc    Delete a specific message
 */
router.delete('/messages/:id', async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });

    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/admin/messages/clear-all
 * @desc    Delete ALL messages (nuclear option)
 */
router.delete('/messages-clear-all', async (req, res) => {
  try {
    const result = await Message.deleteMany({});
    res.json({ success: true, message: `Deleted ${result.deletedCount} messages` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
