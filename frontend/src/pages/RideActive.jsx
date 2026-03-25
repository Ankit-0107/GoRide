// src/pages/RideActive.jsx
import React, { useState, useEffect, useRef } from "react";
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
    "line-opacity": 0.8,
  },
};

/* Calculate route distance in km from GeoJSON coordinates */
function calcRouteDistance(coords) {
  if (!coords || coords.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    const [lon1, lat1] = coords[i - 1];
    const [lon2, lat2] = coords[i];
    const R = 6371;
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

export default function RideActive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [ride, setRide] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: LNG,
    latitude: LAT,
    zoom: 12,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch ride data
  useEffect(() => {
    if (!id) return;
    api.get(`/rides/${id}`)
      .then((res) => {
        const data = res.data.ride || res.data;
        setRide(data);

        if (data.route && data.route.geometry && Array.isArray(data.route.geometry.coordinates)) {
          let coords = data.route.geometry.coordinates;
          // Flatten if MultiLineString (array of arrays of coords)
          if (coords.length > 0 && Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
            coords = coords.flat();
          }
          
          const validCoords = coords.filter((c) => Array.isArray(c) && c.length >= 2 && !isNaN(c[0]) && !isNaN(c[1]));

          if (validCoords.length > 0) {
            const lngs = validCoords.map((c) => c[0]);
            const lats = validCoords.map((c) => c[1]);
            // Shift the view upward by padding more at the bottom
            const bounds = [
              [Math.min(...lngs) - 0.01, Math.min(...lats) - 0.01],
              [Math.max(...lngs) + 0.01, Math.max(...lats) + 0.01],
            ];
            setTimeout(() => {
              if (mapRef.current) {
                mapRef.current.fitBounds(bounds, {
                  padding: { top: 120, bottom: 350, left: 40, right: 40 },
                  duration: 800,
                });
              }
            }, 300);
          } else if (isValidCoord(data.location?.coordinates)) {
            setViewState((v) => ({
              ...v,
              longitude: data.location.coordinates[0],
              latitude: data.location.coordinates[1],
              zoom: 13,
            }));
          }
        } else if (isValidCoord(data.location?.coordinates)) {
          setViewState((v) => ({
            ...v,
            longitude: data.location.coordinates[0],
            latitude: data.location.coordinates[1],
            zoom: 13,
          }));
        }
      })
      .catch((err) => console.error("Error fetching ride:", err));
  }, [id]);

  const handleEndRide = () => {
    if (id) {
      api.put(`/rides/${id}/complete`)
        .then(() => navigate("/campaign"))
        .catch(() => navigate("/campaign"));
    } else {
      navigate("/campaign");
    }
  };

  const handleDeleteRide = () => {
    if (id) {
      api.delete(`/rides/${id}`)
        .then(() => navigate("/campaign"))
        .catch((err) => {
          console.error("Error deleting ride:", err);
          navigate("/campaign");
        });
    }
  };

  const startCoords = isValidCoord(ride?.location?.coordinates) ? ride.location.coordinates : null;
  const endCoords = isValidCoord(ride?.destination?.coordinates) ? ride.destination.coordinates : null;
  const routeCoords = ride?.route?.geometry?.coordinates;
  const distance = routeCoords ? calcRouteDistance(routeCoords).toFixed(1) : "0.0";
  const participantsCount = ride?.waypoints?.length || 0;

  // Travel time: distance / speed * 60 minutes
  const speed = ride?.speed || 15;
  const travelTimeMin = routeCoords
    ? Math.round((calcRouteDistance(routeCoords) / speed) * 60)
    : 0;

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30 min-h-screen relative">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-6">
          <div className="bg-[#1a1919] rounded-[28px] p-8 max-w-sm w-full border border-[#484847]/30 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-400 text-3xl">warning</span>
            </div>
            <div>
              <h3 className="font-headline font-extrabold text-xl text-white mb-2">Terminate Campaign?</h3>
              <p className="text-[#adaaaa] text-sm leading-relaxed">
                This action will permanently delete this campaign and all associated data. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                className="flex-1 py-4 rounded-full bg-[#2c2c2c] text-white font-headline font-bold hover:bg-[#3d3d3d] transition-colors active:scale-95"
                onClick={() => setShowDeleteModal(false)}
              >
                No
              </button>
              <button
                className="flex-1 py-4 rounded-full bg-red-500 text-white font-headline font-bold hover:bg-red-600 transition-colors active:scale-95"
                onClick={handleDeleteRide}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-md">
        <div className="flex justify-between items-center px-6 py-4 w-full">
          <div className="flex items-center gap-4">
            <button
              className="text-[#ff8f75] hover:bg-[#2c2c2c]/50 transition-colors active:scale-95 duration-200 p-2 rounded-full"
              onClick={() => navigate(-1)}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-lg font-extrabold text-neutral-100 font-['Plus_Jakarta_Sans'] tracking-tight">
              Ride Active
            </h1>
          </div>
          <button className="text-neutral-500 hover:bg-[#2c2c2c]/50 transition-colors active:scale-95 duration-200 p-2 rounded-full">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      {/* Main Canvas: Live Map Background */}
      <main className="relative h-screen w-full overflow-hidden">
        {/* Full-screen Map */}
        <div className="absolute inset-0 z-0">
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
            {ride?.route && (
              <Source id="route" type="geojson" data={ride.route}>
                <Layer {...routeLayerStyle} />
              </Source>
            )}
          </Map>
          {/* Vignette Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(circle, transparent 20%, rgba(14, 14, 14, 0.8) 100%)" }}
          ></div>
        </div>

        {/* Group Status Floating Indicator */}
        <div className="absolute top-24 left-6 z-10 flex flex-col gap-3">
          <div className="bg-[#2c2c2c]/60 backdrop-blur-xl rounded-full px-4 py-2 flex items-center gap-3 border border-[#484847]/20">
            <div className="flex -space-x-3">
              <img className="w-8 h-8 rounded-full border-2 border-[#0e0e0e] object-cover" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop" alt="P1" />
              <img className="w-8 h-8 rounded-full border-2 border-[#0e0e0e] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" alt="P2" />
              <div className="w-8 h-8 rounded-full border-2 border-[#0e0e0e] bg-[#ff7859] flex items-center justify-center text-[10px] font-bold text-black">
                +{Math.max(0, participantsCount)}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#adaaaa] font-medium uppercase tracking-widest">Group</span>
              <span className="text-xs font-bold text-[#ff8f75]">In Range</span>
            </div>
          </div>
        </div>

        {/* Real-time Stats Overlay */}
        <div className="absolute bottom-32 inset-x-0 px-6 z-10 space-y-4">
          {/* Grid Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#201f1f]/60 backdrop-blur-xl rounded-lg p-4 flex flex-col items-center justify-center border border-white/5">
              <span className="text-[10px] text-[#adaaaa] font-bold uppercase tracking-widest mb-1">Distance</span>
              <span className="text-lg font-headline font-extrabold">{distance}<span className="text-xs text-[#ff7859] ml-1">km</span></span>
            </div>
            <div className="bg-[#201f1f]/60 backdrop-blur-xl rounded-lg p-4 flex flex-col items-center justify-center border border-white/5">
              <span className="text-[10px] text-[#adaaaa] font-bold uppercase tracking-widest mb-1">Travel Time</span>
              <span className="text-lg font-headline font-extrabold">{travelTimeMin}<span className="text-xs text-[#ff7859] ml-1">min</span></span>
            </div>
            <div className="bg-[#201f1f]/60 backdrop-blur-xl rounded-lg p-4 flex flex-col items-center justify-center border border-white/5">
              <span className="text-[10px] text-[#adaaaa] font-bold uppercase tracking-widest mb-1">Participants</span>
              <span className="text-lg font-headline font-extrabold">{participantsCount}</span>
            </div>
          </div>

          {/* Ride Controls */}
          <div className="flex gap-4 pt-2">
            <button
              className="flex-1 h-16 bg-[#2c2c2c]/80 backdrop-blur-md rounded-full flex items-center justify-center gap-3 border border-[#484847]/30 active:scale-95 duration-200 group"
              onClick={() => setIsPaused(!isPaused)}
            >
              <span className="material-symbols-outlined text-white group-hover:text-[#ff8f75] transition-colors" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPaused ? "play_circle" : "pause_circle"}
              </span>
              <span className="font-headline font-bold text-white">{isPaused ? "Resume" : "Pause Ride"}</span>
            </button>
            <button
              className="flex-1 h-16 bg-gradient-to-r from-[#ff8f75] to-[#ff7859] rounded-full flex items-center justify-center gap-3 shadow-[0px_24px_48px_rgba(255,143,117,0.15)] active:scale-95 duration-200"
              onClick={handleEndRide}
            >
              <span className="material-symbols-outlined text-black" style={{ fontVariationSettings: "'FILL' 1" }}>stop_circle</span>
              <span className="font-headline font-bold text-black">End Ride</span>
            </button>
          </div>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[90%] max-w-md rounded-[3rem] z-50 bg-[#2c2c2c]/60 backdrop-blur-xl shadow-[0px_24px_48px_rgba(255,143,117,0.08)]">
        <div className="flex justify-around items-center px-4 py-2">
          <button className="flex items-center justify-center text-neutral-400 p-4 hover:text-white transition-all active:scale-90 duration-200">
            <span className="material-symbols-outlined">chat_bubble</span>
          </button>
          {/* Delete / Terminate Campaign Button */}
          <button
            className="flex items-center justify-center bg-gradient-to-br from-red-500 to-red-700 text-white rounded-full p-4 scale-110 active:scale-90 duration-200 shadow-[0px_8px_24px_rgba(239,68,68,0.3)]"
            onClick={() => setShowDeleteModal(true)}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
          </button>
          <button className="flex items-center justify-center text-neutral-400 p-4 hover:text-white transition-all active:scale-90 duration-200">
            <span className="material-symbols-outlined">insert_chart</span>
          </button>
        </div>
      </nav>

      {/* Bottom glow */}
      <div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-40"></div>
    </div>
  );
}
