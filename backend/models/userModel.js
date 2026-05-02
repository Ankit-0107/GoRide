const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    unique: true,
    sparse: true,  // allows null values while keeping uniqueness
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._]{3,30}$/, 'Username can only contain letters, numbers, dots & underscores (3-30 chars)'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  // Profile fields
  bio: {
    type: String,
    default: '',
    maxLength: 160,
  },
  avatar: {
    type: String,
    default: '',  // URL to profile picture
  },
  isPublic: {
    type: Boolean,
    default: true,  // true = public (anyone can follow), false = private (follow requests)
  },
  // Social counters (denormalized for performance)
  followersCount: {
    type: Number,
    default: 0,
  },
  followingCount: {
    type: Number,
    default: 0,
  },
  ridesCompleted: {
    type: Number,
    default: 0,
  },
  totalDistance: {
    type: Number,
    default: 0,  // in km
  },
  // Online status
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Auto-generate username from name if not provided
userSchema.pre('save', function (next) {
  if (!this.username && this.isNew) {
    // Generate username: lowercase name + random 4 digits
    const base = this.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    this.username = base + Math.floor(1000 + Math.random() * 9000);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
