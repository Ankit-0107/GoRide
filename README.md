# 🎉 GoRIDE — Happiness Campaign Real-Time Ride Tracking System

A full-stack MERN application for organizing and tracking community "Happiness Rides" in real-time. Users can create geo-routed cycling campaigns, discover and join nearby rides within 5km proximity, communicate via community chat, and track rides live on interactive Mapbox maps. Admins manage the entire platform through a dedicated admin panel.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Setup Guide](#-setup-guide)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. MongoDB Atlas Setup](#2-mongodb-atlas-setup)
  - [3. Mapbox Setup](#3-mapbox-setup)
  - [4. Backend Setup](#4-backend-setup)
  - [5. Frontend Setup](#5-frontend-setup)
  - [6. Run the Application](#6-run-the-application)
- [Security & API Protection](#-security--api-protection)
- [Deployment (Free Tier)](#-deployment-free-tier)
- [Admin Setup Guide](#-admin-setup-guide)
- [User Roles & Permissions](#-user-roles--permissions)
- [API Reference](#-api-reference)
- [Features](#-features)
- [Architecture](#-architecture)
- [Testing with Vehicle Simulator](#-testing-with-vehicle-simulator)
- [Troubleshooting](#-troubleshooting)
- [Documentation](#-documentation)

---

## 🛠 Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Frontend     | React.js, Mapbox GL JS, Material UI     |
| Backend      | Node.js, Express.js                     |
| Database     | MongoDB Atlas (Cloud)                   |
| Real-time    | Socket.IO                               |
| Auth         | JWT (jsonwebtoken), bcryptjs            |
| Maps/Routing | Mapbox Directions & Geocoding API       |
| Deployment   | Render (backend), Vercel (frontend)     |

---

## 📁 Project Structure

```
random1/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, GetMe (+ master admin auto-promotion)
│   │   ├── rideController.js      # CRUD for rides + join + rate + location update
│   │   └── chatController.js      # Community chat, ride chat, direct messages
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT protect + adminOnly guard
│   ├── models/
│   │   ├── Ride.js                # Ride schema (GeoJSON location, route, ratings, waypoints)
│   │   ├── userModel.js           # User schema (name, email, password hash, role)
│   │   └── Message.js             # Message schema (community, ride, and DM chats)
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/*
│   │   ├── rideRoutes.js          # /api/rides/*
│   │   ├── mapboxRoutes.js        # /api/mapbox/* (proxy with rate limiting)
│   │   ├── chatRoutes.js          # /api/chat/* (conversations, messages)
│   │   └── adminRoutes.js         # /api/admin/* (user/ride/message management)
│   ├── services/
│   │   ├── mapboxService.js       # Mapbox API proxy + in-memory caching
│   │   └── rideService.js         # Core business logic (join proximity, route recalc)
│   ├── sockets/
│   │   └── rideSocket.js          # Socket.IO event handlers (rooms, broadcasts)
│   ├── utils/
│   │   └── distance.js            # Haversine & polyline distance calculations
│   ├── make_admin.js              # CLI: promote user to admin by email
│   ├── fix_routes.js              # CLI: backfill route data for scheduled rides
│   ├── clearDB.js                 # CLI: wipe all Ride and User collections
│   ├── test-vehicle-simulator.js  # CLI: simulate moving vehicle via Socket.IO
│   ├── server.js                  # Express + Socket.IO entry point
│   ├── .env                       # Environment variables (DO NOT COMMIT)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js             # Axios instance with JWT interceptor
│   │   ├── components/
│   │   │   ├── BottomNav.jsx      # Fixed bottom navigation bar (MUI)
│   │   │   ├── RideCard.jsx       # Ride card component (MUI)
│   │   │   └── SectionHeader.jsx  # Reusable section header (MUI)
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Login page (glassmorphism dark UI)
│   │   │   ├── Register.jsx       # Registration page
│   │   │   ├── Landing.jsx        # Static landing/demo page
│   │   │   ├── Home.jsx           # Home dashboard (scheduled rides, nearby, offers)
│   │   │   ├── Campaign.jsx       # Campaign management (my rides, trending)
│   │   │   ├── CreateCampaign.jsx # Full ride creation (map, geocoding, route, schedule)
│   │   │   ├── CampaignDetails.jsx# Static ride detail demo
│   │   │   ├── RideDetails.jsx    # Dynamic ride detail (map, join, stats, rating)
│   │   │   ├── RideActive.jsx     # Full-screen active ride tracking with map
│   │   │   ├── LiveCampaign.jsx   # Static live ride demo
│   │   │   ├── activerides.jsx    # All rides list (legacy MUI page)
│   │   │   ├── Community.jsx      # Chat conversations list
│   │   │   ├── CommunityChat.jsx  # Chat room (global, ride, DM)
│   │   │   ├── CreateCommunity.jsx# Create community group form
│   │   │   ├── CreateRide.jsx     # Simple ride creation (legacy MUI page)
│   │   │   ├── chat.jsx           # Basic chat (legacy MUI page)
│   │   │   ├── Profile.jsx        # User profile, stats, achievements, settings
│   │   │   └── AdminPanel.jsx     # Admin dashboard (users, rides, messages)
│   │   ├── App.js                 # React Router with route guards
│   │   └── index.js               # React entry point
│   ├── .env                       # Frontend env (DO NOT COMMIT)
│   └── package.json
├── CODE_LOGIC.md                  # Line-by-line code explanations
├── PROJECT_DETAILS.md             # Comprehensive feature & architecture docs
├── README.md                      # This file
└── .gitignore
```

---

## ✅ Prerequisites

Before you begin, make sure you have:

- **Node.js** v16 or later → [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** → [Download](https://git-scm.com/)
- **MongoDB Atlas account** (free) → [Sign up](https://www.mongodb.com/atlas)
- **Mapbox account** (free) → [Sign up](https://account.mapbox.com/auth/signup/)
- **Modern browser** (Chrome, Firefox, Edge)

---

## 🚀 Setup Guide

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd random1
```

---

### 2. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) and sign in.
2. Click **"Build a Database"** → choose the **Free Shared** tier.
3. Select a cloud provider and region closest to you.
4. Click **"Create Cluster"** and wait for it to provision (~2 minutes).
5. Under **Database Access**, click **"Add New Database User"**:
   - Enter a username and a strong password.
   - Grant **Read and write to any database**.
   - Click **"Add User"**.
6. Under **Network Access**, click **"Add IP Address"**:
   - Click **"Allow Access from Anywhere"** (`0.0.0.0/0`) for development.
   - Click **"Confirm"**.
7. Go back to **Database** → click **"Connect"** on your cluster.
8. Choose **"Connect your application"**.
9. Copy the connection string. It will look like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
10. Replace `<username>` and `<password>` with your database user credentials.
11. Add a database name after `.net/`, for example:
    ```
    mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/happiness_campaign?retryWrites=true&w=majority
    ```

> **Save this connection string.** You'll need it in Step 4.

---

### 3. Mapbox Setup

1. Go to [Mapbox](https://account.mapbox.com/) and sign in.
2. On your dashboard, copy your **Default public token** (starts with `pk.`).
3. **Restrict your token by URL:** Click on your token → add your deployed frontend URL (e.g., `https://your-app.vercel.app`) under "URL restrictions". This prevents unauthorized usage.

> **Save this token.** You'll need it for both backend and frontend `.env` files.
>
> **Free tier limits:** 50K map loads, 100K geocoding requests, 100K directions requests per month.

---

### 4. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string (from Step 2)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/happiness_campaign?retryWrites=true&w=majority

# JWT Secret — REQUIRED (app will crash without this)
JWT_SECRET=your_super_secret_jwt_key_here_change_this

# Mapbox (from Step 3) — used server-side for Geocoding & Directions proxy
MAPBOX_ACCESS_TOKEN=pk.your_mapbox_public_token_here

# CORS origin (your frontend URL)
CORS_ORIGIN=http://localhost:3000

# Optional: Auto-promote this email to admin on registration
# MASTER_ADMIN_EMAIL=admin@example.com

# Optional: Max distance to join a ride (default: 5km)
# MAX_JOIN_DISTANCE_KM=5
```

#### Important Notes:
- **`JWT_SECRET` is required.** The app will crash on startup if it's missing. Use a long random string.
- **`MAPBOX_ACCESS_TOKEN`** is used **server-side only** for Geocoding and Directions via the proxy (`/api/mapbox/*`). The token is never sent to the frontend for these API calls.
- The `MONGODB_URI` variable name must match exactly (the app uses `process.env.MONGODB_URI`).

---

### 5. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` folder:

```env
# Backend API URL (no trailing slash)
REACT_APP_API_URL=http://localhost:5000

# Mapbox token — used ONLY for map tile rendering in the browser
# API calls (geocoding, directions) are proxied through the backend
# Restrict this token by URL in your Mapbox dashboard for security
REACT_APP_MAPBOX_TOKEN=pk.your_mapbox_public_token_here

# Optional: Default map center coordinates
REACT_APP_DEFAULT_LAT=28.6139
REACT_APP_DEFAULT_LNG=77.2090
REACT_APP_DEFAULT_ZOOM=12
```

---

### 6. Run the Application

Open **two separate terminals**:

**Terminal 1 — Start the Backend:**
```bash
cd backend
npm run dev
```
You should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

**Terminal 2 — Start the Frontend:**
```bash
cd frontend
npm start
```
The app will open at `http://localhost:3000`.

---

## 👑 Admin Setup Guide

The system uses role-based access control. By default, all new registrations create a **regular user**. There are three ways to create an admin:

### Method 1: Master Admin Environment Variable (Recommended)

Add to `backend/.env`:
```env
MASTER_ADMIN_EMAIL=admin@example.com
```
Any user registering with this email is automatically promoted to admin.

### Method 2: CLI Script

Register an account first, then run:
```bash
cd backend
node make_admin.js admin@example.com
```

Expected output:
```
✅ Connected to MongoDB Atlas
🎉 Success! "Admin User" (admin@example.com) is now an ADMIN.
```

### Method 3: Admin Panel

An existing admin can toggle any user's role through the **Users tab** in the Admin Panel (`/admin`).

### After Promotion

**Important:** You must **log out and log back in** after promotion. This ensures the JWT token is refreshed with the new `admin` role stored in localStorage.

After logging in as admin, you should see:
- ✅ **Shield icon** in the home page header (links to Admin Panel)
- ✅ **Admin Panel** at `/admin` with Dashboard, Users, Rides, and Messages tabs
- ✅ **Full CRUD controls** for managing all platform data

---

## 🔐 User Roles & Permissions

| Feature                            | Admin | Regular User |
|------------------------------------|-------|-------------|
| Register & Login                   | ✅    | ✅          |
| View rides on interactive map      | ✅    | ✅          |
| View ride routes on map            | ✅    | ✅          |
| Discover nearby rides              | ✅    | ✅          |
| Join rides (within 5km range)      | ✅    | ✅          |
| Rate rides (⭐ 1–5 stars)          | ❌    | ✅          |
| Create rides/campaigns             | ✅    | ✅          |
| Schedule new rides                 | ✅    | ❌          |
| Delete any ride                    | ✅    | ❌          |
| Send chat messages                 | ✅    | ✅          |
| Manage users (promote/delete)      | ✅    | ❌          |
| Manage messages (delete/clear all) | ✅    | ❌          |
| Access Admin Panel                 | ✅    | ❌          |

---

## 🔒 Security & API Protection

| Protection | Details |
|---|---|
| **Mapbox Token Proxy** | All Mapbox Geocoding & Directions API calls go through the backend (`/api/mapbox/*`). The token is never exposed to the browser for these calls. |
| **Rate Limiting** | Backend Mapbox proxy endpoints are rate-limited to 100 requests/min per IP (custom in-memory implementation). |
| **Response Caching** | Geocoding and Directions results are cached for 10 minutes (max 500 entries) to reduce API usage and stay within Mapbox free tier. |
| **JWT Security** | No fallback secrets — `JWT_SECRET` environment variable is required or the app will crash on startup. |
| **Password Hashing** | bcrypt with 10 salt rounds. Plaintext passwords never stored or logged. |
| **Credential Safety** | MongoDB connection strings are never printed to console logs. |
| **URL Restrictions** | Set allowed URLs on your Mapbox dashboard to restrict the client-side map tile token. |
| **Environment Variables** | All secrets stored in `.env` files, excluded from git via `.gitignore`. |
| **CORS** | Configurable `CORS_ORIGIN` for production — no wildcard in production. |
| **Role-Based Access** | Admin routes protected by `protect` + `adminOnly` middleware chain. |

---

## 🌐 Deployment (Free Tier)

You can deploy this entire app for free:

| Service | Platform | Free Tier |
|---------|----------|-----------|
| **Database** | [MongoDB Atlas](https://mongodb.com/atlas) | M0 cluster (512MB) |
| **Backend** | [Render](https://render.com) | Free Web Service (spins down after 15 min inactivity) |
| **Frontend** | [Vercel](https://vercel.com) | Unlimited static deployments |

### Quick Steps:

1. **MongoDB Atlas:** Create a free M0 cluster, add a database user, whitelist `0.0.0.0/0`.
2. **Render (Backend):**
   - Connect your GitHub repo → Root Directory: `backend`
   - Build Command: `npm install` → Start Command: `node server.js`
   - Add all env vars from `backend/.env` (use your Atlas URI, a strong `JWT_SECRET`, etc.)
   - Set `CORS_ORIGIN` to your Vercel URL
3. **Vercel (Frontend):**
   - Import repo → Root Directory: `frontend` → Framework: Create React App
   - Add env vars: `REACT_APP_API_URL=https://your-backend.onrender.com` + Mapbox token
4. **Mapbox Dashboard:** Restrict your token to your Vercel domain URL.

> **Note:** Render free tier spins down after inactivity. Use [cron-job.org](https://cron-job.org) to ping your `/health` endpoint every 10 minutes to keep it alive.

---

## 📡 API Reference

### Authentication

| Method | Endpoint            | Access  | Description          |
|--------|---------------------|---------|----------------------|
| POST   | `/api/auth/register` | Public  | Register new user    |
| POST   | `/api/auth/login`    | Public  | Login & get JWT      |
| GET    | `/api/auth/me`       | Private | Get current user info |

### Rides

| Method | Endpoint                  | Access       | Description                     |
|--------|---------------------------|--------------|---------------------------------|
| GET    | `/api/rides`              | Public       | Get all active rides            |
| GET    | `/api/rides/scheduled`    | Public       | Get all scheduled rides         |
| GET    | `/api/rides/nearby`       | Public       | Find rides within radius        |
| GET    | `/api/rides/my`           | Public       | Get rides by creator name       |
| GET    | `/api/rides/:id`          | Public       | Get ride by ID                  |
| POST   | `/api/rides`              | Authenticated | Create a new ride              |
| POST   | `/api/rides/schedule`     | Admin only   | Schedule a new ride             |
| POST   | `/api/rides/:id/join`     | Authenticated | Join ride (5km proximity check) |
| POST   | `/api/rides/:id/rate`     | Authenticated | Rate a ride (1–5 stars)         |
| DELETE | `/api/rides/:id`          | Admin only   | Delete a ride                   |
| PUT    | `/api/rides/:id/location` | Public       | Update vehicle location         |
| PUT    | `/api/rides/:id/complete` | Public       | Mark ride as completed          |

### Chat

| Method | Endpoint                  | Access       | Description                    |
|--------|---------------------------|--------------|--------------------------------|
| GET    | `/api/chat/conversations` | Authenticated | Get all user conversations    |
| GET    | `/api/chat/messages`      | Authenticated | Get messages for a conversation|
| POST   | `/api/chat/messages`      | Authenticated | Send a message                |

### Admin

| Method | Endpoint                      | Access     | Description                    |
|--------|-------------------------------|------------|--------------------------------|
| GET    | `/api/admin/stats`            | Admin only | Platform statistics            |
| GET    | `/api/admin/users`            | Admin only | List all users                 |
| GET    | `/api/admin/rides`            | Admin only | List all rides                 |
| GET    | `/api/admin/messages`         | Admin only | List recent messages           |
| PUT    | `/api/admin/users/:id/role`   | Admin only | Change user role               |
| DELETE | `/api/admin/users/:id`        | Admin only | Delete user + their messages   |
| DELETE | `/api/admin/rides/:id`        | Admin only | Delete ride + its messages     |
| DELETE | `/api/admin/messages/:id`     | Admin only | Delete single message          |
| DELETE | `/api/admin/messages-clear-all` | Admin only | Delete ALL messages          |

### Mapbox Proxy (Rate Limited: 100/min/IP)

| Method | Endpoint                  | Access | Description                     |
|--------|---------------------------|--------|---------------------------------|
| GET    | `/api/mapbox/geocode?q=<query>` | Public | Search places (cached 10 min)  |
| GET    | `/api/mapbox/directions?start=lng,lat&end=lng,lat&profile=cycling` | Public | Get route directions (cached 10 min) |

### Health Check

| Method | Endpoint  | Access | Description              |
|--------|-----------|--------|--------------------------|
| GET    | `/health` | Public | Returns `{ status: 'ok' }` |

---

## ✨ Features

### 🗺️ Interactive Real-Time Maps
- Mapbox GL JS powered map with dark theme (`dark-v11`)
- Route polylines rendered as GeoJSON layers
- Start (orange) and end (white) markers on routes
- Auto-fit map bounds to show entire routes
- Zoom controls overlay
- Vignette overlay for cinematic effect on active rides

### 🔐 JWT Authentication
- Secure registration and login
- Password hashing with bcrypt (10 salt rounds)
- JWT tokens valid for 30 days
- Axios interceptor auto-attaches token to all API calls
- Master admin auto-promotion via environment variable

### 📅 Campaign Creation & Scheduling
- Interactive route creation with geocoded search
- Mapbox Directions API for cycling route calculation
- Route preview rendered on map in real-time
- Difficulty selector (Easy/Medium/Hard)
- Max participants limit
- Date/time scheduling with repeat options (daily/weekly)
- Partner integration checkboxes

### 🌍 Nearby Ride Discovery
- MongoDB `$nearSphere` geospatial query with `2dsphere` index
- Automatic browser geolocation (HTML5 Geolocation API)
- Configurable search radius (default: 10km)
- Fallback to Delhi coordinates if geolocation denied

### 🚗 Smart Join (Proximity Validation)
- Must be within **5km of the vehicle** (Haversine formula)
- Must be within **5km of the route polyline** (segment distance)
- Route automatically recalculates through the user's pickup point
- "Out of Range" modal displayed if too far
- All connected clients see the updated route instantly

### ⭐ Ride Ratings
- Users can rate rides 1–5 stars with optional comments
- Average rating displayed on ride details
- One rating per user per ride (updates on re-rate)
- Admins manage rides rather than rating them

### 💬 Community Chat System
- **Global Community Chat** — open group for all users
- **Ride Chat** — group chat for ride participants
- **Direct Messages** — 1-on-1 conversations
- Real-time message polling (3-second interval)
- Unread message indicators
- Auto-scroll to latest messages
- User avatars generated from initials

### 🛡️ Admin Panel
- Platform dashboard with user/ride/message counts
- Full user management (view, promote/demote, delete)
- Ride management (view, delete with cascade)
- Message moderation (view, delete individual, clear all)
- Toast notification feedback system

### 🌗 Premium Dark UI
- Full dark theme with glassmorphism effects
- Orange-coral gradient accents (`#ff8f75` → `#ff7859`)
- Plus Jakarta Sans headings, Inter body text
- Material Symbols Outlined icons
- Smooth entry animations and micro-interactions
- Responsive layout (mobile-first design)
- Rounded card system (`28px` border radius)

---

## 🏛 Architecture

```
┌──────────────────┐       Socket.IO        ┌──────────────────┐
│                  │◄──────────────────────►│                  │
│   React.js       │                        │   Express.js     │
│   Frontend       │──── REST API ──────────│   Backend        │
│                  │   (Axios + JWT)        │                  │
│   Pages:         │                        │   Routes:        │
│   • Home         │                        │   • Auth         │
│   • Campaign     │                        │   • Rides        │
│   • RideDetails  │                        │   • Chat         │
│   • Community    │                        │   • Admin        │
│   • AdminPanel   │                        │   • Mapbox Proxy │
│   • Profile      │                        │   • Socket.IO    │
│                  │                        │   • Rate Limiter │
└──────────────────┘                        └────────┬─────────┘
                                              │            │
                                     Mongoose │            │ HTTPS
                                              ▼            ▼
                                    ┌────────────┐ ┌──────────────┐
                                    │ MongoDB    │ │ Mapbox APIs  │
                                    │ Atlas (DB) │ │ (Geocoding,  │
                                    │            │ │  Directions) │
                                    │ • Users    │ │              │
                                    │ • Rides    │ │  Cached +    │
                                    │ • Messages │ │  Rate Limited│
                                    │ • 2dsphere │ │              │
                                    └────────────┘ └──────────────┘
```

---

## 🧪 Testing with Vehicle Simulator

To simulate a moving vehicle for demo purposes:

1. Create a ride first (via the UI or API)
2. Copy the ride's MongoDB `_id`
3. Edit `backend/test-vehicle-simulator.js` and set `RIDE_ID` to the copied ID
4. Run:

```bash
cd backend
node test-vehicle-simulator.js
```

This emits GPS coordinates every 2 seconds via Socket.IO, simulating a vehicle moving along a predefined route.

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| `MONGODB_URI` connection error | Check your Atlas credentials, IP whitelist, and that the cluster is running |
| Map not loading | Verify `REACT_APP_MAPBOX_TOKEN` is set correctly in `frontend/.env` |
| Scheduled routes not showing | Run `node fix_routes.js` in `backend/` to backfill route data |
| "Not authorized" on admin actions | Ensure you ran `make_admin.js` AND logged out/back in |
| App crashes: `JWT_SECRET not set` | Add `JWT_SECRET=<random-string>` to `backend/.env` — this is required |
| Geocoding/directions not working | Check that `MAPBOX_ACCESS_TOKEN` is set in `backend/.env` (proxied through backend) |
| Socket events not working | Check that backend is running on port 5000 and `REACT_APP_API_URL` matches |
| `Cannot find module` errors | Run `npm install` in both `backend/` and `frontend/` |
| 429 Too Many Requests | Mapbox proxy is rate-limited to 100 req/min/IP — wait and retry |
| Chat not loading | Ensure you're logged in (chat requires authentication) |
| Admin Panel shows empty tables | Click each tab to trigger data fetch — data loads on tab activation |

---

## 📚 Documentation

This project includes comprehensive documentation:

| File | Description |
|------|-------------|
| **[README.md](README.md)** | This file — setup, usage, and quick reference |
| **[CODE_LOGIC.md](CODE_LOGIC.md)** | Line-by-line code explanation of every file with design thinking |
| **[PROJECT_DETAILS.md](PROJECT_DETAILS.md)** | Exhaustive feature catalog, data flows, architecture, and system design |

---

## 📄 License

This project is for academic purposes (BTech project submission).

---

**Built with ❤️ for the Happiness Campaign**