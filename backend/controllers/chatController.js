const Message = require('../models/Message');
const User = require('../models/userModel');
const Ride = require('../models/Ride');

/**
 * Get all conversations for the current user
 * Returns grouped recent messages to display in Community tab
 */
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Fetch all messages involving the user
    // (User is sender, receiver, OR it is a global community message)
    // Wait, since we need ride messages too, let's just fetch all messages for now 
    // and process them in memory (since the DB is fresh and small)
    
    // Get all messages for:
    // 1. Direct messages where user is sender or receiver
    // 2. Global community messages (receiverId = null, rideId = null)
    // 3. Ride messages (future-proof) Where rideId is not null
    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId },
        { receiverId: null, rideId: null }, // Global community
        { rideId: { $ne: null } }           // All rides
      ]
    }).sort({ createdAt: -1 });

    const conversationsMap = new Map();

    messages.forEach((msg) => {
      let convId;
      let title;
      let type;
      let unread = !msg.read && msg.senderId.toString() !== userId.toString();

      if (msg.rideId) {
        // Ride chat
        convId = 'ride_' + msg.rideId.toString();
        title = msg.rideName || 'Ride Community';
        type = 'ride';
      } else if (!msg.receiverId && !msg.rideId) {
        // Global Community Chat
        convId = 'global_community';
        title = 'Global Community';
        type = 'community';
      } else {
        // 1-on-1 chat
        const otherId = msg.senderId.toString() === userId.toString() ? msg.receiverId.toString() : msg.senderId.toString();
        const otherName = msg.senderId.toString() === userId.toString() ? msg.receiverName : msg.senderName;
        // Don't show 1-on-1 if it's missing otherId
        if (!otherId || otherId === 'null') return;
        
        // Sorting IDs guarantees a unique key for the pair A and B
        const sortedIds = [userId.toString(), otherId].sort().join('_');
        convId = 'user_' + sortedIds;
        title = otherName || 'User';
        type = 'user';
      }

      // We sorted by createdAt: -1, so the FIRST one we encounter is the latest
      if (!conversationsMap.has(convId)) {
        conversationsMap.set(convId, {
          id: convId,
          type,
          title,
          lastMessage: msg.content,
          senderName: msg.senderName,
          timestamp: msg.createdAt,
          hasUnread: unread,
          targetId: type === 'user' ? (msg.senderId.toString() === userId.toString() ? msg.receiverId : msg.senderId) : (type === 'ride' ? msg.rideId : 'global')
        });
      } else {
        // If we already added the latest, just check if there are unread messages to bubble up
        if (unread) {
          conversationsMap.get(convId).hasUnread = true;
        }
      }
    });

    // Also manually include a Global Community placeholder if no messages exist yet
    if (!conversationsMap.has('global_community')) {
      conversationsMap.set('global_community', {
        id: 'global_community',
        type: 'community',
        title: 'Global Community',
        lastMessage: 'Say hi to everyone!',
        senderName: 'System',
        timestamp: new Date(),
        hasUnread: false,
        targetId: 'global'
      });
    }

    const conversationsArray = Array.from(conversationsMap.values());
    // Sort by latest message
    conversationsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({ success: true, conversations: conversationsArray });
  } catch (error) {
    console.error('Error in getConversations:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Get messages for a specific conversation
 */
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.user?.id;
    const { type, targetId } = req.query; // type can be 'user', 'ride', 'community'

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let query = {};
    if (type === 'community' || targetId === 'global') {
      query = { receiverId: null, rideId: null };
    } else if (type === 'ride') {
      query = { rideId: targetId };
    } else if (type === 'user') {
      query = {
        $or: [
          { senderId: userId, receiverId: targetId },
          { senderId: targetId, receiverId: userId }
        ]
      };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid chat type' });
    }

    const messages = await Message.find(query).sort({ createdAt: 1 });

    // Mark as read (for any messages not from the current user)
    const unreadMsgIds = messages
      .filter(m => !m.read && m.senderId.toString() !== userId.toString())
      .map(m => m._id);
    
    if (unreadMsgIds.length > 0) {
      await Message.updateMany({ _id: { $in: unreadMsgIds } }, { $set: { read: true } });
    }

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Send a generic message
 */
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.user?.id;
    const userName = req.user.name || req.user.user?.name || 'User';
    const { content, type, targetId } = req.body;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

    const newMessage = new Message({
      senderId: userId,
      senderName: userName,
      content,
      read: false
    });

    if (type === 'community' || targetId === 'global') {
      // Receiver and Ride remain null
    } else if (type === 'ride') {
      const ride = await Ride.findById(targetId);
      if (ride) {
        newMessage.rideId = ride._id;
        newMessage.rideName = ride.title || ride.rideName || 'Ride Community';
      } else {
        return res.status(404).json({ success: false, message: 'Ride not found' });
      }
    } else if (type === 'user') {
      const receiveUser = await User.findById(targetId);
      if (receiveUser) {
        newMessage.receiverId = receiveUser._id;
        newMessage.receiverName = receiveUser.name;
      } else {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid target' });
    }

    await newMessage.save();

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
