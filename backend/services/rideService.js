const Ride = require('../models/Ride');
const mapboxService = require('./mapboxService');
const { isWithinProximity } = require('../utils/distance');

/**
 * Ride Service
 * Contains all business logic for ride management
 */
class RideService {

  /**
   * Create a new happiness ride
   */
  async createRide(rideData) {
    try {
      const ride = new Ride(rideData);
      await ride.save();

      return {
        success: true,
        ride
      };
    } catch (error) {
      console.error('Create ride error:', error);
      return {
        success: false,
        message: 'Failed to create ride',
        error: error.message
      };
    }
  }

  /**
   * Schedule a new ride
   */
  async scheduleRide(rideData) {
    try {
      // Force status to scheduled
      const scheduledRideData = {
        ...rideData,
        status: 'scheduled'
      };

      const ride = new Ride(scheduledRideData);

      // Pre-calculate the route for the scheduled ride so it can be displayed
      if (ride.destination && ride.destination.coordinates) {
        const routeResult = await mapboxService.calculateRouteWithWaypoints(
          ride.location,
          [],
          ride.destination
        );

        if (routeResult.success) {
          ride.route = routeResult.route;
        }
      }

      await ride.save();

      return {
        success: true,
        ride
      };
    } catch (error) {
      console.error('Schedule ride error:', error);
      return {
        success: false,
        message: 'Failed to schedule ride',
        error: error.message
      };
    }
  }

  /**
   * Get all scheduled rides
   */
  async getScheduledRides() {
    try {
      const rides = await Ride.find({ status: 'scheduled' });

      return {
        success: true,
        rides
      };
    } catch (error) {
      console.error('Get scheduled rides error:', error);
      return {
        success: false,
        message: 'Failed to fetch scheduled rides',
        error: error.message
      };
    }
  }

  /**
   * Get all active rides
   */
  async getActiveRides() {
    try {
      const rides = await Ride.find({ status: 'active' });

      return {
        success: true,
        rides
      };
    } catch (error) {
      console.error('Get rides error:', error);
      return {
        success: false,
        message: 'Failed to fetch rides',
        error: error.message
      };
    }
  }

  /**
   * Get nearby rides
   */
  async getNearbyRides(latitude, longitude, radiusInKm = 10) {
    try {
      // 1. Fetch all active and scheduled rides 
      // (Since ride volume is expected to be reasonable, filtering in memory allows processing full route paths)
      const allRides = await Ride.find({
        status: { $in: ['active', 'scheduled'] }
      });

      const userLat = parseFloat(latitude);
      const userLng = parseFloat(longitude);

      // Helper function: Haversine distance in km
      const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
          Math.sin(dLon / 2) * Math.sin(dLon / 2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
        return R * c; 
      };

      const nearbyRides = allRides.filter(ride => {
        // Option 1: User is near the exact starting location
        if (ride.location?.coordinates && ride.location.coordinates.length >= 2) {
          const dist = getDistanceFromLatLonInKm(userLat, userLng, ride.location.coordinates[1], ride.location.coordinates[0]);
          if (dist <= radiusInKm) return true;
        }

        // Option 2: User is near the destination
        if (ride.destination?.coordinates && ride.destination.coordinates.length >= 2) {
          const dist = getDistanceFromLatLonInKm(userLat, userLng, ride.destination.coordinates[1], ride.destination.coordinates[0]);
          if (dist <= radiusInKm) return true;
        }

        // Option 3: User is near ANY waypoint or coordinate along the navigation route
        if (ride.route && ride.route.geometry && Array.isArray(ride.route.geometry.coordinates)) {
          let coords = ride.route.geometry.coordinates;
          
          // Flatten if MultiLineString
          if (coords.length > 0 && Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
            coords = coords.flat();
          }

          for (const coord of coords) {
            if (Array.isArray(coord) && coord.length >= 2) {
              const dist = getDistanceFromLatLonInKm(userLat, userLng, coord[1], coord[0]);
              if (dist <= radiusInKm) {
                return true; // Match found along the route!
              }
            }
          }
        }

        // Not nearby
        return false;
      });

      return {
        success: true,
        rides: nearbyRides
      };
    } catch (error) {
      console.error('Get nearby rides error:', error);
      return {
        success: false,
        message: 'Failed to fetch nearby rides',
        error: error.message
      };
    }
  }

  /**
   * Get ride by ID
   */
  async getRideById(rideId) {
    try {
      const ride = await Ride.findById(rideId);

      if (!ride) {
        return {
          success: false,
          message: 'Ride not found'
        };
      }

      return {
        success: true,
        ride
      };
    } catch (error) {
      console.error('Get ride error:', error);
      return {
        success: false,
        message: 'Failed to fetch ride',
        error: error.message
      };
    }
  }

