import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Map, { Source, Layer, Marker } from "react-map-gl";
import api from "../api/api";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const LAT = parseFloat(process.env.REACT_APP_DEFAULT_LAT) || 28.6139;
const LNG = parseFloat(process.env.REACT_APP_DEFAULT_LNG) || 77.2090;

const routeLayerStyle = {
  id: "route-line",
  type: "line",
  paint: {
    "line-color": "#ff8f75",
    "line-width": 4,
    "line-opacity": 0.85,
  },
};

/* Determine time-of-day label from the scheduled start time */
function getTimeOfDayLabel(dateStr) {
  if (!dateStr) return "Ride";
  const hour = new Date(dateStr).getHours();
  if (hour >= 5 && hour < 12) return "Morning Series";
  if (hour >= 12 && hour < 17) return "Afternoon Series";
  if (hour >= 17 && hour < 21) return "Evening Series";
  return "Night Series";
}

/* Calculate route distance in km from GeoJSON coordinates */
function calcRouteDistance(coords) {
  if (!coords || coords.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    const [lon1, lat1] = coords[i - 1];
    const [lon2, lat2] = coords[i];
    const R = 6371; // earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  return total;
}

/* Check if a coordinate pair is a valid [lng, lat] array */
function isValidCoord(coord) {
  return Array.isArray(coord) && coord.length >= 2 && !isNaN(coord[0]) && !isNaN(coord[1]) && coord[0] !== null && coord[1] !== null;
}

export default function RideDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showJoinErrorPopup, setShowJoinErrorPopup] = useState(false);
  const [viewState, setViewState] = useState({
    longitude: LNG,
    latitude: LAT,
    zoom: 11,
  });

  useEffect(() => {
    api.get(`/rides/${id}`)
      .then((res) => {
        const data = res.data.ride || res.data;
        setRide(data);

        if (data.route && data.route.geometry && Array.isArray(data.route.geometry.coordinates)) {
          let coords = data.route.geometry.coordinates;
          // Flatten if MultiLineString
          if (coords.length > 0 && Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
            coords = coords.flat();
          }

          const validCoords = coords.filter((c) => Array.isArray(c) && c.length >= 2 && !isNaN(c[0]) && !isNaN(c[1]));

          if (validCoords.length > 0) {
            const lngs = validCoords.map((c) => c[0]);
            const lats = validCoords.map((c) => c[1]);
            const bounds = [
              [Math.min(...lngs) - 0.01, Math.min(...lats) - 0.01],
              [Math.max(...lngs) + 0.01, Math.max(...lats) + 0.01],
            ];
            setTimeout(() => {
              if (mapRef.current) {
                mapRef.current.fitBounds(bounds, { padding: 40, duration: 800 });
              }
            }, 300);
          } else if (isValidCoord(data.location?.coordinates)) {
            setViewState((v) => ({
              ...v,
              longitude: data.location.coordinates[0],
              latitude: data.location.coordinates[1],
              zoom: 12,
            }));
          }
        } else if (isValidCoord(data.location?.coordinates)) {
          setViewState((v) => ({
            ...v,
            longitude: data.location.coordinates[0],
            latitude: data.location.coordinates[1],
            zoom: 12,
          }));
        }
      })
      .catch((err) => {
        setError("Failed to fetch ride details");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleJoin = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        api.post(`/rides/${id}/join`, {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        })
          .then(() => navigate(`/ride-active/${id}`))
          .catch((err) => {
            if (err.response?.status === 400 || err.response?.data?.message?.includes("away")) {
              setShowJoinErrorPopup(true);
            } else {
              setError(err.response?.data?.message || "Failed to join ride.");
            }
          });
      },
      () => {
        api.post(`/rides/${id}/join`, { latitude: LAT, longitude: LNG })
          .then(() => navigate(`/ride-active/${id}`))
          .catch((err) => {
            if (err.response?.status === 400 || err.response?.data?.message?.includes("away")) {
              setShowJoinErrorPopup(true);
            } else {
              setError(err.response?.data?.message || "Failed to join ride.");
            }
          });
      }
    );
  };

  if (loading) {
    return (
      <div className="bg-[#131313] text-white min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#ff8f75] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="bg-[#131313] text-white min-h-screen flex flex-col items-center justify-center space-y-4 px-6">
        <span className="material-symbols-outlined text-4xl text-[#adaaaa]">location_off</span>
        <h2 className="font-headline font-bold text-xl">Ride not found</h2>
        <button onClick={() => navigate("/home")} className="text-[#ff8f75] hover:underline">
          Return Home
        </button>
      </div>
    );
  }

  const startCoords = isValidCoord(ride.location?.coordinates) ? ride.location.coordinates : null;
  const endCoords = isValidCoord(ride.destination?.coordinates) ? ride.destination.coordinates : null;
  const participantsCount = ride.waypoints?.length || 0;

  // Dynamic distance from route geometry
  const routeCoords = ride.route?.geometry?.coordinates;
  const distance = routeCoords ? calcRouteDistance(routeCoords).toFixed(1) : "—";

  // Dynamic duration: distance / speed * 60 minutes
  const speed = ride.speed || 15; // default cycling speed km/h
  const durationMin = routeCoords
    ? Math.round((calcRouteDistance(routeCoords) / speed) * 60)
    : "—";

  // Dynamic difficulty
  const difficultyLabel = ride.difficulty
    ? ride.difficulty.charAt(0).toUpperCase() + ride.difficulty.slice(1)
    : "Not Set";

  // Dynamic time-of-day badge
  const timeOfDayLabel = getTimeOfDayLabel(ride.scheduledStartTime);

  // Leader name
  const leaderName = ride.createdByName || "Ride Leader";

  // Average rating
  const avgRating =
    ride.ratings && ride.ratings.length > 0
      ? (ride.ratings.reduce((s, r) => s + r.rating, 0) / ride.ratings.length).toFixed(1)
      : "4.8";

  return (
    <div className="bg-[#131313] text-white min-h-screen pb-24 max-w-xl mx-auto font-body selection:bg-[#ff8f75]/30">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-5 sticky top-0 bg-[#131313] z-50">
        <button onClick={() => navigate(-1)} className="active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-[#ff8f75] text-[22px]">arrow_back</span>
        </button>
        <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-[#ff8f75] text-base tracking-wide">
          Ride Details
        </h1>
        <button className="active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-[#ff8f75] text-[20px]">share</span>
        </button>
      </header>

      {/* 5KM JOIN REJECTION MODAL */}
      {showJoinErrorPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-6">
          <div className="bg-[#1a1919] rounded-[28px] p-8 max-w-sm w-full border border-[#484847]/30 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#ff8f75]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#ff8f75] text-3xl">location_disabled</span>
            </div>
            <div>
              <h3 className="font-headline font-extrabold text-xl text-white mb-2">Out of Range</h3>
              <p className="text-[#adaaaa] text-sm leading-relaxed">
                You must within 5km range of the route to join.
              </p>
            </div>
            <button
              className="w-full py-4 rounded-full bg-[#2c2c2c] text-white font-headline font-bold hover:bg-[#3d3d3d] transition-colors active:scale-95"
              onClick={() => setShowJoinErrorPopup(false)}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      <main className="px-6 space-y-6 pt-2">
        {/* Error Banner */}
        {error && (
          <div className="bg-[#a70138]/20 px-4 py-3 rounded-2xl border border-[#a70138]/20 text-[#ffb2b9] text-sm font-bold text-center">
            {error}
          </div>
        )}

        {/* TITLE GROUP */}
        <div>
          <span className="inline-block px-3 py-1 bg-[#ff8f75]/10 text-[#ff8f75] text-[10px] font-black tracking-widest uppercase rounded-full mb-3">
            {timeOfDayLabel}
          </span>
          <h1 className="font-headline font-extrabold text-[32px] tracking-tight leading-none mb-4">
            {ride.title || ride.rideName}
          </h1>
        </div>

        {/* MAP PREVIEW — INTERACTIVE */}
        <div className="w-full h-[220px] bg-[#1a1919] rounded-[24px] overflow-hidden relative shadow-lg">
          <Map
            ref={mapRef}
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            {startCoords && (
              <Marker longitude={startCoords[0]} latitude={startCoords[1]} color="#ff8f75" />
            )}
            {endCoords && (
              <Marker longitude={endCoords[0]} latitude={endCoords[1]} color="#ffffff" />
            )}
            {ride.route && (
              <Source id="route" type="geojson" data={ride.route}>
                <Layer {...routeLayerStyle} />
              </Source>
            )}
          </Map>
          {/* Zoom Controls */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-10">
            <button
              className="w-9 h-9 bg-[#1a1919]/80 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-[#252424] active:scale-95 transition-all border border-[#484847]/20"
              onClick={() => setViewState((v) => ({ ...v, zoom: Math.min(20, v.zoom + 1) }))}
            >
              <span className="material-symbols-outlined text-sm">add</span>
            </button>
            <button
              className="w-9 h-9 bg-[#1a1919]/80 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-[#252424] active:scale-95 transition-all border border-[#484847]/20"
              onClick={() => setViewState((v) => ({ ...v, zoom: Math.max(1, v.zoom - 1) }))}
            >
              <span className="material-symbols-outlined text-sm">remove</span>
            </button>
          </div>
        </div>

        {/* RIDE LEADER CARD */}
        <div className="bg-[#1a1919] rounded-full p-2.5 pr-5 flex items-center justify-between border border-[#484847]/20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                className="w-11 h-11 rounded-full object-cover border border-[#2c2c2c]"
                src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop"
                alt="Leader"
              />
              <div className="absolute -bottom-0 -right-0.5 bg-[#ff8f75] text-black rounded-full w-[14px] h-[14px] flex items-center justify-center border-2 border-[#1a1919]">
                <span className="material-symbols-outlined text-[8px] font-bold">check</span>
              </div>
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-[#adaaaa] tracking-widest mb-0.5 leading-none">
                Created By
              </p>
              <h4 className="font-bold text-sm leading-none pt-0.5 pb-0.5">{leaderName}</h4>
              <div className="flex items-center gap-1 text-[11px] text-[#adaaaa] mt-0.5 leading-none">
                <span className="text-[#ff8f75] text-[10px] leading-none mb-[1px]">★</span> {avgRating}
              </div>
            </div>
          </div>
          <button className="bg-[#2c2c2c] text-[#ff8f75] px-4 py-[6px] rounded-full text-xs font-bold hover:bg-[#3d3d3d] transition-colors">
            Profile
          </button>
        </div>

        {/* PARTICIPANTS */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex -space-x-2.5">
            <img className="w-8 h-8 rounded-full border border-[#131313] object-cover" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop" alt="P1" />
            <img className="w-8 h-8 rounded-full border border-[#131313] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" alt="P2" />
            <div className="w-8 h-8 rounded-full border border-[#131313] bg-[#ff8f75] flex items-center justify-center text-black text-[10px] font-bold z-10 relative">
              +{Math.max(0, participantsCount)}
            </div>
          </div>
          <p className="text-xs font-medium">
            <span className="font-bold text-white">{participantsCount} participants</span>{" "}
            <span className="text-[#adaaaa]">joined</span>
          </p>
        </div>

        {/* STATS GRID — 3 items: Distance, Duration, Difficulty */}
        <div className="grid grid-cols-2 gap-4">
          {/* Distance */}
          <div className="bg-[#1a1919] p-5 rounded-[24px] border border-[#ff8f75]/[0.15] relative overflow-hidden">
            <div className="absolute left-0 top-6 bottom-6 w-[2px] bg-[#ff8f75]/80 rounded-r-md"></div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#ff8f75] text-[16px]">straighten</span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#adaaaa]">Distance</span>
            </div>
            <p className="font-headline font-bold text-2xl text-white ml-1">
              {distance} <span className="text-xs font-medium text-[#adaaaa]">km</span>
            </p>
          </div>
          {/* Duration */}
          <div className="bg-[#1a1919] p-5 rounded-[24px] border border-[#ff8f75]/[0.15] relative overflow-hidden">
            <div className="absolute left-0 top-6 bottom-6 w-[2px] bg-[#ff8f75]/80 rounded-r-md"></div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#ff8f75] text-[16px]">schedule</span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#adaaaa]">Duration</span>
            </div>
            <p className="font-headline font-bold text-2xl text-white ml-1">
              {durationMin} <span className="text-xs font-medium text-[#adaaaa]">min</span>
            </p>
          </div>
          {/* Difficulty — spans full width */}
          <div className="col-span-2 bg-[#1a1919] p-5 rounded-[24px] border border-[#484847]/30 relative overflow-hidden">
            <div className="absolute left-0 top-6 bottom-6 w-[2px] bg-[#ff8f75]/30 rounded-r-md"></div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#ff8f75] text-[16px]">speed</span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#adaaaa]">Difficulty</span>
            </div>
            <p className="font-headline font-bold text-[22px] text-white ml-1 tracking-tight">
              {difficultyLabel}
            </p>
          </div>
        </div>

        {/* JOIN BUTTON */}
        <div className="pt-2 pb-4">
          <button
            onClick={handleJoin}
            disabled={
              ride.waypoints?.length >= ride.maxPassengers || ride.status === "completed"
            }
            className="w-full bg-[#ff8f75] text-black py-4 rounded-full font-headline font-black text-[17px] tracking-tight hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale shadow-[0px_8px_16px_rgba(255,143,117,0.15)]"
          >
            {ride.status === "completed"
              ? "Ride Completed"
              : ride.waypoints?.length >= ride.maxPassengers
              ? "Ride Full"
              : "Join Campaign"}
          </button>
        </div>

        {/* ABOUT THE RIDE */}
        <div>
          <h3 className="font-headline font-bold text-xl mb-3 tracking-tight">About the Ride</h3>
          <p className="text-[#adaaaa] text-[15px] leading-relaxed font-medium">
            {ride.description || "No description provided for this ride."}
          </p>
        </div>

        {/* PARTNER OFFER */}
        <div className="mt-8 mb-4">
          <div className="bg-gradient-to-br from-[#ff9b85] to-[#ff7859] rounded-[28px] p-6 text-black relative overflow-hidden">
            <span className="inline-block px-2.5 py-1 bg-black/10 rounded-full text-[9px] font-black tracking-widest uppercase mb-3 text-black/70">
              Partner Offer
            </span>
            <h3 className="font-headline font-black text-[22px] mb-1.5 tracking-tight leading-none">
              Daily Grind Cafe
            </h3>
            <p className="text-sm font-semibold text-black/80 leading-snug w-[80%]">
              Free Espresso for all participants after the ride.
            </p>
            <div className="absolute right-5 bottom-6 w-11 h-11 bg-black/10 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-black">local_cafe</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}