const express = require('express');
const router = express.Router();
const mapboxService = require('../services/mapboxService');

/**
 * Simple in-memory rate limiter
 * Max 100 requests per minute per IP
 */
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100;

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return next();
  }

  record.count++;
  if (record.count > RATE_LIMIT_MAX) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.'
    });
  }

  next();
}

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now - record.start > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Apply rate limiter to all mapbox routes
router.use(rateLimit);

/**
 * GET /api/mapbox/geocode?q=<query>
 * Proxies geocoding requests to Mapbox (keeps token server-side)
 */
router.get('/geocode', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(400).json({ success: false, message: 'Query must be at least 2 characters' });
    }

    const results = await mapboxService.geocode(q);
    res.json({ success: true, features: results });
  } catch (error) {
    console.error('Geocode proxy error:', error.message);
    res.status(500).json({ success: false, message: 'Geocoding failed' });
  }
});

/**
 * GET /api/mapbox/directions?start=lng,lat&end=lng,lat&profile=cycling
 * Proxies directions requests to Mapbox (keeps token server-side)
 */
router.get('/directions', async (req, res) => {
  try {
    const { start, end, profile } = req.query;

    if (!start || !end) {
      return res.status(400).json({ success: false, message: 'start and end coordinates are required (format: lng,lat)' });
    }

    const startCoords = start.split(',').map(Number);
    const endCoords = end.split(',').map(Number);

    if (startCoords.length !== 2 || endCoords.length !== 2 || startCoords.some(isNaN) || endCoords.some(isNaN)) {
      return res.status(400).json({ success: false, message: 'Invalid coordinate format. Use lng,lat' });
    }

    const result = await mapboxService.getDirections(startCoords, endCoords, profile || 'cycling');
    res.json(result);
  } catch (error) {
    console.error('Directions proxy error:', error.message);
    res.status(500).json({ success: false, message: 'Directions request failed' });
  }
});

module.exports = router;
