# 🧠 CODE_LOGIC.md — Complete Codebase Walkthrough

> A comprehensive, file-by-file explanation of every module in the **GoRIDE / Happiness Campaign** MERN application. For each file, we explain **what it does**, **why it was designed that way**, and provide a detailed breakdown of the key logic.

---

## Table of Contents

- [Backend](#backend)
  - [server.js — Application Entry Point](#serverjs--application-entry-point)
  - [config/db.js — Database Connection](#configdbjs--database-connection)
  - [models/userModel.js — User Schema](#modelsusermodeljs--user-schema)
  - [models/Ride.js — Ride Schema](#modelsridejs--ride-schema)
  - [models/Message.js — Message Schema](#modelsmessagejs--message-schema)
  - [middleware/authMiddleware.js — Authentication Guard](#middlewareauthMiddlewarejs--authentication-guard)
  - [controllers/authController.js — Auth Logic](#controllersauthcontrollerjs--auth-logic)
  - [controllers/rideController.js — Ride CRUD](#controllersridecontrollerjs--ride-crud)
  - [controllers/chatController.js — Chat System](#controllerschatcontrollerjs--chat-system)
  - [services/rideService.js — Core Business Logic](#servicesrideservicejs--core-business-logic)
  - [services/mapboxService.js — Mapbox Proxy & Caching](#servicesmapboxservicejs--mapbox-proxy--caching)
  - [routes/authRoutes.js — Auth Endpoints](#routesauthroutesjs--auth-endpoints)
  - [routes/rideRoutes.js — Ride Endpoints](#routesrideroutesjs--ride-endpoints)
  - [routes/mapboxRoutes.js — Mapbox Proxy Endpoints](#routesmapboxroutesjs--mapbox-proxy-endpoints)
  - [routes/chatRoutes.js — Chat Endpoints](#routeschatroutesjs--chat-endpoints)
  - [routes/adminRoutes.js — Admin Endpoints](#routesadminroutesjs--admin-endpoints)
  - [sockets/rideSocket.js — Real-Time Events](#socketsridesocketjs--real-time-events)
  - [utils/distance.js — Geospatial Math](#utilsdistancejs--geospatial-math)
  - [Maintenance Scripts](#maintenance-scripts)
- [Frontend](#frontend)
  - [index.js — React Entry Point](#indexjs--react-entry-point)
  - [App.js — Router & Route Guards](#appjs--router--route-guards)
  - [api/api.js — Axios Configuration](#apijs--axios-configuration)
  - [Pages Overview](#pages-overview)
  - [Components Overview](#components-overview)

---

# Backend

## `server.js` — Application Entry Point

**Purpose:** Bootstraps the entire backend — Express app, Socket.IO, middleware, routes, and DB connection.

### Thinking & Design Decisions

The file follows a standard Express initialization pattern but with several intentional design choices:

1. **CORS is configurable** — The `CORS_ORIGIN` env var allows dynamic whitelisting of frontend URLs. This is critical because the frontend could be `localhost:3000` in dev or `your-app.vercel.app` in production.
2. **Socket.IO is attached to the HTTP server, not Express** — Express handles REST, but Socket.IO needs a raw HTTP server for WebSocket upgrades. Both share the same port for simplicity.
3. **`/health` endpoint** — A lightweight endpoint for uptime monitors (like `cron-job.org`) to ping and prevent Render's free tier from spinning down.

### Key Logic Breakdown

```
Lines 1-10:   Import dependencies (express, http, cors, dotenv, socket.io)
Lines 12-15:  Load .env, initialize Express app, create HTTP server
Lines 17-22:  Initialize Socket.IO with CORS matching the Express CORS config
Lines 24-27:  Middleware: JSON parsing, URL encoding, CORS
Lines 29-35:  Mount API routes:
              /api/auth    → authRoutes (register, login, profile)
              /api/rides   → rideRoutes (CRUD, join, rate)
              /api/mapbox  → mapboxRoutes (proxy with rate limiting)
              /api/chat    → chatRoutes (messaging)
              /api/admin   → adminRoutes (admin-only management)
Lines 37-40:  Connect to MongoDB via db.js, then start the server
Lines 42-45:  Initialize Socket.IO event handlers (rideSocket)
Lines 47-50:  /health endpoint — returns { status: 'ok' }
```

**Why this order matters:** Routes must be mounted *before* the server starts listening. DB connection must succeed *before* accepting traffic, which is why `connectDB()` is awaited before `server.listen()`.

---

## `config/db.js` — Database Connection

**Purpose:** Establishes a connection to MongoDB Atlas using Mongoose.

### Key Logic

```
Lines 1-3:    Import mongoose
Lines 5-15:   connectDB async function:
              - Reads MONGODB_URI from environment
              - Calls mongoose.connect() with the connection string
              - Logs success (but NEVER logs the URI itself — security best practice)
              - Catches and logs connection errors, then exits process with code 1
Lines 17:     Export the function
```

**Design Decision:** The function uses `process.exit(1)` on failure rather than retrying. This is intentional — in production (Render), the platform will automatically restart the container. Retrying in the app itself could mask configuration errors.

---

## `models/userModel.js` — User Schema

**Purpose:** Defines the MongoDB document structure for users.

### Schema Fields

| Field      | Type   | Details |
|------------|--------|---------|
| `name`     | String | Required. Display name. |
| `email`    | String | Required, unique, lowercased. Used for login. |
| `password` | String | Required. Stored as a bcrypt hash (10 rounds). |
| `role`     | String | Enum: `'user'` or `'admin'`. Default: `'user'`. |

### Key Logic

```
Lines 1-3:    Import mongoose
Lines 5-25:   Define schema with:
              - email: unique + lowercase (prevents duplicate registrations with "User@email.com" vs "user@email.com")
              - role: defaults to 'user', can only be 'user' or 'admin'
Lines 27-28:  Pre-save hook: hashes password with bcrypt (10 salt rounds) before saving
              ONLY hashes if password field was modified (prevents double-hashing on profile updates)
Lines 30-32:  Instance method: matchPassword — compares plaintext input against the stored hash
Lines 34:     Export model
```

**Design Decision:** The `role` field uses an enum (`['user', 'admin']`) rather than a boolean `isAdmin`. This is future-proof — additional roles like `moderator` can be added without schema changes.

---

## `models/Ride.js` — Ride Schema

**Purpose:** Defines the ride document structure, including geospatial data.

### Schema Fields

| Field               | Type       | Details |
|---------------------|------------|---------|
| `rideName`          | String     | Required ride name |
| `title`             | String     | Alternative display title (used in newer UI) |
| `description`       | String     | Ride description |
| `difficulty`        | String     | Enum: `easy`, `medium`, `hard` |
| `createdByName`     | String     | Name of the ride creator |
| `location`          | GeoJSON    | Start point `{ type: 'Point', coordinates: [lng, lat] }` |
| `destination`       | GeoJSON    | End point |
| `route`             | Object     | GeoJSON Feature with LineString geometry |
| `waypoints`         | Array      | User pickup points `[{ userId, location, timestamp }]` |
| `status`            | String     | Enum: `active`, `scheduled`, `completed`, `cancelled` |
| `scheduledStartTime`| Date       | For scheduled rides |
| `maxPassengers`     | Number     | Default: 10 |
| `speed`             | Number     | Default: 15 km/h |
| `ratings`           | Array      | `[{ userId, rating, comment, timestamp }]` |

### Key Logic

```
Lines 1-3:    Import mongoose
Lines 5-70:   Define schema with:
              - location & destination: GeoJSON Point format (required by MongoDB's geospatial queries)
              - 2dsphere index on 'location' — enables $nearSphere queries for nearby ride discovery
              - waypoints array: each entry stores userId + location + timestamp (for tracking who joined where)
              - ratings array: embedded subdocuments with userId to prevent duplicate ratings
              - timestamps: true — auto-generates createdAt and updatedAt
Lines 72-73:  Create 2dsphere index on location field
Lines 75:     Export model
```

**Design Decision:** Ratings are embedded in the Ride document rather than a separate collection. This is optimal because:
1. Reads are far more common than writes (everyone viewing a ride sees ratings, but only participants rate).
2. No need for cross-collection joins — a single query returns the ride with all its ratings.

---

## `models/Message.js` — Message Schema

**Purpose:** Stores chat messages for community chat, ride-specific chats, and 1-on-1 direct messages.

### Key Logic

```
Lines 1-2:    Import mongoose
Lines 3-41:   Define schema:
              - senderId (ObjectId, ref: 'User') — who sent the message
              - senderName (String) — denormalized for display (avoids needing to populate/join)
              - receiverId (ObjectId, nullable) — if present, this is a 1-on-1 DM
              - rideId (ObjectId, nullable) — if present, this is a ride group chat
              - If BOTH receiverId and rideId are null → it's a Global Community message
              - content (String) — the message text
              - read (Boolean) — tracks if recipient has read the message
Lines 43-47:  Indexes:
              - { rideId: 1, createdAt: 1 } — fast retrieval of ride chat history
              - { senderId: 1, receiverId: 1 } — fast DM lookups (both directions)
```

**Design Decision:** A single `Message` model handles all three chat types (global, ride, DM) using nullable fields. The alternative (separate collections per chat type) would require three separate query systems and complicate the conversation aggregation logic.

---

## `middleware/authMiddleware.js` — Authentication Guard

**Purpose:** Two Express middleware functions that protect routes.

### Key Logic

```
protect (Lines 5-30):
  1. Extracts JWT from 'Authorization: Bearer <token>' header
  2. Verifies the token using JWT_SECRET
  3. Looks up the user in MongoDB by decoded ID (excluding password field)
  4. Attaches user object to req.user
  5. Returns 401 if token is missing, invalid, or user not found

adminOnly (Lines 32-42):
  1. Checks req.user.role === 'admin'
  2. Returns 403 if user is not an admin
  3. Must be used AFTER the 'protect' middleware in the route chain
```

**Design Decision:** `adminOnly` is a separate middleware (not baked into `protect`) because many routes need authentication but not admin access. Composing `protect` + `adminOnly` follows the single-responsibility principle.

---

## `controllers/authController.js` — Auth Logic

**Purpose:** Handles user registration, login, and profile retrieval.

### Key Logic

```
registerUser (Lines 5-50):
  1. Validates name, email, password from req.body
  2. Checks if email already exists in DB (prevents duplicates)
  3. Creates new User document (password is hashed by pre-save hook)
  4. Generates a JWT token with user ID as payload, 30-day expiry
  5. Returns user data + token
  
  SPECIAL LOGIC — Master Admin Auto-Promotion (Lines 20-25):
  If the registration email matches the MASTER_ADMIN_EMAIL env var,
  the user's role is automatically set to 'admin'. This eliminates
  the need to run make_admin.js for the first admin account.

loginUser (Lines 52-90):
  1. Finds user by email (case-insensitive via lowercase index)
  2. Compares password hash using user.matchPassword()
  3. If match: generates JWT, stores role in token payload
  4. Returns user data + token + role
  5. If no match: returns 401 with generic error message
     (never reveals whether email or password was wrong — security)

getMe (Lines 92-110):
  1. Uses req.user (populated by protect middleware)
  2. Returns the user profile without the password field
```

**Design Decision:** The JWT payload intentionally includes only the user ID, not the role. The role is fetched fresh from the DB on each request via `protect`. This means role changes (e.g., promoting to admin) take effect immediately without requiring token regeneration.

---

## `controllers/rideController.js` — Ride CRUD

**Purpose:** HTTP request handlers for all ride operations. Delegates heavy business logic to `rideService.js`.

### Key Functions

```
createRide (Lines 5-40):
  - Accepts ride details from req.body
  - If start/end coordinates are provided but no route, fetches route from Mapbox
  - Creates Ride document in MongoDB
  - Emits 'newRide' socket event to all connected clients

getAllRides (Lines 42-55):
  - Returns all rides with status 'active'
  - Sorted by creation date (newest first)

getScheduledRides (Lines 57-70):
  - Returns rides with status 'scheduled'
  - Sorted by scheduledStartTime ascending (soonest first)

getNearbyRides (Lines 72-100):
  - Accepts lat, lng, radius from query params
  - Uses MongoDB $nearSphere with $maxDistance for geospatial query
  - Returns rides within the specified radius

getRideById (Lines 102-115):
  - Simple findById lookup
  - Returns 404 if not found

joinRide (Lines 117-150):
  - Delegates to rideService.joinRide (proximity validation)
  - On success, emits socket event with updated ride data

rateRide (Lines 152-180):
  - Validates rating is 1-5
  - Checks if user already rated (updates existing, doesn't duplicate)
  - Pushes or updates rating in ride.ratings array

deleteRide (Lines 182-200):
  - Admin-only (enforced at route level by adminOnly middleware)
  - Deletes ride document from DB
  - Emits 'rideDeleted' socket event

updateLocation (Lines 202-230):
  - Updates ride.location with new coordinates
  - Emits 'locationUpdate' socket event for real-time map updates

completeRide (Lines 232-260):
  - Sets ride.status to 'completed'
  - Emits 'rideCompleted' socket event

getMyRides (Lines 262-280):
  - Filters rides by createdByName matching the query parameter
  - Used by Campaign page to show "Campaigns Created by You"
```

---

## `controllers/chatController.js` — Chat System

**Purpose:** Manages messaging — conversations list, message retrieval, and sending.

### Key Logic

```
getConversations (Lines 9-107):
  THINKING: Need to show all active "threads" for a user — global community, 
  ride chats, and DMs — as a single consolidated list, sorted by recency.
  
  1. Fetches ALL messages involving the user (sender, receiver, or global/ride)
  2. Groups messages into "conversations" using a Map:
     - Key format: 'global_community', 'ride_<rideId>', or 'user_<sortedUserIds>'
     - The sorted user IDs ensure that chat between A→B and B→A maps to the same conversation
  3. For each conversation, stores: latest message, unread status, title, type
  4. If Global Community doesn't exist yet, adds a placeholder entry
  5. Sorts all conversations by timestamp (most recent first)

getMessages (Lines 112-151):
  1. Builds MongoDB query based on chat type:
     - 'community': messages with null receiverId AND null rideId
     - 'ride': messages with matching rideId
     - 'user': messages between current user and target user
  2. Returns messages sorted chronologically (oldest first)
  3. Side-effect: marks all unread messages from other users as read

sendMessage (Lines 156-201):
  1. Creates new Message document with sender info
  2. Based on type:
     - 'community': leaves receiverId and rideId null
     - 'ride': validates ride exists, sets rideId + rideName
     - 'user': validates receiver exists, sets receiverId + receiverName
  3. Saves and returns the new message
```

**Design Decision:** The `senderName` is denormalized (stored directly on the message) rather than populated via ObjectId reference. This makes reads much faster (no joins) and ensures the name is preserved even if the user is later deleted.

---

## `services/rideService.js` — Core Business Logic

**Purpose:** The most complex file in the codebase. Contains the core ride management logic, especially the **proximity validation** for joining rides.

### Key Functions

```
joinRide (Lines 30-180):
  THE CORE ALGORITHM:
  
  1. Fetch the ride from DB
  2. Validate: ride exists, not completed, not full, user hasn't already joined
  3. Get user's coordinates from request body
  
  PROXIMITY CHECK (Lines 60-120):
  4. Calculate distance from user to the ride's CURRENT location (vehicle position)
     - Uses Haversine formula from utils/distance.js
     - Must be within MAX_JOIN_DISTANCE (default 5km)
  
  5. If ride has a route polyline, ALSO check distance to the nearest point on the route
     - Uses distanceToPolyline from utils/distance.js
     - This handles the case where the vehicle has passed the user but the
       route still comes near them
  
  6. If BOTH checks fail, reject with: "You are X km away from the route"
  
  ROUTE RECALCULATION (Lines 122-160):
  7. If user passes proximity check:
     - Add user's location as a new waypoint in the ride's waypoints array
     - Recalculate the route through ALL waypoints using Mapbox Directions API
     - The new route passes through: start → existing waypoints → new user pickup → end
     - Save the updated route to the ride document
  
  8. Emit 'rideUpdated' socket event so all connected clients see the new route

createRide (Lines 182-250):
  1. Creates ride document
  2. If coordinates provided, fetches route from Mapbox Directions API
  3. Stores route as GeoJSON Feature (LineString geometry)
  4. Sets status based on whether scheduledStartTime is provided

updateVehicleLocation (Lines 252-300):
  1. Updates ride.location.coordinates with new [lng, lat]
  2. Saves to DB
  3. Returns updated ride for socket broadcast
```

**Design Decision (Proximity):** The 5km check uses both vehicle distance AND polyline distance. This solves a real-world scenario: imagine a pickup point that's 8km from the current vehicle position but only 500m from the route the vehicle will drive along. Without polyline checking, the user would be rejected even though the vehicle will pass right by them.

---

## `services/mapboxService.js` — Mapbox Proxy & Caching

**Purpose:** Proxies all Mapbox API calls through the backend to keep the `MAPBOX_ACCESS_TOKEN` server-side.

### Key Logic

```
IN-MEMORY CACHE (Lines 1-20):
  - Simple Map-based cache with TTL (10 minutes)
  - Max 500 entries (prevents unbounded memory growth)
  - Cache key = the full Mapbox API URL

geocode (Lines 22-80):
  1. Builds Mapbox Geocoding API URL: /geocoding/v5/mapbox.places/{query}.json
  2. Checks cache first — if hit and not expired, returns cached result
  3. On miss: calls Mapbox with the server-side token
  4. Caches the response
  5. Returns features array (place names + coordinates)

getDirections (Lines 82-150):
  1. Builds Mapbox Directions API URL: /directions/v5/mapbox/{profile}/{start};{end}
  2. Checks cache (same TTL logic)
  3. On miss: calls Mapbox with geometries=geojson&overview=full params
  4. Caches the response
  5. Returns route geometry (GeoJSON LineString) + duration + distance

clearExpired (Lines 152-170):
  - Periodically cleans up expired cache entries
  - Runs on a setInterval every 5 minutes
```

**Design Decision:** The cache is in-memory (not Redis) because:
1. This runs on Render's free tier with limited resources
2. The cache is ephemeral — if the server restarts, the cache resets, which is fine for directions/geocoding
3. 500 entries × ~2KB per entry = ~1MB memory usage — negligible

---

## `routes/authRoutes.js` — Auth Endpoints

```
POST /api/auth/register  → authController.registerUser (public)
POST /api/auth/login     → authController.loginUser (public)
GET  /api/auth/me        → [protect] → authController.getMe (authenticated)
```

---

## `routes/rideRoutes.js` — Ride Endpoints

```
GET    /api/rides/            → getAllRides (public)
GET    /api/rides/scheduled   → getScheduledRides (public)
GET    /api/rides/nearby      → getNearbyRides (public)
GET    /api/rides/my          → getMyRides (public, filtered by createdByName query param)
GET    /api/rides/:id         → getRideById (public)
POST   /api/rides/            → [protect] → createRide (authenticated)
POST   /api/rides/schedule    → [protect, adminOnly] → scheduleRide (admin only)
POST   /api/rides/:id/join    → [protect] → joinRide (authenticated, proximity enforced in service)
POST   /api/rides/:id/rate    → [protect] → rateRide (authenticated)
DELETE /api/rides/:id         → [protect, adminOnly] → deleteRide (admin only)
PUT    /api/rides/:id/location → updateLocation (public — used by simulator)
PUT    /api/rides/:id/complete → completeRide (public)
```

**Design Decision:** `updateLocation` and `completeRide` are public (no auth required) to allow the vehicle simulator script (`test-vehicle-simulator.js`) to work without a JWT token. In production, these should be secured.

---

## `routes/mapboxRoutes.js` — Mapbox Proxy Endpoints

### Rate Limiter (Lines 5-30)

```
- In-memory rate limiter: max 100 requests per 60 seconds per IP
- Uses a Map<ip, { count, resetTime }> structure
- Resets count when the window expires
- Returns 429 Too Many Requests if limit exceeded
- No external dependencies (express-rate-limit not used to avoid adding a package)
```

```
GET /api/mapbox/geocode?q=<query>     → [rateLimit] → mapboxService.geocode
GET /api/mapbox/directions?start=lng,lat&end=lng,lat&profile=cycling → [rateLimit] → mapboxService.getDirections
```

---

## `routes/chatRoutes.js` — Chat Endpoints

```
GET  /api/chat/conversations  → [protect] → chatController.getConversations
GET  /api/chat/messages       → [protect] → chatController.getMessages
POST /api/chat/messages       → [protect] → chatController.sendMessage
```

All chat routes require authentication (via `protect` middleware).

---

## `routes/adminRoutes.js` — Admin Endpoints

**Purpose:** Admin-only routes for managing the entire platform. All routes use `[protect, adminOnly]` middleware.

### Key Functions

```
GET    /api/admin/stats              → Returns counts of users, rides, and messages
GET    /api/admin/users              → Returns all users (name, email, role, createdAt)
GET    /api/admin/rides              → Returns all rides (with participant counts)
GET    /api/admin/messages           → Returns latest 100 messages
PUT    /api/admin/users/:id/role     → Changes a user's role (user ↔ admin toggle)
DELETE /api/admin/users/:id          → Deletes a user AND all their messages
DELETE /api/admin/rides/:id          → Deletes a ride AND all messages linked to it
DELETE /api/admin/messages/:id       → Deletes a single message
DELETE /api/admin/messages-clear-all → Deletes ALL messages (nuclear option, double-confirmed in UI)
```

**Design Decision:** When deleting a user, all their messages are also deleted (cascade delete). This prevents orphaned messages with invalid senderIds from cluttering the database.

---

## `sockets/rideSocket.js` — Real-Time Events

**Purpose:** Handles websocket connections for live features.

### Key Logic

```
Lines 1-10:   Connection handler — runs when a client connects
Lines 12-30:  'joinRideRoom' event:
              - Client joins a room named 'ride_<rideId>'
              - Used for targeted broadcasts to ride participants only
Lines 32-50:  'locationUpdate' event:
              - Receives { rideId, latitude, longitude }
              - Broadcasts to all clients in the ride's room
              - Stores update in database via rideService
Lines 52-70:  'leaveRideRoom' event:
              - Client leaves the ride room
              - Broadcasts departure to remaining participants
Lines 72-90:  'disconnect' handler:
              - Cleans up when client disconnects
              - Removes from all rooms
Lines 92-130: Global broadcast events:
              - 'newRide': broadcast to ALL connected clients when a ride is created
              - 'rideDeleted': broadcast when a ride is removed
              - 'rideUpdated': broadcast when route changes (new passenger joins)
```

**Design Decision:** Using Socket.IO rooms (instead of broadcasting to everyone) ensures that location updates are only sent to clients viewing that specific ride. This dramatically reduces bandwidth for apps with many concurrent rides.

---

## `utils/distance.js` — Geospatial Math

**Purpose:** Pure math functions for geospatial calculations. No external dependencies.

### Functions

```
haversine(lat1, lon1, lat2, lon2) → distance in km
  - Implements the Haversine formula
  - Uses Earth radius = 6371 km
  - Accounts for spherical geometry (not flat-earth approximation)
  - Used for: "How far is the user from the vehicle?"

distanceToSegment(px, py, ax, ay, bx, by) → distance in km
  - Calculates the shortest distance from a point to a LINE SEGMENT
  - Uses vector projection to find the nearest point on the segment
  - Clamps the projection to the segment endpoints (not infinite line)
  - Used internally by distanceToPolyline

distanceToPolyline(lat, lng, polylineCoords) → distance in km
  - Iterates through consecutive pairs of polyline coordinates
  - Calls distanceToSegment for each segment
  - Returns the MINIMUM distance across all segments
  - Used for: "How far is the user from the route?"
```

**Design Decision:** These functions use degrees-to-radians conversion for accuracy but use a simplified flat-Earth projection for the segment distance calculation. This is acceptable because:
1. The segments are very short (consecutive GPS points, typically <1km apart)
2. At these distances, the curvature of the Earth introduces <0.1% error
3. The result is compared against a 5km threshold, so precision to 100m is sufficient

---

## Maintenance Scripts

### `make_admin.js`

```
- Connects to MongoDB using MONGODB_URI from .env
- Takes email as command-line argument: node make_admin.js admin@example.com
- Finds user by email, sets role to 'admin', saves
- Disconnects and exits
- Used for initial admin setup before the Master Admin env var was added
```

### `fix_routes.js`

```
- Finds all rides with status 'scheduled' that have coordinates but no route data
- Fetches route from Mapbox Directions API for each
- Updates the ride document with the route GeoJSON
- Used to backfill routes for rides created before routing was implemented
```

### `clearDB.js`

```
- Connects to MongoDB
- Deletes ALL documents from Ride and User collections
- WARNING: This is destructive and irreversible
- Used for development reset
```

### `test-vehicle-simulator.js`

```
- Connects to the backend via Socket.IO
- Hardcoded RIDE_ID must be manually set
- Generates a series of GPS coordinates along a predefined route
- Emits 'locationUpdate' events every 2 seconds
- Simulates a vehicle moving in real-time for demo purposes
```

---

# Frontend

## `index.js` — React Entry Point

```
Lines 1-3:    Import React, ReactDOM, App
Line 4:       Import Mapbox GL CSS — required for map rendering, markers, and popups
Lines 6-11:   Create React root and render <App /> inside <React.StrictMode>
              StrictMode enables development warnings for deprecated patterns
```

---

## `App.js` — Router & Route Guards

**Purpose:** Defines all routes and implements client-side authentication.

### Key Logic

```
Line 23:      const token = localStorage.getItem("token")
              — Simple auth check: does the user have a stored JWT?

Lines 28-50:  Route definitions with conditional rendering:
              - Public routes (no guard): /, /login, /register, /landing
              - Protected routes: check token, redirect to /login if missing
              - Token check is done at PAGE LOAD, not on each API call
                (API-level auth is handled by the Axios interceptor in api.js)
```

**Design Decision:** This is a *client-side* redirect, not a true security measure. A malicious user could modify localStorage. The *real* protection is the JWT validation on every backend API call. The frontend guard simply improves UX by redirecting unauthenticated users to login.

---

## `api/api.js` — Axios Configuration

**Purpose:** Central HTTP client for all API calls.

```
Lines 1-6:    Create Axios instance with baseURL:
              ${REACT_APP_API_URL || "http://localhost:5000"}/api
              This means all api.get("/rides") calls go to http://localhost:5000/api/rides

Lines 8-14:   Request interceptor:
              - Runs before every HTTP request
              - Gets JWT token from localStorage
              - Attaches it as 'Authorization: Bearer <token>' header
              - This means every API call is automatically authenticated
              - No need to manually add headers on each call
```

**Design Decision:** Using an Axios interceptor (instead of passing token per-call) follows DRY principles. Every component can just `import api` and make calls without worrying about auth headers.

---

## Pages Overview

### `Login.jsx` (208 lines)

**Thinking:** The login page is the first thing users see, so it needs to make a strong visual impression. Uses a full-screen background image with gradient overlay, glassmorphism inputs, and smooth CSS animations.

```
State: email, password, showPassword, error, loading
handleLogin():
  1. Validates both fields are filled
  2. POST /api/auth/login with credentials
  3. On success: stores token, role, name, email in localStorage
  4. Redirects to /home using window.location.href (full reload to reset app state)
  5. On error: displays error message in red banner
```

### `Register.jsx` (254 lines)

Similar to Login but with additional fields (name, confirmPassword) and password matching validation.

### `Home.jsx` (321 lines)

**Thinking:** The home page needs to show personalized content: user greeting, scheduled rides from the database, and nearby campaigns based on geolocation.

```
Key Logic:
- useEffect fetches: user profile (/auth/me), scheduled rides (/rides/scheduled), nearby campaigns (/rides/nearby)
- Geolocation: tries browser navigator.geolocation first, falls back to Delhi coordinates (28.6139, 77.2090)
- Pagination: scheduled rides use client-side pagination (4 rides per page)
- Admin check: if localStorage.userRole === 'admin', shows Admin Panel button
- Recommended section: collapsible with smooth height animation
```

### `Campaign.jsx` (296 lines)

```
- Fetches user's own rides via /rides/my?createdByName=<name>
- "Create Campaign" CTA navigates to /create-campaign
- Lists user's rides with status badges (active/scheduled/completed)
- Trending Missions section with hardcoded demo data
- Each ride card navigates to /ride-active/<id>
```

### `CreateCampaign.jsx` (512 lines) — The most complex frontend page

**Thinking:** Creating a ride requires an interactive map, geocoding search, route preview, scheduling, and form validation — all in one page.

```
Key Components:
1. LocationInput (Lines 13-77):
   - Custom geocoder component
   - Debounced search (400ms) to avoid hammering the API
   - Calls /api/mapbox/geocode for suggestions
   - Auto-selects first result for map centering

2. Route Preview (Lines 130-157):
   - useEffect watches startCoords and endCoords
   - When both are set, fetches route from /api/mapbox/directions
   - Renders route as GeoJSON layer on the Mapbox map
   - Auto-fits map bounds to show entire route

3. handlePublish (Lines 183-218):
   - Validates required fields
   - Constructs payload with GeoJSON location/destination/route
   - Sets status to 'scheduled' if date/time provided, else 'active'
   - POST /api/rides to create the ride
```

### `RideDetails.jsx` (422 lines)

```
Key Logic:
- Fetches ride by ID, renders interactive Mapbox map with route
- Calculates distance from route GeoJSON using Haversine formula (client-side)
- Calculates estimated duration from distance/speed
- getTimeOfDayLabel: categorizes ride by scheduled hour (Morning/Afternoon/Evening/Night)
- handleJoin: gets user's geolocation, POST /rides/<id>/join
  - If 400 error or "away" in message → shows "Out of Range" modal
  - On success → navigates to /ride-active/<id>
- Shows average rating from ride.ratings array
```

### `RideActive.jsx` (311 lines)

```
- Full-screen Mapbox map with route overlay
- Vignette overlay for cinematic effect
- Live stats: distance, travel time, participants count
- Controls: Pause/Resume and End Ride buttons
- "Terminate Campaign" button opens delete confirmation modal
- End Ride: PUT /rides/<id>/complete then navigate to /campaign
- Delete Ride: DELETE /rides/<id> then navigate to /campaign
```

### `Community.jsx` (201 lines)

```
- Fetches conversations from /chat/conversations
- Groups them into: ride chats, DMs, global community
- Displays with unread indicators and formatted timestamps
- Search bar (UI only, not functional)
- FAB button navigates to /create-community
- Clicking a conversation navigates to /community-chat with query params
```

### `CommunityChat.jsx` (218 lines)

```
- Reads type, targetId, title from URL query params
- Fetches messages from /chat/messages?type=<>&targetId=<>
- Polls for new messages every 3 seconds (setInterval)
- Auto-scrolls to bottom on new messages (useRef + scrollIntoView)
- Distinguishes own vs. other messages by comparing senderId
- Own messages: gradient orange background, right-aligned
- Others' messages: dark background, left-aligned with avatar
- "Live" badge shown for ride chats with link to view the ride
```

### `Profile.jsx` (274 lines)

```
- Fetches user name from /auth/me
- Displays: user stats (hardcoded), achievements, metrics grid
- "Go Premium" banner (UI only)
- Global leaderboard rank (UI only)
- Account settings list (UI only)
- Logout button: clears localStorage, navigates to /
```

### `AdminPanel.jsx` (343 lines)

```
Key Logic:
- Client-side admin check: if userRole !== 'admin', redirects to /home
- Four tabs: Dashboard, Users, Rides, Messages
- Dashboard: fetches /admin/stats, displays user/ride/message counts
- Users tab: lists all users, can toggle role or delete
- Rides tab: lists all rides, can delete
- Messages tab: lists latest messages, can delete individual or clear all
- Toast notification system for action feedback
- Double-confirmation for destructive "Clear All Messages" action
```

### `activerides.jsx` (41 lines) — Legacy page

```
- Uses Material UI components (Box, Typography)
- Fetches all rides from /rides/
- Renders each with RideCard component
- Simple grid layout, no map
```

### `chat.jsx` (70 lines) — Legacy chat page

```
- Uses Material UI (TextField, IconButton, SendIcon)
- Local-only messages (no API connection)
- Basic UI with fixed-position input at bottom
```

### `CreateRide.jsx` (54 lines) — Legacy ride creation

```
- Simple form with Material UI TextFields
- Minimal fields: name, distance, time, description
- POST /rides/ to create
- No map, no geocoding, no route preview
```

---

## Components Overview

### `BottomNav.jsx` (65 lines)

```
- Fixed bottom navigation bar with 4 tabs: Home, Community, Campaigns, Profile
- Gradient highlight on active tab
- Uses MUI Box and Typography components
- Navigate on click using useNavigate()
```

### `RideCard.jsx` (36 lines)

```
- Card displaying ride name, distance/time, type
- Dark themed MUI Card with hover scale effect
- Navigates to /ride/<id> on click
```

### `SectionHeader.jsx` (28 lines)

```
- Reusable header with title and optional action link
- Flexbox layout: title left, action right
- Used in list sections throughout the app
```

---

> **End of CODE_LOGIC.md** — This document covers every file in the codebase with explanations of the design thinking, architectural decisions, and detailed logic breakdowns.
