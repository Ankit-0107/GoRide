const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const Ride = require('../models/Ride');
const { protect } = require('../middleware/authMiddleware');

// All profile routes require authentication
router.use(protect);

/**
 * @route   GET /api/profile/me
 * @desc    Get current user's full profile
 */
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Get ride history
    const rides = await Ride.find({
      $or: [
        { createdByName: user.name },
        { 'waypoints.userName': user.name }
      ]
    }).sort({ createdAt: -1 }).limit(50);

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        isPublic: user.isPublic,
        role: user.role,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        ridesCompleted: user.ridesCompleted,
        totalDistance: user.totalDistance,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
      },
      rides,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/profile/me
 * @desc    Update current user's profile
 */
router.put('/me', async (req, res) => {
  try {
    const { name, username, bio, avatar, isPublic } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check username uniqueness if changing
    if (username && username !== user.username) {
      const existing = await User.findOne({ username: username.toLowerCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Username already taken' });
      }
      user.username = username;
    }

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (isPublic !== undefined) {
      const wasPrivate = !user.isPublic;
      user.isPublic = isPublic;

      // If switching from private to public, auto-accept all pending follow requests
      if (isPublic && wasPrivate) {
        const pendingRequests = await Follow.find({ following: user._id, status: 'pending' });
        for (const req of pendingRequests) {
          req.status = 'accepted';
          await req.save();
          user.followersCount += 1;

          // Update the follower's following count
          await User.findByIdAndUpdate(req.follower, { $inc: { followingCount: 1 } });

          // Notify the requester that their request was accepted
          await Notification.create({
            recipient: req.follower,
            sender: user._id,
            senderName: user.name,
            senderAvatar: user.avatar,
            type: 'follow_accepted',
            content: `${user.name} accepted your follow request`,
          });
        }
      }
    }

    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        isPublic: user.isPublic,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/profile/search?q=term
 * @desc    Search users by name or username
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, users: [] });
    }

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
      ]
    }).select('name username avatar bio isPublic followersCount isOnline').limit(20);

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/profile/user/:id
 * @desc    View another user's profile (respects privacy)
 */
