const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

/**
 * Ride Routes
 */

// Create a new ride
router.post('/', rideController.createRide);

// Schedule a new ride (Admin only)
router.post('/schedule', protect, adminOnly, rideController.scheduleRide);

// Get all scheduled rides
router.get('/scheduled', rideController.getScheduledRides);

// Get nearby rides
router.get('/nearby', rideController.getNearbyRides);

// Get rides created by a user (by createdByName)
router.get('/my', rideController.getRidesByCreator);

// Get all active rides
router.get('/', rideController.getActiveRides);

// Get ride by ID
router.get('/:id', rideController.getRideById);

// Join a ride (with proximity validation)
router.post('/:rideId/join', protect, rideController.joinRide);

// Rate a ride (authenticated users)
router.post('/:id/rate', protect, rideController.rateRide);

// Delete a ride (authenticated users)
router.delete('/:id', protect, rideController.deleteRide);

// Update vehicle location
router.put('/:rideId/location', rideController.updateLocation);

// Complete a ride
router.put('/:id/complete', rideController.completeRide);

module.exports = router;
