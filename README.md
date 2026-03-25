# 🎉 Happiness Campaign — Real-Time Ride Tracking System

A full-stack MERN application for tracking "Happiness Rides" in real-time. Users can view live ride routes on an interactive map, join moving vehicles within proximity, rate rides, and discover nearby rides. Admins can schedule, manage, and delete rides.

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

---

## 🛠 Tech Stack

| Layer      | Technology                |
|------------|---------------------------|
| Frontend   | React.js, Mapbox GL JS    |
| Backend    | Node.js, Express.js       |
| Database   | MongoDB Atlas (Cloud)     |
| Real-time  | Socket.IO                 |
| Auth       | JWT, bcrypt               |
| Maps/Routing | Mapbox Directions API   |

---

## 📁 Project Structure

```
random1/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, GetMe
│   │   └── rideController.js      # CRUD for rides + join + rate
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT protect + adminOnly guard
│   ├── models/
│   │   ├── Ride.js                # Ride schema (location, route, ratings)
│   │   └── userModel.js           # User schema (name, email, password, role)
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/*
│   │   ├── rideRoutes.js          # /api/rides/*
│   │   └── mapboxRoutes.js        # /api/mapbox/* (proxy with rate limiting)
│   ├── services/
│   │   ├── mapboxService.js       # Mapbox API integration + caching
│   │   └── rideService.js         # Business logic for rides
│   ├── sockets/
│   │   └── rideSocket.js          # Socket.IO event handlers
│   ├── utils/
│   │   └── distance.js            # Haversine & polyline distance math
│   ├── make_admin.js              # Script to promote user to admin
│   ├── fix_routes.js              # Script to backfill scheduled routes
│   ├── test-vehicle-simulator.js  # Simulate a moving vehicle
│   ├── server.js                  # Express + Socket.IO entry point
│   ├── .env                       # Environment variables (DO NOT COMMIT)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapView.js         # Interactive Mapbox map
│   │   │   ├── RideInfo.js        # Ride details, join, rate, admin delete
│   │   │   ├── NearbyRides.jsx    # Nearby rides discovery
│   │   │   ├── ScheduleRideForm.jsx # Admin ride scheduling form
│   │   │   └── LocationInput.jsx  # Mapbox place search autocomplete
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Login page
│   │   │   └── Register.jsx       # Registration page
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state (JWT + role)
│   │   ├── services/
│   │   │   ├── apiService.js      # Axios API calls
│   │   │   └── socketService.js   # Socket.IO client
│   │   ├── utils/
│   │   │   └── geolocation.js     # Browser geolocation helpers
│   │   ├── App.js                 # Main app component
│   │   └── App.css                # Global styles (dark glassmorphism)
│   ├── .env                       # Frontend env (DO NOT COMMIT)
│   └── package.json
└── README.md
```

---

## ✅ Prerequisites

Before you begin, make sure you have:

