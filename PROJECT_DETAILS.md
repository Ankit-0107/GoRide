# 📖 PROJECT_DETAILS.md — Complete Project Documentation

> An exhaustive guide to every feature, functionality, architectural decision, data flow, and system component of the **GoRIDE / Happiness Campaign** application. This document goes significantly deeper than the README and serves as a technical reference for developers, evaluators, and maintainers.

---

## Table of Contents

- [1. Executive Summary](#1-executive-summary)
- [2. System Architecture](#2-system-architecture)
- [3. Technology Stack Deep Dive](#3-technology-stack-deep-dive)
- [4. Database Design](#4-database-design)
- [5. Authentication & Authorization](#5-authentication--authorization)
- [6. Feature Catalog](#6-feature-catalog)
  - [6.1 User Registration & Login](#61-user-registration--login)
  - [6.2 Home Dashboard](#62-home-dashboard)
  - [6.3 Campaign Management](#63-campaign-management)
  - [6.4 Ride Creation (Create Campaign)](#64-ride-creation-create-campaign)
  - [6.5 Ride Details & Joining](#65-ride-details--joining)
  - [6.6 Active Ride Tracking](#66-active-ride-tracking)
  - [6.7 Ride Ratings](#67-ride-ratings)
  - [6.8 Nearby Ride Discovery](#68-nearby-ride-discovery)
  - [6.9 Community & Chat System](#69-community--chat-system)
  - [6.10 User Profile](#610-user-profile)
  - [6.11 Admin Panel](#611-admin-panel)
- [7. Real-Time Communication](#7-real-time-communication)
- [8. Geospatial Systems](#8-geospatial-systems)
- [9. Mapbox Integration](#9-mapbox-integration)
- [10. Security Architecture](#10-security-architecture)
- [11. API Architecture](#11-api-architecture)
- [12. Frontend Architecture](#12-frontend-architecture)
- [13. Design System & UI/UX](#13-design-system--uiux)
- [14. Deployment Architecture](#14-deployment-architecture)
- [15. Data Flow Diagrams](#15-data-flow-diagrams)
- [16. Error Handling & Edge Cases](#16-error-handling--edge-cases)
- [17. Maintenance & Operations](#17-maintenance--operations)
- [18. Known Limitations & Future Roadmap](#18-known-limitations--future-roadmap)

---

## 1. Executive Summary

**GoRIDE (Happiness Campaign)** is a real-time, full-stack web application built on the MERN stack (MongoDB, Express, React, Node.js) designed for organizing and tracking community "Happiness Rides" — group cycling campaigns. The application enables:

- **Ride Organizers** to create geo-routed campaigns with start/end locations, difficulty levels, scheduling, and partner integrations
- **Participants** to discover nearby rides, join them with proximity validation, track rides in real-time on interactive maps, and communicate via chat
- **Administrators** to manage all platform data — users, rides, and messages — from a dedicated admin panel

The project targets cities where community cycling events ("Happiness Campaigns") promote civic engagement, health, and sustainability. The application provides real-time GPS tracking, proximity-based ride joining (5km validation), route recalculation through passenger pickup points, and a complete messaging system.

### Key Metrics

| Metric | Value |
|--------|-------|
| Total Source Files | ~45 files |
| Backend LOC | ~2,000 lines |
| Frontend LOC | ~5,500 lines |
| API Endpoints | 20+ |
| Database Collections | 3 (Users, Rides, Messages) |
| Real-time Events | 7 Socket.IO events |
| Pages | 16 frontend pages |

---

## 2. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                       │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │ React.js │  │ Mapbox   │  │Socket.IO │  │ Axios HTTP │ │
│  │ SPA      │  │ GL JS    │  │ Client   │  │ Client     │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │
│       │              │             │              │         │
└───────┼──────────────┼─────────────┼──────────────┼─────────┘
        │              │             │              │
        │         Map Tiles      WebSocket      REST API
        │         (Mapbox CDN)   (Persistent)   (JWT Auth)
        │              │             │              │
┌───────┼──────────────┼─────────────┼──────────────┼─────────┐
│       ▼              │             ▼              ▼         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 EXPRESS.JS SERVER                     │  │
│  │                                                      │  │
│  │  ┌────────┐ ┌──────────┐ ┌─────────┐ ┌───────────┐ │  │
│  │  │ Auth   │ │ Ride     │ │ Chat    │ │ Admin     │ │  │
│  │  │ Routes │ │ Routes   │ │ Routes  │ │ Routes    │ │  │
│  │  └────────┘ └──────────┘ └─────────┘ └───────────┘ │  │
│  │       │           │           │            │        │  │
│  │  ┌────────┐ ┌──────────┐ ┌─────────────┐          │  │
│  │  │ Auth   │ │ Ride     │ │ Mapbox      │          │  │
│  │  │ Ctrl   │ │ Service  │ │ Proxy Svc   │          │  │
│  │  └────────┘ └──────────┘ └─────────────┘          │  │
│  │               │                    │               │  │
│  │  ┌──────────────────────────────────────────────┐ │  │
│  │  │           Socket.IO Server                   │ │  │
│  │  │  (rideSocket.js — rooms, broadcasts)         │ │  │
│  │  └──────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                     SERVER (Node.js)                        │
└──────────────┬───────────────────────────┬──────────────────┘
               │                           │
         Mongoose ODM              HTTPS Proxy
               │                           │
     ┌─────────▼──────────┐    ┌───────────▼───────────┐
     │   MongoDB Atlas    │    │    Mapbox APIs         │
     │                    │    │                        │
     │ Collections:       │    │ • Geocoding v5         │
     │ • users            │    │ • Directions v5        │
     │ • rides            │    │ • Map Tiles (direct)   │
     │ • messages         │    │                        │
     │                    │    │ (cached + rate-limited) │
     │ Indexes:           │    └────────────────────────┘
     │ • 2dsphere (rides) │
     │ • compound (msgs)  │
     └────────────────────┘
```

### Communication Patterns

| Pattern | Use Case | Technology |
|---------|----------|------------|
| Request-Response | CRUD operations, auth | REST API (Axios → Express) |
| Bidirectional Streaming | Location updates, ride events | Socket.IO WebSockets |
| Proxy | Geocoding, Directions | Backend → Mapbox API |
| Polling | Chat message refresh | Frontend setInterval (3s) |

---

## 3. Technology Stack Deep Dive

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.x | HTTP server framework |
| `mongoose` | ^7.x | MongoDB ODM with schema validation |
| `socket.io` | ^4.x | Real-time bidirectional communication |
| `jsonwebtoken` | ^9.x | JWT token generation and verification |
| `bcryptjs` | ^2.x | Password hashing (10 salt rounds) |
| `cors` | ^2.x | Cross-origin resource sharing |
| `dotenv` | ^16.x | Environment variable management |
| `axios` | ^1.x | HTTP client for Mapbox API calls |
| `nodemon` (dev) | ^3.x | Auto-restart server on file changes |

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.x | UI framework |
| `react-router-dom` | ^6.x | Client-side routing |
| `react-map-gl` | ^7.x | React wrapper for Mapbox GL JS |
| `mapbox-gl` | ^3.x | Map rendering engine |
| `axios` | ^1.x | HTTP client |
| `@mui/material` | ^5.x | Material UI components (legacy pages) |
| `@emotion/react` | ^11.x | CSS-in-JS (MUI dependency) |

### External Services

| Service | Free Tier | Purpose |
|---------|-----------|---------|
| MongoDB Atlas (M0) | 512 MB storage | Database |
| Mapbox | 50K map loads/mo | Maps, Geocoding, Routing |
| Render | 750 hrs/mo | Backend hosting |
| Vercel | Unlimited deploys | Frontend hosting |

---

## 4. Database Design

### Collections & Relationships

```
┌─────────────────┐     ┌────────────────────┐     ┌───────────────────┐
│     USERS       │     │      RIDES         │     │    MESSAGES       │
├─────────────────┤     ├────────────────────┤     ├───────────────────┤
│ _id             │◄──┐ │ _id                │◄──┐ │ _id               │
│ name            │   │ │ rideName           │   │ │ senderId → Users  │
│ email (unique)  │   │ │ title              │   │ │ senderName        │
│ password (hash) │   │ │ description        │   │ │ receiverId → Users│
│ role (enum)     │   │ │ difficulty (enum)  │   │ │ receiverName      │
│ createdAt       │   │ │ createdByName      │   └─│ rideId → Rides    │
│ updatedAt       │   │ │ location (GeoJSON) │     │ rideName          │
└─────────────────┘   │ │ destination (GeoJSON)    │ content           │
                      │ │ route (GeoJSON)    │     │ read (boolean)    │
                      │ │ waypoints [        │     │ createdAt         │
                      │ │   { userId → Users │     │ updatedAt         │
                      │ │     location       │     └───────────────────┘
                      │ │     timestamp }    │
                      │ │ ]                  │
                      │ │ status (enum)      │
                      │ │ scheduledStartTime │
                      │ │ maxPassengers      │
                      │ │ speed              │
                      │ │ ratings [          │
                      └─│   { userId → Users │
                        │     rating (1-5)   │
                        │     comment        │
                        │     timestamp }    │
                        │ ]                  │
                        │ createdAt          │
                        │ updatedAt          │
                        └────────────────────┘
```

### Indexes

| Collection | Index | Type | Purpose |
|------------|-------|------|---------|
| `rides` | `location` | 2dsphere | Geospatial nearby queries |
| `messages` | `{ rideId: 1, createdAt: 1 }` | Compound | Fast ride chat history |
| `messages` | `{ senderId: 1, receiverId: 1 }` | Compound | Fast DM lookups |
| `messages` | `{ receiverId: 1, senderId: 1 }` | Compound | Reverse DM lookups |
| `users` | `{ email: 1 }` | Unique | Login lookups, duplicate prevention |

### Data Size Estimates (Typical Deployment)

| Collection | Avg Document Size | For 1000 Items |
|------------|-------------------|----------------|
| Users | ~300 bytes | ~300 KB |
| Rides | ~5 KB (with route) | ~5 MB |
| Messages | ~200 bytes | ~200 KB |

---

## 5. Authentication & Authorization

### Authentication Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │  Server  │         │ MongoDB  │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │  POST /auth/login  │                    │
     │  {email, password} │                    │
     │───────────────────►│                    │
     │                    │  Find user by email│
     │                    │───────────────────►│
     │                    │   User document    │
     │                    │◄───────────────────│
     │                    │                    │
     │                    │ bcrypt.compare()   │
     │                    │ (hash validation)  │
     │                    │                    │
     │                    │ jwt.sign(userId)   │
     │                    │ (30-day expiry)    │
     │                    │                    │
     │  { user, token }   │                    │
     │◄───────────────────│                    │
     │                    │                    │
     │ localStorage.set   │                    │
     │ ("token", jwt)     │                    │
     │                    │                    │
     │  GET /rides (with  │                    │
     │  Bearer token)     │                    │
     │───────────────────►│                    │
     │                    │ jwt.verify(token)  │
     │                    │ → userId           │
     │                    │ User.findById()    │
     │                    │───────────────────►│
     │                    │ req.user = user    │
     │                    │◄───────────────────│
     │                    │                    │
     │  200 OK + data     │                    │
     │◄───────────────────│                    │
```

### Authorization Matrix

| Resource | Public | Authenticated User | Admin |
|----------|--------|-------------------|-------|
| View rides | ✅ | ✅ | ✅ |
| View map | ✅ | ✅ | ✅ |
| Register/Login | ✅ | N/A | N/A |
| Join ride | ❌ | ✅ (within 5km) | ✅ |
| Rate ride | ❌ | ✅ | ❌ |
| Create ride | ❌ | ✅ | ✅ |
| Schedule ride | ❌ | ❌ | ✅ |
| Delete ride | ❌ | ❌ | ✅ |
| View admin panel | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Delete messages | ❌ | ❌ | ✅ |
| Send chat messages | ❌ | ✅ | ✅ |

### Admin Promotion Methods

1. **Environment Variable** — Set `MASTER_ADMIN_EMAIL` in `backend/.env`. Any user registering with that email is auto-promoted to admin.
2. **CLI Script** — Run `node make_admin.js admin@email.com` in the backend directory.
3. **Admin Panel** — An existing admin can toggle any user's role through the Users tab.

---

## 6. Feature Catalog

### 6.1 User Registration & Login

**Pages:** `Login.jsx`, `Register.jsx`

#### Registration Flow
1. User enters name, email, password, and confirm password
2. Client-side validates: all fields filled, passwords match
3. `POST /api/auth/register` → server validates email uniqueness
4. Password hashed with bcrypt (10 rounds), user saved to MongoDB
5. JWT generated (30-day expiry), returned with user data
6. Frontend stores token, role, name, email in `localStorage`
7. User redirected to `/home`

#### Login Flow
1. User enters email and password
2. `POST /api/auth/login` → server finds user by email (case-insensitive)
3. bcrypt compares plaintext against stored hash
4. On success: JWT generated, user data returned
5. Frontend stores credentials in `localStorage`
6. Full page reload to `/home` (ensures all components reinitialize with auth)

#### UI Features
- Password visibility toggle (eye icon)
- Loading state on submit button ("LOGGING IN..." / "SIGNING UP...")
- Error banners with red gradient styling
- Auth toggle tabs (LOG IN / SIGN UP) for quick switching
- Social login buttons (Google, Apple, Facebook — UI only, not functional)
- Entry animation (`authPageEnter` CSS keyframe)
- Full-screen background image with gradient overlay

---

### 6.2 Home Dashboard

**Page:** `Home.jsx`

#### Sections

1. **Top App Bar** — User avatar, greeting ("Hi, <name>"), notification bell, admin shield button (admin only)
2. **Category Filter** — Pill buttons: All, Nearby, Trending, Local (UI only)
3. **Recommended For You** — Collapsible bento card with hardcoded "Sunrise Ride" data, cyclist avatars, "Join Ride" CTA
4. **Scheduled Rides** — Paginated grid (2 columns, 4 per page) of rides from `/api/rides/scheduled`, with date/time display and navigation arrows
5. **Nearby Campaigns** — Horizontally scrollable cards from `/api/rides/nearby`, uses browser geolocation (falls back to Delhi coordinates)
6. **Partner Offers** — Hardcoded promotional cards (Daily Grind Cafe, Iron Peak Gym) with REDEEM buttons

#### Data Sources

| Section | API Endpoint | Fallback |
|---------|-------------|----------|
| User name | `GET /api/auth/me` | "User" |
| Scheduled rides | `GET /api/rides/scheduled` | Empty state card |
| Nearby campaigns | `GET /api/rides/nearby?lat=<>&lng=<>&radius=10` | Geolocation denied → Delhi coordinates |

---

### 6.3 Campaign Management

**Page:** `Campaign.jsx`

#### Features
- **Create Campaign CTA** — Centered card with icon, description, and "Create Campaign" button → navigates to `/create-campaign`
- **Campaigns Created By You** — Fetches rides where `createdByName` matches the current user. Shows ride title, date, participant count, status badge. Each card navigates to `/ride-active/<id>`
- **Trending Missions** — Four hardcoded mission cards (Green City Dash, Alpine Ascent, Suburban Sprint, Heritage Loop) with distance and participant counts

---

### 6.4 Ride Creation (Create Campaign)

**Page:** `CreateCampaign.jsx`

This is the most feature-rich page in the frontend (~512 lines).

#### Form Sections

1. **Basic Info** — Ride Name, Description
2. **Route Selection** — Interactive Mapbox map with:
   - Start location geocoder (searches via `/api/mapbox/geocode`)
   - End location geocoder
   - Automatic route calculation via `/api/mapbox/directions`
   - Route line rendered on map as GeoJSON layer
   - Map auto-fits bounds to show entire route
   - Zoom +/- controls
3. **Schedule** — Date picker, Time picker, Repeat toggle (Daily/Weekly)
4. **Ride Details** — Difficulty selector (Easy/Medium/Hard), Max Participants counter with +/- buttons
5. **Partners** — Checkboxes for partner integrations (Peak Performance Nutrition, Velocity Bike Works)

#### Route Calculation Pipeline

```
1. User types in Start Location → debounced geocode API call (400ms)
2. Dropdown shows 5 suggestions from Mapbox
3. User selects → coordinates stored in state, map centers
4. Same process for End Location
5. useEffect fires when BOTH coordinates are set
6. Calls GET /api/mapbox/directions?start=lng,lat&end=lng,lat&profile=cycling
7. Backend proxies to Mapbox, returns GeoJSON geometry
8. Route drawn on map as orange line
9. Map auto-fits bounds (padding: 40px)
```

#### Publish Logic

```
1. Validates: ride name required, start/end coordinates required
2. Constructs payload:
   - location: { type: "Point", coordinates: [startLng, startLat] }
   - destination: { type: "Point", coordinates: [endLng, endLat] }
   - route: GeoJSON Feature (if calculated)
   - status: "scheduled" if date/time set, else "active"
3. POST /api/rides → creates ride in MongoDB
4. Navigate to /campaign on success
```

---

### 6.5 Ride Details & Joining

**Page:** `RideDetails.jsx`

#### Features
- Interactive Mapbox map showing route line, start marker (orange), end marker (white)
- Map auto-fits to route bounds on load
- Zoom controls overlay
- Time-of-day badge (Morning/Afternoon/Evening/Night Series) based on scheduled hour
- Ride leader card with creator name and average rating
- Participant count with stacked avatar display
- Stats grid: Distance (calculated from route geometry), Duration (estimated from distance/speed), Difficulty
- "Join Campaign" button with state handling (full, completed, or joinable)
- Partner offer card (Daily Grind Cafe — free espresso)
- "About the Ride" description section

#### Proximity-Based Joining

```
1. User clicks "Join Campaign"
2. Browser requests geolocation (navigator.geolocation.getCurrentPosition)
3. If denied: falls back to default coordinates (Delhi)
4. POST /api/rides/<id>/join { latitude, longitude }
5. Backend validates:
   a. Ride exists and is active/scheduled
   b. Not at max capacity
   c. User hasn't already joined
   d. PROXIMITY CHECK:
      - Distance from user to vehicle (Haversine) ≤ 5km
      - OR distance from user to nearest point on route polyline ≤ 5km
6. If too far: 400 response → "Out of Range" modal displayed
7. If success:
   a. User's location added as waypoint
   b. Route recalculated through new pickup point
   c. Socket event emitted to all viewers of this ride
   d. Navigate to /ride-active/<id>
```

---

### 6.6 Active Ride Tracking

**Page:** `RideActive.jsx`

#### Features
- **Full-screen Mapbox map** with route and markers
- **Cinematic vignette overlay** (radial gradient from center to edges)
- **Group status indicator** — floating badge showing participant avatars and "In Range" status
- **Real-time stats overlay** — Distance (km), Travel Time (min), Participants count
- **Ride controls**:
  - Pause/Resume button (toggles `isPaused` state)
  - End Ride button → `PUT /rides/<id>/complete` → navigate to /campaign
- **Terminate Campaign** — Red delete button in bottom nav → opens confirmation modal with double-step warning → `DELETE /rides/<id>`

The map auto-fits with asymmetric padding: `top: 120, bottom: 350, left: 40, right: 40` — this pushes the route upward so it's visible above the stats overlay.

---

### 6.7 Ride Ratings

**Endpoint:** `POST /api/rides/:id/rate`

#### Logic
1. User sends rating (1-5 stars) with optional comment
2. Server checks if user already rated this ride:
   - If yes: updates existing rating entry
   - If no: pushes new entry to `ride.ratings` array
3. Rating stored as: `{ userId, rating, comment, timestamp }`
4. Average displayed on RideDetails page calculated client-side from array

**Note:** Admins cannot rate rides (enforced by frontend UI hiding the rate button). Backend does not enforce this — an admin could theoretically rate via direct API call.

---

### 6.8 Nearby Ride Discovery

**Endpoint:** `GET /api/rides/nearby?lat=<>&lng=<>&radius=<>`

#### How It Works

1. Frontend gets user's coordinates via browser geolocation
2. Backend constructs a MongoDB `$nearSphere` query:
   ```javascript
   Ride.find({
     location: {
       $nearSphere: {
         $geometry: {
           type: "Point",
           coordinates: [lng, lat]
         },
         $maxDistance: radius * 1000 // Convert km to meters
       }
     },
     status: { $in: ['active', 'scheduled'] }
   })
   ```
3. This query uses the **2dsphere index** on the `location` field for performance
4. Results are automatically sorted by distance (nearest first)
5. Frontend displays rides as horizontally scrollable cards

---

### 6.9 Community & Chat System

**Pages:** `Community.jsx`, `CommunityChat.jsx`, `CreateCommunity.jsx`

#### Chat Types

| Type | Key | Description |
|------|-----|-------------|
| Global Community | `receiverId=null, rideId=null` | Open chat for all users |
| Ride Chat | `rideId=<ObjectId>` | Group chat for ride participants |
| Direct Message | `receiverId=<ObjectId>` | 1-on-1 between two users |

#### Conversation List (Community Page)
1. `GET /api/chat/conversations` fetches all messages involving the user
2. Messages are grouped into conversations using a Map:
   - Global Community → key: `global_community`
   - Ride chats → key: `ride_<rideId>`
   - DMs → key: `user_<sortedUserIds>` (sorted to ensure A↔B = B↔A)
3. Each conversation shows: title, last message, sender name, timestamp, unread indicator
4. If no conversations exist, "Global Community" placeholder is shown

#### Chat Room (CommunityChat Page)
1. Chat type and target determined from URL query params
2. Messages fetched from `GET /api/chat/messages?type=<>&targetId=<>`
3. **Polling:** New messages checked every 3 seconds via `setInterval`
4. **Auto-scroll:** `useRef` + `scrollIntoView({ behavior: "smooth" })` on message updates
5. Own messages: orange gradient, right-aligned
6. Others' messages: dark background, left-aligned, with avatar generated from initials (ui-avatars.com)
7. For ride chats: "Live" badge with "View Ride" button linking to active ride

#### Create Community Page
1. Fetches user's created rides from `/api/rides/my`
2. Custom dropdown to select a ride to attach the community to
3. Form fields: Community Name, Description
4. Submit button (currently shows alert — API endpoint not yet implemented)

---

### 6.10 User Profile

**Page:** `Profile.jsx`

#### Sections
- **Profile Header** — Large avatar with gradient border, user name, subtitle
- **Stats Row** — 3-column layout: Total Rides (42), Total KM (120), Rider Rank (Top 10%)
- **Achievements** — Horizontally scrollable cards: Streak 5, Explorer, Top Rider
- **Metrics Grid** — 2×2 grid: Weekly Rides, Average Distance, Total Hours, Best Streak
- **Go Premium Banner** — CTA for premium features (Live Performance Ghost, Unlimited Route Planning)
- **Global Rank** — Leaderboard position (#124)
- **Account Settings** — List items: My Rides History, Saved Rides, Notifications, Payment Settings, Help & Support, Legal
- **Session Button** — "LOG OUT" (for authenticated users) or "LOG IN" (for guests), clears localStorage

**Note:** Stats are currently hardcoded. Future implementation would aggregate from ride history.

---

### 6.11 Admin Panel

**Page:** `AdminPanel.jsx`

#### Tabs

1. **Dashboard** — 3-column stat cards: Total Users, Total Rides, Total Messages (fetched from `GET /api/admin/stats`)

2. **Users** — Full user list with:
   - Name, email, initial avatar with gradient background
   - "ADMIN" badge for admin users
   - Toggle role button (promote/demote)
   - Delete user button (cascades: also deletes user's messages)

3. **Rides** — All rides with:
   - Title, participant count, status
   - Delete button (cascades: also deletes ride messages)

4. **Messages** — Latest 100 messages with:
   - Sender name, ride name badge, content preview, timestamp
   - Individual delete button per message
   - "Clear All" button (with double confirmation dialog)

#### Security
- Client-side guard: checks `localStorage.userRole === 'admin'`
- Server-side guard: all `/api/admin/*` routes use `[protect, adminOnly]` middleware
- Toast notification system for action feedback (auto-dismisses in 3 seconds)

---

## 7. Real-Time Communication

### Socket.IO Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `connection` | Client → Server | - | Client connects |
| `joinRideRoom` | Client → Server | `{ rideId }` | Join a room for targeted broadcasts |
| `locationUpdate` | Bidirectional | `{ rideId, lat, lng }` | Live GPS position update |
| `leaveRideRoom` | Client → Server | `{ rideId }` | Leave a ride room |
| `newRide` | Server → All | `{ ride }` | Broadcast new ride creation |
| `rideDeleted` | Server → All | `{ rideId }` | Broadcast ride deletion |
| `rideUpdated` | Server → All | `{ ride }` | Broadcast ride route update |

### Room Architecture

```
io.of("/")
├── Room: "ride_abc123"     ← Clients viewing ride abc123
│   ├── Client A (mobile)
│   ├── Client B (desktop)
│   └── Client C (mobile)
├── Room: "ride_def456"     ← Clients viewing ride def456
│   └── Client D
└── (default room)          ← All connected clients
    ├── Client A
    ├── Client B
    ├── Client C
    └── Client D
```

Events like `locationUpdate` are sent only to the specific ride room. Events like `newRide` are broadcast to the default room (all clients).

---

## 8. Geospatial Systems

### Coordinate Format

The application uses the **GeoJSON standard** throughout:
- Coordinates are always `[longitude, latitude]` (NOT `[lat, lng]`)
- Points use: `{ type: "Point", coordinates: [lng, lat] }`
- Routes use: `{ type: "Feature", geometry: { type: "LineString", coordinates: [[lng, lat], ...] } }`

### Haversine Distance Calculation

Used to calculate direct "as the crow flies" distance between two points:

```
a = sin²(Δlat/2) + cos(lat1) · cos(lat2) · sin²(Δlng/2)
c = 2 · atan2(√a, √(1-a))
d = R · c    (where R = 6,371 km, Earth's radius)
```

### Polyline Distance Calculation

For each segment of the route polyline:
1. Project user's position onto the line segment using vector math
2. Clamp the projection to the segment endpoints
3. Calculate distance from user to the projected point
4. Return the minimum distance across all segments

### MongoDB Geospatial Queries

The `2dsphere` index on `rides.location` enables:
- `$nearSphere`: finds rides within a radius, sorted by distance
- `$geoWithin`: finds rides within a polygon (not currently used but available)
- Distance calculations performed by the database engine (not in application code)

---

## 9. Mapbox Integration

### Dual-Token Architecture

| Context | Token Location | What it Accesses |
|---------|---------------|-----------------|
| Map tile rendering (browser) | `REACT_APP_MAPBOX_TOKEN` in frontend `.env` | Map tiles, styles, markers |
| Geocoding & Directions API | `MAPBOX_ACCESS_TOKEN` in backend `.env` | Places search, route calculation |

### Why a Backend Proxy?

The Mapbox Geocoding and Directions APIs use the same token as map tiles, but API calls reveal the full token in network requests. By proxying through the backend:

1. **Token security**: The token for API calls never reaches the browser
2. **Rate control**: The backend can limit requests (100/min/IP)
3. **Caching**: Repeated queries are served from memory (10-min TTL)
4. **Monitoring**: All API calls pass through a single point for logging

### Caching Strategy

```javascript
// Cache structure: Map<string, { data, timestamp }>
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000;  // 10 minutes
const MAX_CACHE_SIZE = 500;

// Cache key = full Mapbox API URL
// On hit: return data if (now - timestamp) < TTL
// On miss: fetch from Mapbox, cache result
// On size limit: clear oldest 100 entries
```

### API Endpoints via Proxy

1. **Geocoding**: `GET /api/mapbox/geocode?q=Delhi`
   - Proxies to: `https://api.mapbox.com/geocoding/v5/mapbox.places/Delhi.json`
   - Returns: Array of features with `place_name` and `center` [lng, lat]

2. **Directions**: `GET /api/mapbox/directions?start=77.21,28.61&end=77.23,28.63&profile=cycling`
   - Proxies to: `https://api.mapbox.com/directions/v5/mapbox/cycling/77.21,28.61;77.23,28.63`
   - Returns: Route geometry, distance, duration

---

## 10. Security Architecture

### Defense Layers

| Layer | Implementation | Protects Against |
|-------|---------------|-----------------|
| **Transport** | HTTPS (via Render/Vercel) | Man-in-the-middle attacks |
| **Authentication** | JWT with required secret | Unauthorized access |
| **Authorization** | Role-based middleware | Privilege escalation |
| **Input Validation** | Required fields in schemas | Incomplete data |
| **Password Security** | bcrypt (10 rounds) | Credential theft |
| **API Security** | Backend Mapbox proxy | Token exposure |
| **Rate Limiting** | 100 req/min/IP on proxy | API abuse |
| **Caching** | 10-min TTL, max 500 entries | Free tier exhaustion |
| **Secret Management** | .env + .gitignore | Secret leakage in VCS |
| **Credential Safety** | URI not logged to console | Log-based credential theft |
| **CORS** | Configurable origin | Cross-site request forgery |

### JWT Structure

```
Header:  { "alg": "HS256", "typ": "JWT" }
Payload: { "id": "<MongoDB ObjectId>", "iat": <timestamp>, "exp": <+30 days> }
Signature: HMAC-SHA256(header.payload, JWT_SECRET)
```

The JWT does NOT contain the user's role. Role is fetched fresh from the database on each authenticated request. This ensures role changes take effect immediately.

---

## 11. API Architecture

### Complete Endpoint Reference

#### Authentication (`/api/auth`)

| Method | Path | Auth | Body/Params | Response |
|--------|------|------|-------------|----------|
| `POST` | `/register` | None | `{ name, email, password }` | `{ user: { _id, name, email, role, token } }` |
| `POST` | `/login` | None | `{ email, password }` | `{ user: { _id, name, email, role, token } }` |
| `GET` | `/me` | Bearer | - | `{ _id, name, email, role }` |

#### Rides (`/api/rides`)

| Method | Path | Auth | Body/Params | Response |
|--------|------|------|-------------|----------|
| `GET` | `/` | None | - | `{ rides: [...] }` |
| `GET` | `/scheduled` | None | - | `{ rides: [...] }` |
| `GET` | `/nearby` | None | `?lat=&lng=&radius=` | `{ rides: [...] }` |
| `GET` | `/my` | None | `?createdByName=` | `{ rides: [...] }` |
| `GET` | `/:id` | None | - | `{ ride: {...} }` |
| `POST` | `/` | Bearer | `{ rideName, title, location, destination, route, ... }` | `{ success, ride }` |
| `POST` | `/schedule` | Admin | `{ rideName, startCoords, endCoords, scheduledStartTime }` | `{ success, ride }` |
| `POST` | `/:id/join` | Bearer | `{ latitude, longitude }` | `{ success, ride }` |
| `POST` | `/:id/rate` | Bearer | `{ rating, comment }` | `{ success, ride }` |
| `PUT` | `/:id/location` | None | `{ latitude, longitude }` | `{ success, ride }` |
| `PUT` | `/:id/complete` | None | - | `{ success, ride }` |
| `DELETE` | `/:id` | Admin | - | `{ success, message }` |

#### Mapbox Proxy (`/api/mapbox`)

| Method | Path | Auth | Params | Response |
|--------|------|------|--------|----------|
| `GET` | `/geocode` | None | `?q=<query>` | `{ features: [...] }` |
| `GET` | `/directions` | None | `?start=lng,lat&end=lng,lat&profile=cycling` | `{ success, route: { geometry, duration, distance } }` |

#### Chat (`/api/chat`)

| Method | Path | Auth | Body/Params | Response |
|--------|------|------|-------------|----------|
| `GET` | `/conversations` | Bearer | - | `{ success, conversations: [...] }` |
| `GET` | `/messages` | Bearer | `?type=&targetId=` | `{ success, messages: [...] }` |
| `POST` | `/messages` | Bearer | `{ content, type, targetId }` | `{ success, message: {...} }` |

#### Admin (`/api/admin`)

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `GET` | `/stats` | Admin | - | `{ success, stats: { users, rides, messages } }` |
| `GET` | `/users` | Admin | - | `{ success, users: [...] }` |
| `GET` | `/rides` | Admin | - | `{ success, rides: [...] }` |
| `GET` | `/messages` | Admin | - | `{ success, messages: [...] }` |
| `PUT` | `/users/:id/role` | Admin | `{ role }` | `{ success }` |
| `DELETE` | `/users/:id` | Admin | - | `{ success }` |
| `DELETE` | `/rides/:id` | Admin | - | `{ success }` |
| `DELETE` | `/messages/:id` | Admin | - | `{ success }` |
| `DELETE` | `/messages-clear-all` | Admin | - | `{ success, message }` |

#### Health Check

| Method | Path | Auth | Response |
|--------|------|------|----------|
| `GET` | `/health` | None | `{ status: 'ok' }` |

---

## 12. Frontend Architecture

### Page Map

```
/                  → Login.jsx (default route)
/login             → Login.jsx
/register          → Register.jsx
/landing           → Landing.jsx (static demo page)
/home              → Home.jsx [PROTECTED]
/campaign          → Campaign.jsx [PROTECTED]
/create-campaign   → CreateCampaign.jsx
/campaign-details  → CampaignDetails.jsx (static demo)
/live-campaign     → LiveCampaign.jsx (static demo)
/ride/:id          → RideDetails.jsx [PROTECTED]
/ride-active/:id   → RideActive.jsx
/ride-active       → RideActive.jsx
/active            → ActiveRides.jsx [PROTECTED]
/create-ride       → CreateRide.jsx [PROTECTED] (legacy)
/community         → Community.jsx [PROTECTED]
/create-community  → CreateCommunity.jsx [PROTECTED]
/community-chat    → CommunityChat.jsx
/chat/:id          → Chat.jsx [PROTECTED] (legacy)
/profile           → Profile.jsx [PROTECTED]
/admin             → AdminPanel.jsx [PROTECTED]
```

### Component Hierarchy

```
<App>
├── <BrowserRouter>
│   └── <Routes>
│       ├── <Login />
│       ├── <Register />
│       ├── <Home />
│       │   └── (inline BottomNav)
│       ├── <Campaign />
│       │   └── (inline BottomNav)
│       ├── <CreateCampaign />
│       │   └── <LocationInput /> (×2)
│       ├── <RideDetails />
│       │   └── <Map>, <Source>, <Layer>, <Marker>
│       ├── <RideActive />
│       │   └── <Map>, <Source>, <Layer>, <Marker>
│       ├── <Community />
│       │   └── (inline BottomNav)
│       ├── <CommunityChat />
│       ├── <Profile />
│       │   └── (inline BottomNav)
│       ├── <AdminPanel />
│       └── (Legacy pages: ActiveRides, Chat, CreateRide)
│           └── <BottomNav />, <RideCard />, <SectionHeader />
```

### State Management

The application uses **local component state** (React `useState`) rather than a global state manager (Redux, Context API). This was chosen because:
1. Most state is page-specific (form data, ride details)
2. Cross-page state (auth) is managed via `localStorage`
3. Real-time state (live locations) is managed via Socket.IO events
4. Simplifies the codebase and reduces dependencies

---

## 13. Design System & UI/UX

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#ff8f75` | CTAs, active states, accent text |
| Primary Dark | `#ff7859` | Gradient endpoints, hover states |
| Secondary | `#e6a7ff` | Admin badges, secondary accent |
| Error | `#ff6e84` | Error messages, delete buttons |
| Surface | `#0e0e0e` | Main background |
| Surface Container | `#1a1919` | Card backgrounds |
| Surface Bright | `#2c2c2c` | Elevated surfaces, inputs |
| Text Primary | `#ffffff` | Main text |
| Text Secondary | `#adaaaa` | Muted text, labels |
| Text Disabled | `#767575` | Placeholder text |
| Border | `#484847` | Subtle borders |

### Typography

| Font | Usage |
|------|-------|
| Plus Jakarta Sans | Headings, app bar titles |
| Inter | Body text, labels, navigation |
| Material Symbols Outlined | Icons throughout |

### Design Patterns

1. **Glassmorphism** — Backdrop blur + semi-transparent backgrounds (`backdrop-blur-xl bg-[#2c2c2c]/60`)
2. **Gradient Accents** — Orange-to-coral gradients on primary CTAs (`from-[#ff8f75] to-[#ff7859]`)
3. **Rounded Corners** — Consistent use of large border radii (`rounded-[28px]`, `rounded-full`)
4. **Micro-animations** — Scale on press (`active:scale-95`), hover brightness, smooth transitions
5. **Dark Mode Only** — No light mode variant; the dark theme is integral to the identity

### Bottom Navigation

Every main page includes a bottom navigation bar with 4 tabs:
- Home (house icon)
- Campaign (explore icon)
- Community (group icon)
- Settings/Profile (settings icon)

Active tab has an orange gradient pill background. The nav bar uses glassmorphism with a 3rem top border radius.

---

## 14. Deployment Architecture

```
┌────────────────────────────────────────────┐
│           PRODUCTION ENVIRONMENT           │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────┐    ┌──────────────────┐ │
│  │   Vercel     │    │    Render        │ │
│  │   (Frontend) │    │    (Backend)     │ │
│  │              │    │                  │ │
│  │  React build │◄──►│  Express + WS    │ │
│  │  Static CDN  │    │  Free tier       │ │
│  │              │    │  (spins down     │ │
│  │  Env vars:   │    │   after 15min)   │ │
│  │  API_URL     │    │                  │ │
│  │  MAPBOX_TOKEN│    │  Env vars:       │ │
│  └──────────────┘    │  MONGODB_URI     │ │
│         ▲            │  JWT_SECRET      │ │
│         │            │  MAPBOX_TOKEN    │ │
│     HTTPS CDN        │  CORS_ORIGIN     │ │
│         │            └────────┬─────────┘ │
│         │                     │            │
│  ┌──────┴──────┐    ┌────────▼─────────┐ │
│  │ Browser     │    │ MongoDB Atlas    │ │
│  │ (Client)    │    │ (M0 Free Tier)   │ │
│  └─────────────┘    └──────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  cron-job.org                        │ │
│  │  Pings /health every 10 min         │ │
│  │  (prevents Render spin-down)         │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

### Deployment Steps Summary

1. **MongoDB Atlas** — Free M0 cluster, whitelist `0.0.0.0/0`, create DB user
2. **Render** — Connect GitHub, root: `backend`, build: `npm install`, start: `node server.js`, add all env vars
3. **Vercel** — Import repo, root: `frontend`, framework: CRA, add env vars
4. **Mapbox** — Restrict frontend token to Vercel domain URL
5. **Cron Job** — Set up pinger for backend `/health` every 10 minutes

---

## 15. Data Flow Diagrams

### Ride Creation Flow

```
User fills form → CreateCampaign.jsx
    │
    ├─ Geocode start? → GET /api/mapbox/geocode → Mapbox API (cached)
    ├─ Geocode end?   → GET /api/mapbox/geocode → Mapbox API (cached)
    ├─ Route?         → GET /api/mapbox/directions → Mapbox API (cached)
    │
    └─ Submit → POST /api/rides
                    │
                    ├─ Create Ride document in MongoDB
                    ├─ Socket.IO emit 'newRide' to all clients
                    └─ Return { success: true, ride }
```

### Ride Joining Flow

```
User clicks "Join" → RideDetails.jsx
    │
    ├─ navigator.geolocation.getCurrentPosition()
    │
    └─ POST /api/rides/:id/join { lat, lng }
            │
            ├─ Validate ride exists, not full, not completed
            ├─ Haversine: user ↔ vehicle ≤ 5km?
            ├─ Polyline: user ↔ route ≤ 5km?
            │
            ├─ REJECT (400) → Frontend shows "Out of Range" modal
            │
            └─ ACCEPT →
                ├─ Add waypoint to ride.waypoints[]
                ├─ Recalculate route via Mapbox Directions (through all waypoints)
                ├─ Save updated ride to MongoDB
                ├─ Socket.IO emit 'rideUpdated' to ride room
                └─ Return { success: true, ride }
```

---

## 16. Error Handling & Edge Cases

### Handled Edge Cases

| Scenario | Handling |
|----------|----------|
| Geolocation denied by browser | Falls back to Delhi coordinates (28.6139, 77.2090) |
| User already joined a ride | Returns error "Already joined" |
| Ride is full (maxPassengers reached) | Button disabled, shows "Ride Full" |
| Ride completed | Button disabled, shows "Ride Completed" |
| Invalid/expired JWT | Returns 401, frontend shows login page |
| MongoDB connection failure | Server exits with code 1 (platform auto-restarts) |
| Mapbox API failure | Returns error, cache miss logged |
| Rate limit exceeded | Returns 429 with retry instruction |
| Missing JWT_SECRET env var | Server crashes on startup (intentional — no fallback) |
| MultiLineString route geometry | Auto-flattened to LineString on frontend |
| Guest user (no token) | Profile defaults to "User", chat/join disabled |

---

## 17. Maintenance & Operations

### Utility Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `make_admin.js` | `node make_admin.js email@example.com` | Promote user to admin |
| `fix_routes.js` | `node fix_routes.js` | Backfill route data for scheduled rides |
| `clearDB.js` | `node clearDB.js` | Delete all rides and users (⚠️ destructive) |
| `test-vehicle-simulator.js` | `node test-vehicle-simulator.js` | Simulate moving vehicle via Socket.IO |

### Environment Variables Reference

#### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `MONGODB_URI` | **Yes** | - | MongoDB Atlas connection string |
| `JWT_SECRET` | **Yes** | - | JWT signing secret (crash if missing) |
| `MAPBOX_ACCESS_TOKEN` | **Yes** | - | Server-side Mapbox token |
| `CORS_ORIGIN` | No | `*` | Allowed frontend origin |
| `MASTER_ADMIN_EMAIL` | No | - | Auto-promote this email to admin |
| `MAX_JOIN_DISTANCE_KM` | No | `5` | Proximity join threshold |

#### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REACT_APP_API_URL` | **Yes** | `http://localhost:5000` | Backend API URL |
| `REACT_APP_MAPBOX_TOKEN` | **Yes** | - | Client-side Mapbox token (map tiles only) |
| `REACT_APP_DEFAULT_LAT` | No | `28.6139` | Default map center latitude |
| `REACT_APP_DEFAULT_LNG` | No | `77.2090` | Default map center longitude |
| `REACT_APP_DEFAULT_ZOOM` | No | `12` | Default map zoom level |

---

## 18. Known Limitations & Future Roadmap

### Current Limitations

1. **No WebSocket for chat** — Chat uses HTTP polling (3s interval). Future: Socket.IO-based real-time messaging.
2. **Hardcoded profile stats** — Profile page shows static numbers. Future: aggregate from ride history.
3. **No image uploads** — Profile photos and ride images are external URLs. Future: integrate cloud storage (S3/Cloudinary).
4. **No password reset** — "Forgot Password" button exists but has no functionality. Future: email-based reset flow.
5. **No push notifications** — Notification bell is UI-only. Future: Web Push API or Firebase Cloud Messaging.
6. **Social login is decorative** — Google/Apple/Facebook buttons have no OAuth integration.
7. **Single-server architecture** — No horizontal scaling. Socket.IO rooms would need Redis adapter for multi-server.
8. **Create Community is incomplete** — Form submits but API endpoint is not implemented (shows alert).
9. **Vehicle simulator requires manual ride ID** — Must hardcode `RIDE_ID` in the script.
10. **updateLocation and completeRide are public** — No auth required; should be secured for production.

### Future Roadmap

- [ ] Real-time chat via Socket.IO (replace polling)
- [ ] User profile image uploads (Cloudinary integration)
- [ ] Password reset via email (SendGrid/Nodemailer)
- [ ] OAuth social login (Google, Apple, Facebook)
- [ ] Push notifications for ride updates
- [ ] Ride history and statistics aggregation
- [ ] Community group creation API
- [ ] Ride replay/playback from waypoint history
- [ ] Progressive Web App (PWA) support
- [ ] Dark/Light mode toggle
- [ ] Internationalization (i18n) support

---

> **End of PROJECT_DETAILS.md** — This document provides a comprehensive reference covering every aspect of the GoRIDE / Happiness Campaign application.
