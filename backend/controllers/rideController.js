const rideService = require('../services/rideService');

/**
 * Ride Controller
 * Handles HTTP requests and responses
 */

/**
 * Create a new ride
 */
const createRide = async (req, res) => {
  try {
    const result = await rideService.createRide(req.body);

    if (result.success) {
      return res.status(201).json(result);
    }

    return res.status(400).json(result);
  } catch (error) {
    console.error('Create ride controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Schedule a new ride
 */
const scheduleRide = async (req, res) => {
  try {
    const result = await rideService.scheduleRide(req.body);

    if (result.success) {
      return res.status(201).json(result);
    }

    return res.status(400).json(result);
  } catch (error) {
    console.error('Schedule ride controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get all scheduled rides
 */
const getScheduledRides = async (req, res) => {
  try {
    const result = await rideService.getScheduledRides();

    if (result.success) {
      return res.status(200).json(result);
    }

    return res.status(400).json(result);
  } catch (error) {
    console.error('Get scheduled rides controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get all active rides
 */
const getActiveRides = async (req, res) => {
  try {
    const result = await rideService.getActiveRides();

    if (result.success) {
      return res.status(200).json(result);
    }

    return res.status(400).json(result);
  } catch (error) {
    console.error('Get rides controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get nearby rides
 */
const getNearbyRides = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const result = await rideService.getNearbyRides(lat, lng, radius || 10);

    if (result.success) {
      return res.status(200).json(result);
    }

    return res.status(400).json(result);
  } catch (error) {
    console.error('Get nearby rides controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get ride by ID
 */
const getRideById = async (req, res) => {
  try {
    const result = await rideService.getRideById(req.params.id);

    if (result.success) {
      return res.status(200).json(result);
    }

    return res.status(404).json(result);
  } catch (error) {
    console.error('Get ride controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Join a ride (with 5km validation)
 */
const joinRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { userLocation, userName } = req.body;

    // Validate input
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      return res.status(400).json({
        success: false,
        message: 'User location is required'
      });
    }

    const result = await rideService.joinRide(rideId, userLocation, userName);

    if (result.success) {
      return res.status(200).json(result);
    }

    // Return 403 for proximity violations
    if (result.distance && result.maxDistance) {
      return res.status(403).json(result);
    }

    return res.status(400).json(result);
  } catch (error) {
    console.error('Join ride controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Update vehicle location
 */
const updateLocation = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { location } = req.body;

    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Location is required'
      });
    }

    const result = await rideService.updateVehicleLocation(rideId, location);

    if (result.success) {
      return res.status(200).json(result);
    }

    return res.status(400).json(result);
  } catch (error) {
    console.error('Update location controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Complete a ride
 */
const completeRide = async (req, res) => {
  try {
    const result = await rideService.completeRide(req.params.id);

    if (result.success) {
      return res.status(200).json(result);
    }

    return res.status(400).json(result);
  } catch (error) {
    console.error('Complete ride controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Delete a ride (Admin only)
 */
const deleteRide = async (req, res) => {
  try {
    const userName = req.user?.name || req.user?.user?.name || '';
    const result = await rideService.deleteRide(req.params.id, userName);

    if (result.success) {
      return res.status(200).json(result);
    }

    return res.status(result.status || 404).json(result);
  } catch (error) {
    console.error('Delete ride controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Rate a ride
 */
const rateRide = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const result = await rideService.rateRide(
      req.params.id,
      req.user._id,
      req.user.name,
      rating,
      comment
    );

    if (result.success) {
      return res.status(200).json(result);
    }

    return res.status(400).json(result);
  } catch (error) {
    console.error('Rate ride controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get rides created by a specific user
 */
const getRidesByCreator = async (req, res) => {
  try {
    const { createdByName } = req.query;
    if (!createdByName) {
      return res.status(400).json({ success: false, message: 'createdByName query param required' });
    }
    const result = await rideService.getRidesByCreator(createdByName);
    if (result.success) {
      return res.status(200).json(result);
    }
    return res.status(400).json(result);
  } catch (error) {
    console.error('Get rides by creator controller error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createRide,
  scheduleRide,
  getActiveRides,
  getScheduledRides,
  getNearbyRides,
  getRideById,
  joinRide,
  updateLocation,
  completeRide,
  deleteRide,
  rateRide,
  getRidesByCreator
};
