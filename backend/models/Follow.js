const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  // The user who is following (or requesting to follow)
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The user being followed
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted'],
    default: 'accepted',  // For public profiles, it's auto-accepted
  },
}, {
  timestamps: true,
});

// Compound index: one follow relationship per pair
followSchema.index({ follower: 1, following: 1 }, { unique: true });
// Quick lookup for "who follows me" and "who do I follow"
followSchema.index({ following: 1, status: 1 });
followSchema.index({ follower: 1, status: 1 });

module.exports = mongoose.model('Follow', followSchema);
