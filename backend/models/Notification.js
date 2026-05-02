const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Who receives the notification
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Who triggered the notification
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderName: {
    type: String,
    default: '',
  },
  senderAvatar: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: [
      'follow',           // Someone followed you (public profile)
      'follow_request',   // Someone requested to follow you (private profile)
      'follow_accepted',  // Your follow request was accepted
      'ride_invite',      // Someone invited you to a ride
      'ride_joined',      // Someone joined your ride
      'ride_completed',   // A ride you were in was completed
      'message',          // New message from someone
      'rating',           // Someone rated your ride
    ],
    required: true,
  },
  // Reference to the related resource
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  referenceModel: {
    type: String,
    enum: ['Ride', 'Message', 'User', 'Follow', null],
    default: null,
  },
  content: {
    type: String,
    default: '',
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for fast "get my notifications" queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
