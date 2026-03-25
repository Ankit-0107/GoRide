const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// Get all conversations for a user
router.get('/conversations', protect, chatController.getConversations);

// Get messages for a specific conversation
router.get('/messages', protect, chatController.getMessages);

// Send a message
router.post('/messages', protect, chatController.sendMessage);

module.exports = router;