- **Node.js** v16 or later → [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** → [Download](https://git-scm.com/)
- **MongoDB Atlas account** (free) → [Sign up](https://www.mongodb.com/atlas)
- **Mapbox account** (free) → [Sign up](https://account.mapbox.com/auth/signup/)
- **modern browser** (Chrome, Firefox, Edge)

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

The system uses role-based access control. By default, all new registrations create a **regular user**. To create an admin:

### Step 1: Register an Account

Open the app at `http://localhost:3000/register` and create an account:
- Name: `Admin User`
- Email: `admin@example.com`
- Password: `your_password`

### Step 2: Promote to Admin

Open a terminal in the `backend/` folder and run:

```bash
node make_admin.js admin@example.com
```

Expected output:
```
✅ Connected to MongoDB Atlas
🎉 Success! "Admin User" (admin@example.com) is now an ADMIN.
```

### Step 3: Re-Login

**Important:** You must log out and log back in after promotion. This ensures the JWT token is refreshed with the new `admin` role.

### Step 4: Verify Admin Access

After logging in, you should see:
- ✅ **"📅 Schedule a New Ride"** button appears
- ✅ **🗑️ Delete buttons** appear on all rides (active, nearby, and scheduled)
- ❌ "⭐ Rate This Ride" button is hidden (admins manage, not rate)

---

## 🔐 User Roles & Permissions

| Feature                      | Admin | Regular User |
|------------------------------|-------|-------------|
| Register & Login             | ✅    | ✅          |
| View rides on interactive map | ✅   | ✅          |
| View ride routes on map      | ✅    | ✅          |
| Discover nearby rides        | ✅    | ✅          |
| Join rides (within 5km range) | ✅   | ✅          |
| Rate rides (⭐ 1–5 stars)    | ❌    | ✅          |
| Schedule new rides           | ✅    | ❌          |
| Delete any ride              | ✅    | ❌          |

---

## 🔒 Security & API Protection

| Protection | Details |
|---|---|
| **Mapbox Token Proxy** | All Mapbox Geocoding & Directions API calls go through the backend (`/api/mapbox/*`). The token is never exposed to the browser for these calls. |
| **Rate Limiting** | Backend Mapbox proxy endpoints are rate-limited to 100 requests/min per IP. |
| **Response Caching** | Geocoding and Directions results are cached for 10 minutes (max 500 entries) to reduce API usage and stay within Mapbox free tier. |
| **JWT Security** | No fallback secrets — `JWT_SECRET` environment variable is required or the app will crash. |
| **Credential Logging** | MongoDB connection strings are never printed to console logs. |
| **URL Restrictions** | Set allowed URLs on your Mapbox dashboard to restrict the client-side map tile token. |
| **Environment Variables** | All secrets stored in `.env` files, excluded from git via `.gitignore`. |

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
| GET    | `/api/rides/nearby`       | Public       | Find rides within 10km          |
| GET    | `/api/rides/:id`          | Public       | Get ride by ID                  |
| POST   | `/api/rides/schedule`     | Admin only   | Schedule a new ride             |
| POST   | `/api/rides/:rideId/join` | Authenticated | Join ride (5km proximity check) |
| POST   | `/api/rides/:id/rate`     | Authenticated | Rate a ride (1–5 stars)         |
| DELETE | `/api/rides/:id`          | Admin only   | Delete a ride                   |
| PUT    | `/api/rides/:rideId/location` | Public   | Update vehicle location         |
| PUT    | `/api/rides/:id/complete` | Public       | Mark ride as completed          |

### Mapbox Proxy (Rate Limited: 100/min/IP)

| Method | Endpoint                  | Access | Description                     |
|--------|---------------------------|--------|---------------------------------|
| GET    | `/api/mapbox/geocode?q=<query>` | Public | Search places (cached 10 min)  |
| GET    | `/api/mapbox/directions?start=lng,lat&end=lng,lat&profile=cycling` | Public | Get route directions (cached 10 min) |

### Query Parameters for Nearby Rides

```
GET /api/rides/nearby?lat=28.6139&lng=77.2090&radius=10
```

---

## ✨ Features

### 🗺️ Interactive Real-Time Map
- Mapbox GL JS powered map with live vehicle tracking
- Route lines drawn in real-time (red for active, blue dashed for scheduled)
- Scheduled ride markers (🕒) with popup info
- Auto-fit map bounds to show all rides

### 🔐 JWT Authentication
- Secure registration and login
- Password hashing with bcrypt (10 salt rounds)
- JWT tokens valid for 30 days
- Protected API endpoints

### 📅 Ride Scheduling (Admin)
- Search for places using Mapbox Geocoding API (Google Maps-like search)
- Pre-calculates optimal route at creation time
- Real-time broadcast to all connected clients via Socket.IO

### 🌍 Nearby Rides Discovery
- MongoDB `$nearSphere` geospatial query with `2dsphere` index
- Automatic browser geolocation (HTML5 Geolocation API)
- 10km search radius

### 🚗 Smart Join (Proximity Validation)
- Must be within **5km of the vehicle**
- Must be within **10km of the route polyline**
- Route automatically recalculates through the user's pickup point
- All connected clients see the updated route instantly

### ⭐ Ride Ratings
- Users can rate rides 1–5 stars with optional comments
- Average rating displayed on ride info
- One rating per user per ride (updates on re-rate)

### 🗑️ Admin Ride Management
- Delete any ride from three locations in the UI
- Confirmation dialog before deletion
- Auto-refresh of all ride lists after deletion

### 🌗 Dark Glassmorphism UI
- Premium dark theme with frosted glass card effects
- Inter font from Google Fonts
- Gradient accents (orange → pink → purple)
- Smooth micro-animations and hover effects

---

## 🏛 Architecture

```
┌──────────────────┐       Socket.IO        ┌──────────────────┐
│                  │◄──────────────────────►│                  │
│   React.js       │                        │   Express.js     │
│   Frontend       │──── REST API ──────────│   Backend        │
│                  │   (Axios + JWT)        │                  │
│   • MapView      │                        │   • Auth Routes  │
│   • RideInfo     │                        │   • Ride Routes  │
│   • ScheduleForm │                        │   • Mapbox Proxy │
│   • NearbyRides  │                        │   • Socket.IO    │
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
                                    │ • 2dsphere │ │  Rate Limited│
                                    └────────────┘ └──────────────┘
```

---

## 🧪 Testing with Vehicle Simulator

To simulate a moving vehicle for demo purposes:

```bash
cd backend
node test-vehicle-simulator.js
```

This creates an active ride and simulates GPS movement along a route.

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| `MONGODB_URI` connection error | Check your Atlas credentials, IP whitelist, and that the cluster is running |
| Map not loading | Verify `REACT_APP_MAPBOX_TOKEN` is set correctly in `frontend/.env` |
| Scheduled routes not showing | Run `node fix_routes.js` in `backend/` to backfill route data |
| "Not authorized" on schedule/delete | Ensure you ran `make_admin.js` AND logged out/back in |
| App crashes: `JWT_SECRET not set` | Add `JWT_SECRET=<random-string>` to `backend/.env` — this is now required |
| Geocoding/directions not working | Check that `MAPBOX_ACCESS_TOKEN` is set in `backend/.env` (these now go through the backend proxy) |
| Socket events not working | Check that backend is running on port 5000 and `REACT_APP_API_URL` matches |
| `Cannot find module` errors | Run `npm install` in both `backend/` and `frontend/` |
| 429 Too Many Requests | Mapbox proxy is rate-limited to 100 req/min/IP — wait and retry |

---

## 📄 License

This project is for academic purposes (BTech project submission).

---

**Built with ❤️ for the Happiness Campaign**