router.get('/user/:id', async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id).select('-password -email');
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const myId = req.user._id;

    // Check follow relationship
    const followDoc = await Follow.findOne({ follower: myId, following: targetUser._id });
    let followStatus = 'none'; // none | pending | following
    if (followDoc) {
      followStatus = followDoc.status === 'accepted' ? 'following' : 'pending';
    }

    // Check if they follow me
    const followsMe = await Follow.findOne({ follower: targetUser._id, following: myId, status: 'accepted' });

    // Determine what to show
    const isOwn = myId.toString() === targetUser._id.toString();
    const canSeeProfile = targetUser.isPublic || followStatus === 'following' || isOwn;

    let rides = [];
    if (canSeeProfile) {
      rides = await Ride.find({
        $or: [
          { createdByName: targetUser.name },
          { 'waypoints.userName': targetUser.name }
        ]
      }).sort({ createdAt: -1 }).limit(30);
    }

    res.json({
      success: true,
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        username: targetUser.username,
        bio: targetUser.bio,
        avatar: targetUser.avatar,
        isPublic: targetUser.isPublic,
        followersCount: targetUser.followersCount,
        followingCount: targetUser.followingCount,
        ridesCompleted: targetUser.ridesCompleted,
        totalDistance: targetUser.totalDistance,
        isOnline: targetUser.isOnline,
        lastSeen: targetUser.lastSeen,
        createdAt: targetUser.createdAt,
      },
      followStatus,
      followsMe: !!followsMe,
      canSeeProfile,
      rides,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/profile/follow/:id
 * @desc    Follow a user (or send follow request if private)
 */
router.post('/follow/:id', async (req, res) => {
  try {
    const myId = req.user._id;
    const targetId = req.params.id;

    if (myId.toString() === targetId) {
      return res.status(400).json({ success: false, message: "You can't follow yourself" });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    // Check if already following or request pending
    const existing = await Follow.findOne({ follower: myId, following: targetId });
    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'Already following' });
      } else {
        return res.status(400).json({ success: false, message: 'Follow request already pending' });
      }
    }

    const me = await User.findById(myId);

    if (targetUser.isPublic) {
      // Public profile: instant follow
      await Follow.create({ follower: myId, following: targetId, status: 'accepted' });
      targetUser.followersCount += 1;
      me.followingCount += 1;
      await targetUser.save();
      await me.save();

      // Notify
      await Notification.create({
        recipient: targetId,
        sender: myId,
        senderName: me.name,
        senderAvatar: me.avatar,
        type: 'follow',
        content: `${me.name} started following you`,
        referenceId: myId,
        referenceModel: 'User',
      });

      res.json({ success: true, status: 'following', message: `You are now following ${targetUser.name}` });
    } else {
      // Private profile: send follow request
      await Follow.create({ follower: myId, following: targetId, status: 'pending' });

      // Notify
      await Notification.create({
        recipient: targetId,
        sender: myId,
        senderName: me.name,
        senderAvatar: me.avatar,
        type: 'follow_request',
        content: `${me.name} requested to follow you`,
        referenceId: myId,
        referenceModel: 'User',
      });

      res.json({ success: true, status: 'pending', message: `Follow request sent to ${targetUser.name}` });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/profile/unfollow/:id
 * @desc    Unfollow a user (or cancel pending request)
 */
router.post('/unfollow/:id', async (req, res) => {
  try {
    const myId = req.user._id;
    const targetId = req.params.id;

    const followDoc = await Follow.findOne({ follower: myId, following: targetId });
    if (!followDoc) {
      return res.status(400).json({ success: false, message: 'Not following this user' });
    }

    const wasAccepted = followDoc.status === 'accepted';
    await Follow.findByIdAndDelete(followDoc._id);

    if (wasAccepted) {
      await User.findByIdAndUpdate(targetId, { $inc: { followersCount: -1 } });
      await User.findByIdAndUpdate(myId, { $inc: { followingCount: -1 } });
    }

    res.json({ success: true, message: 'Unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/profile/accept/:id
 * @desc    Accept a follow request (private profiles)
 */
router.post('/accept/:id', async (req, res) => {
  try {
    const myId = req.user._id;
    const requesterId = req.params.id; // The person who sent the request

    const followDoc = await Follow.findOne({ follower: requesterId, following: myId, status: 'pending' });
    if (!followDoc) {
      return res.status(404).json({ success: false, message: 'No pending request from this user' });
    }

    followDoc.status = 'accepted';
    await followDoc.save();

    // Update counts
    await User.findByIdAndUpdate(myId, { $inc: { followersCount: 1 } });
    await User.findByIdAndUpdate(requesterId, { $inc: { followingCount: 1 } });

    const me = await User.findById(myId);

    // Notify requester
    await Notification.create({
      recipient: requesterId,
      sender: myId,
      senderName: me.name,
      senderAvatar: me.avatar,
      type: 'follow_accepted',
      content: `${me.name} accepted your follow request`,
      referenceId: myId,
      referenceModel: 'User',
    });

    res.json({ success: true, message: 'Follow request accepted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/profile/reject/:id
 * @desc    Reject a follow request
 */
router.post('/reject/:id', async (req, res) => {
  try {
    const myId = req.user._id;
    const requesterId = req.params.id;

    const followDoc = await Follow.findOne({ follower: requesterId, following: myId, status: 'pending' });
    if (!followDoc) {
      return res.status(404).json({ success: false, message: 'No pending request from this user' });
    }

    await Follow.findByIdAndDelete(followDoc._id);
    res.json({ success: true, message: 'Follow request rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/profile/requests
 * @desc    Get pending follow requests (for private profiles)
 */
router.get('/requests', async (req, res) => {
  try {
    const requests = await Follow.find({ following: req.user._id, status: 'pending' })
      .populate('follower', 'name username avatar bio')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/profile/followers/:id
 * @desc    Get a user's followers list
 */
router.get('/followers/:id', async (req, res) => {
  try {
    const followers = await Follow.find({ following: req.params.id, status: 'accepted' })
      .populate('follower', 'name username avatar bio isOnline')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      followers: followers.map(f => f.follower),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/profile/following/:id
 * @desc    Get list of users someone is following
 */
router.get('/following/:id', async (req, res) => {
  try {
    const following = await Follow.find({ follower: req.params.id, status: 'accepted' })
      .populate('following', 'name username avatar bio isOnline')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      following: following.map(f => f.following),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/profile/remove-follower/:id
 * @desc    Remove someone from your followers
 */
router.post('/remove-follower/:id', async (req, res) => {
  try {
    const myId = req.user._id;
    const followerId = req.params.id;

    const followDoc = await Follow.findOne({ follower: followerId, following: myId, status: 'accepted' });
    if (!followDoc) {
      return res.status(404).json({ success: false, message: 'This user is not following you' });
    }

    await Follow.findByIdAndDelete(followDoc._id);
    await User.findByIdAndUpdate(myId, { $inc: { followersCount: -1 } });
    await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });

    res.json({ success: true, message: 'Follower removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
