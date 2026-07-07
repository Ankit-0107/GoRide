const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Ride = require('../models/Ride');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const rides = await Ride.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, user, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Update current user profile
router.put('/me', protect, async (req, res) => {
  try {
    const { name, username, bio, isPublic } = req.body;
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (username !== undefined) updateFields.username = username;
    if (bio !== undefined) updateFields.bio = bio;
    if (isPublic !== undefined) updateFields.isPublic = isPublic;

    const user = await User.findByIdAndUpdate(req.user.id, updateFields, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get user profile by ID
router.get('/user/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Check if we follow this user
    const followRecord = await Follow.findOne({ follower: req.user.id, following: req.params.id });
    const isFollowing = followRecord && followRecord.status === 'accepted';
    const hasRequested = followRecord && followRecord.status === 'pending';

    let rides = [];
    // Only show rides if public, or if it's the same user, or if we are following
    if (user.isPublic || isFollowing || req.user.id === user._id.toString()) {
      rides = await Ride.find({ user: user._id }).sort({ createdAt: -1 });
    }
    
    res.json({ success: true, user, rides, isFollowing, hasRequested });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Follow a user
router.post('/follow/:id', protect, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const existingFollow = await Follow.findOne({ follower: req.user.id, following: req.params.id });
    if (existingFollow) {
      return res.status(400).json({ success: false, message: 'Already following or requested' });
    }

    const status = targetUser.isPublic ? 'accepted' : 'pending';
    
    const follow = await Follow.create({
      follower: req.user.id,
      following: req.params.id,
      status
    });

    if (status === 'accepted') {
      await User.findByIdAndUpdate(req.params.id, { $inc: { followersCount: 1 } });
      await User.findByIdAndUpdate(req.user.id, { $inc: { followingCount: 1 } });
      
      // Notify target user
      await Notification.create({
        recipient: req.params.id,
        sender: req.user.id,
        type: 'system',
        message: `${req.user.name} started following you`,
        link: `/user/${req.user.id}`
      });
      // Try to emit via socket if online
      if (req.app.locals.io) {
         req.app.locals.io.sendNotification(req.params.id, { message: `${req.user.name} started following you` });
      }
    } else {
      // Notify target user of request
      await Notification.create({
        recipient: req.params.id,
        sender: req.user.id,
        type: 'follow_request',
        message: `${req.user.name} requested to follow you`,
        link: `/user/${req.user.id}`
      });
      if (req.app.locals.io) {
         req.app.locals.io.sendNotification(req.params.id, { message: `${req.user.name} requested to follow you` });
      }
    }

    res.json({ success: true, status, follow });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Unfollow a user
router.post('/unfollow/:id', protect, async (req, res) => {
  try {
    const follow = await Follow.findOneAndDelete({ follower: req.user.id, following: req.params.id });
    if (follow && follow.status === 'accepted') {
      await User.findByIdAndUpdate(req.params.id, { $inc: { followersCount: -1 } });
      await User.findByIdAndUpdate(req.user.id, { $inc: { followingCount: -1 } });
    }
    res.json({ success: true, message: 'Unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Accept follow request
router.post('/accept-follow/:followerId', protect, async (req, res) => {
  try {
    const follow = await Follow.findOneAndUpdate(
      { follower: req.params.followerId, following: req.user.id, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    );
    if (!follow) return res.status(404).json({ success: false, message: 'Request not found' });

    await User.findByIdAndUpdate(req.user.id, { $inc: { followersCount: 1 } });
    await User.findByIdAndUpdate(req.params.followerId, { $inc: { followingCount: 1 } });

    await Notification.create({
      recipient: req.params.followerId,
      sender: req.user.id,
      type: 'follow_accept',
      message: `${req.user.name} accepted your follow request`,
      link: `/user/${req.user.id}`
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Reject/Cancel follow request
router.post('/reject-follow/:followerId', protect, async (req, res) => {
  try {
    await Follow.findOneAndDelete({ follower: req.params.followerId, following: req.user.id, status: 'pending' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get follow requests
router.get('/follow-requests', protect, async (req, res) => {
  try {
    const requests = await Follow.find({ following: req.user.id, status: 'pending' }).populate('follower', 'name username avatar isPublic');
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get followers
router.get('/followers/:id', protect, async (req, res) => {
  try {
    const follows = await Follow.find({ following: req.params.id, status: 'accepted' }).populate('follower', 'name username avatar isPublic');
    res.json({ success: true, users: follows.map(f => f.follower) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get following
router.get('/following/:id', protect, async (req, res) => {
  try {
    const follows = await Follow.find({ follower: req.params.id, status: 'accepted' }).populate('following', 'name username avatar isPublic');
    res.json({ success: true, users: follows.map(f => f.following) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Search users
router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, users: [] });
    
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } }
      ]
    }).select('name username avatar isPublic');
    
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
