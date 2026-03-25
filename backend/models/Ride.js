const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    default: 'Happiness Ride'
  },
  rideName: { // Keeping for backward compatibility
    type: String,
    required: true,
    trim: true
  },
  scheduledStartTime: {
    type: Date,
    default: null
  },
  vehicleName: {
    type: String,
    default: 'Happiness Bus'
  },
  maxPassengers: {
    type: Number,
    default: 10
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'active'
  },
  location: { // Renamed from currentLocation for Geospatial query requirement
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  route: {
    type: Object, // Stores the GeoJSON route from Mapbox
    default: null
  },
  waypoints: [{
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number] // [longitude, latitude]
    },
    userName: String,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  ratings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  }],
  destination: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number] // [longitude, latitude]
  },
  description: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', null],
    default: null
  },
  createdByName: {
    type: String,
    default: 'Ride Leader'
  },
  speed: {
    type: Number,
    default: 40 // km/h
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for geospatial queries
rideSchema.index({ location: '2dsphere' });

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;