  /**
   * CRITICAL: Join ride with 5km proximity validation from route
   */
  async joinRide(rideId, userLocation, userName) {
    try {
      const ride = await Ride.findById(rideId);

      if (!ride) {
        return {
          success: false,
          message: 'Ride not found'
        };
      }

      if (ride.status !== 'active' && ride.status !== 'scheduled') {
        return {
          success: false,
          message: 'Ride is not active or scheduled'
        };
      }

      // Validate 5km proximity from the route polyline
      const MAX_ROUTE_DISTANCE = 5;
      let routeDist = { isWithinRange: true, distance: 0 };

      if (ride.route && ride.route.geometry && ride.route.geometry.coordinates) {
        const { distanceToPolyline } = require('../utils/distance');
        const d = distanceToPolyline(
          userLocation.latitude,
          userLocation.longitude,
          ride.route.geometry.coordinates
        );
        routeDist = { isWithinRange: d <= MAX_ROUTE_DISTANCE, distance: parseFloat(d.toFixed(2)) };
      } else if (ride.location && ride.location.coordinates) {
        // Fallback to vehicle location if no route exists yet
        const vehicleLocation = ride.location.coordinates;
        routeDist = isWithinProximity(
          userLocation.latitude,
          userLocation.longitude,
          vehicleLocation[1],
          vehicleLocation[0],
          MAX_ROUTE_DISTANCE
        );
      }

      // Reject if user is too far from route
      if (!routeDist.isWithinRange) {
        return {
          success: false,
          message: `You are ${routeDist.distance}km away. You must be within ${MAX_ROUTE_DISTANCE}km of the route to join.`,
          distance: routeDist.distance,
          maxDistance: MAX_ROUTE_DISTANCE
        };
      }

      // Add waypoint
      const newWaypoint = {
        location: {
          type: 'Point',
          coordinates: [userLocation.longitude, userLocation.latitude]
        },
        userName: userName || 'Anonymous User',
        joinedAt: new Date()
      };

      ride.waypoints.push(newWaypoint);

      // Recalculate route with new waypoint
      const routeResult = await mapboxService.calculateRouteWithWaypoints(
        ride.location,
        ride.waypoints,
        ride.destination
      );

      if (routeResult.success) {
        ride.route = routeResult.route;
      }

      await ride.save();

      return {
        success: true,
        message: 'Successfully joined the ride!',
        ride,
        distance: routeDist.distance
      };

    } catch (error) {
      console.error('Join ride error:', error);
      return {
        success: false,
        message: 'Failed to join ride',
        error: error.message
      };
    }
  }

  /**
   * Update vehicle location and recalculate route
   */
  async updateVehicleLocation(rideId, newLocation) {
    try {
      const ride = await Ride.findById(rideId);

      if (!ride) {
        return {
          success: false,
          message: 'Ride not found'
        };
      }

      // Update current location
      ride.location.coordinates = [newLocation.longitude, newLocation.latitude];

      // Recalculate route from new position
      if (ride.waypoints.length > 0 || ride.destination) {
        const routeResult = await mapboxService.calculateRouteWithWaypoints(
          ride.location,
          ride.waypoints,
          ride.destination
        );

        if (routeResult.success) {
          ride.route = routeResult.route;
        }
      }

      await ride.save();

      return {
        success: true,
        ride
      };

    } catch (error) {
      console.error('Update location error:', error);
      return {
        success: false,
        message: 'Failed to update location',
        error: error.message
      };
    }
  }

  /**
   * Complete a ride
   */
  async completeRide(rideId) {
    try {
      const ride = await Ride.findByIdAndUpdate(
        rideId,
        { status: 'completed' },
        { new: true }
      );

      return {
        success: true,
        ride
      };
    } catch (error) {
      console.error('Complete ride error:', error);
      return {
        success: false,
        message: 'Failed to complete ride',
        error: error.message
      };
    }
  }

  /**
   * Delete a ride (only by creator)
   */
  async deleteRide(rideId, userName) {
    try {
      const ride = await Ride.findById(rideId);

      if (!ride) {
        return {
          success: false,
          message: 'Ride not found'
        };
      }

      // Only the creator can delete the ride
      if (ride.createdByName && userName && ride.createdByName !== userName) {
        return {
          success: false,
          status: 403,
          message: 'Only the ride creator can delete this campaign'
        };
      }

      await Ride.findByIdAndDelete(rideId);

      return {
        success: true,
        message: 'Ride deleted successfully'
      };
    } catch (error) {
      console.error('Delete ride error:', error);
      return {
        success: false,
        message: 'Failed to delete ride',
        error: error.message
      };
    }
  }

  /**
   * Rate a ride (User)
   */
  async rateRide(rideId, userId, userName, rating, comment) {
    try {
      const ride = await Ride.findById(rideId);

      if (!ride) {
        return { success: false, message: 'Ride not found' };
      }

      // Check if user already rated
      const existingRating = ride.ratings.find(
        r => r.userId.toString() === userId.toString()
      );

      if (existingRating) {
        // Update existing rating
        existingRating.rating = rating;
        existingRating.comment = comment || '';
      } else {
        ride.ratings.push({
          userId,
          userName,
          rating,
          comment: comment || '',
        });
      }

      await ride.save();

      // Calculate average
      const avgRating = ride.ratings.reduce((sum, r) => sum + r.rating, 0) / ride.ratings.length;

      return {
        success: true,
        ride,
        averageRating: parseFloat(avgRating.toFixed(1))
      };
    } catch (error) {
      console.error('Rate ride error:', error);
      return {
        success: false,
        message: 'Failed to rate ride',
        error: error.message
      };
    }
  }

  /**
   * Get rides created by a specific user
   */
  async getRidesByCreator(createdByName) {
    try {
      const rides = await Ride.find({ createdByName }).sort({ createdAt: -1 });
      return {
        success: true,
        rides
      };
    } catch (error) {
      console.error('Get rides by creator error:', error);
      return {
        success: false,
        message: 'Failed to fetch rides',
        error: error.message
      };
    }
  }
}

module.exports = new RideService();
