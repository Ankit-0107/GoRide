const axios = require('axios');

/**
 * Mapbox Service
 * Handles all interactions with Mapbox APIs (Directions, Geocoding)
 * Includes in-memory caching to minimize API calls and stay within free tier
 */

// Simple TTL cache
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.time > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  // Prevent cache from growing too large
  if (cache.size > 500) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
  cache.set(key, { data, time: Date.now() });
}

class MapboxService {
  constructor() {
    this.accessToken = process.env.MAPBOX_ACCESS_TOKEN;
    this.directionsBaseURL = 'https://api.mapbox.com/directions/v5/mapbox';
    this.geocodingBaseURL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
  }

  /**
   * Geocode a search query
   * @param {string} query - Search text
   * @param {number} limit - Max results (default 5)
   * @returns {Array} Array of feature objects
   */
  async geocode(query, limit = 5) {
    const cacheKey = `geo:${query.toLowerCase().trim()}:${limit}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.geocodingBaseURL}/${encodeURIComponent(query)}.json`;
      const response = await axios.get(url, {
        params: {
          access_token: this.accessToken,
          limit
        }
      });

      const features = response.data.features || [];
      setCache(cacheKey, features);
      return features;
    } catch (error) {
      console.error('Mapbox Geocoding Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get directions between two points
   * @param {Array} start - [lng, lat]
   * @param {Array} end - [lng, lat]
   * @param {string} profile - 'driving', 'cycling', 'walking' (default 'cycling')
   * @returns {Object} Route data
   */
  async getDirections(start, end, profile = 'cycling') {
    const cacheKey = `dir:${profile}:${start.join(',')}:${end.join(',')}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const coordinates = `${start[0]},${start[1]};${end[0]},${end[1]}`;
      const url = `${this.directionsBaseURL}/${profile}/${coordinates}`;

      const response = await axios.get(url, {
        params: {
          access_token: this.accessToken,
          geometries: 'geojson',
          overview: 'full',
          steps: false
        }
      });

      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const result = {
          success: true,
          route: {
            type: 'Feature',
            geometry: route.geometry,
            properties: {
              duration: route.duration,
              distance: route.distance
            }
          }
        };
        setCache(cacheKey, result);
        return result;
      }

      return { success: false, message: 'No route found' };
    } catch (error) {
      console.error('Mapbox Directions Error:', error.response?.data || error.message);
      return { success: false, message: 'Failed to fetch directions', error: error.message };
    }
  }

  /**
   * Get route from Mapbox Directions API (legacy - used by rideService)
   * @param {Array} waypoints - Array of [longitude, latitude] coordinates
   * @returns {Object} Route data with geometry and duration
   */
  async getRoute(waypoints) {
    try {
      const coordinates = waypoints
        .map(wp => `${wp[0]},${wp[1]}`)
        .join(';');

      const url = `${this.directionsBaseURL}/driving/${coordinates}`;
      
      const response = await axios.get(url, {
        params: {
          access_token: this.accessToken,
          geometries: 'geojson',
          overview: 'full',
          steps: false
        }
      });

      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        
        return {
          success: true,
          geometry: route.geometry,
          duration: route.duration,
          distance: route.distance
        };
      }

      return {
        success: false,
        message: 'No route found'
      };

    } catch (error) {
      console.error('Mapbox API Error:', error.response?.data || error.message);
      
      return {
        success: false,
        message: 'Failed to fetch route',
        error: error.message
      };
    }
  }

  /**
   * Calculate route with multiple waypoints (legacy - used by rideService)
   */
  async calculateRouteWithWaypoints(currentLocation, waypoints, destination) {
    try {
      const coordinates = [
        currentLocation.coordinates,
        ...waypoints.map(wp => wp.location.coordinates),
        destination.coordinates
      ];

      const routeData = await this.getRoute(coordinates);
      
      if (routeData.success) {
        return {
          success: true,
          route: {
            type: 'Feature',
            geometry: routeData.geometry,
            properties: {
              duration: routeData.duration,
              distance: routeData.distance
            }
          }
        };
      }

      return routeData;

    } catch (error) {
      console.error('Route calculation error:', error);
      
      return {
        success: false,
        message: 'Route calculation failed',
        error: error.message
      };
    }
  }
}

module.exports = new MapboxService();
