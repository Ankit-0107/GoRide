// src/pages/CreateCampaign.jsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Map, { Source, Layer, Marker } from "react-map-gl";
import api from "../api/api";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const LAT = parseFloat(process.env.REACT_APP_DEFAULT_LAT) || 28.6139;
const LNG = parseFloat(process.env.REACT_APP_DEFAULT_LNG) || 77.2090;
const ZOOM = parseFloat(process.env.REACT_APP_DEFAULT_ZOOM) || 12;

/* ─── Geocoder component ─── */
function LocationInput({ icon, label, placeholder, value, onChange, onSelect, iconClass }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  const search = useCallback((q) => {
    clearTimeout(timerRef.current);
    onChange(q);
    if (q.length < 3) { setSuggestions([]); return; }
    
    timerRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/mapbox/geocode?q=${encodeURIComponent(q)}`);
        const features = res.data.features || [];
        setSuggestions(features);
        setOpen(true);
        
        if (features.length > 0) {
          onSelect(features[0].place_name, features[0].center, false);
        }
      } catch (err) {
        setSuggestions([]);
        console.error("Geocoding error:", err);
      }
    }, 400);
  }, [onChange, onSelect]);

  return (
    <div className="relative">
      <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl">
        <span className={`material-symbols-outlined ${iconClass}`}>{icon}</span>
        <div className="flex-1">
          <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">{label}</p>
          <input
            className="bg-transparent border-none outline-none focus:ring-0 text-on-surface placeholder:text-outline w-full p-0 font-body text-sm font-medium"
            placeholder={placeholder}
            type="text"
            value={value}
            onChange={(e) => search(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            autoComplete="off"
          />
        </div>
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-[#1a1919] border border-[#484847]/30 rounded-xl overflow-hidden shadow-2xl max-h-48 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.id}
              className="w-full text-left px-5 py-3 hover:bg-[#252424] transition-colors text-sm text-on-surface truncate"
              onMouseDown={() => {
                onSelect(s.place_name, s.center, true);
                setSuggestions([]);
                setOpen(false);
              }}
            >
              {s.place_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Route line layer style ─── */
const routeLayerStyle = {
  id: "route-line",
  type: "line",
  paint: {
    "line-color": "#ff8f75",
    "line-width": 4,
    "line-opacity": 0.85,
  },
};

export default function CreateCampaign() {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  // ── Form State ──
  const [rideName, setRideName] = useState("");
  const [description, setDescription] = useState("");

  // Route
  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");
  const [startCoords, setStartCoords] = useState(null); // [lng, lat]
  const [endCoords, setEndCoords] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);

  // Map
  const [viewState, setViewState] = useState({
    longitude: LNG,
    latitude: LAT,
    zoom: ZOOM,
  });

  // Schedule
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [repeatEnabled, setRepeatEnabled] = useState(true);
  const [repeatMode, setRepeatMode] = useState("daily");

  // Ride details
  const [difficulty, setDifficulty] = useState(null);
  const [maxParticipants, setMaxParticipants] = useState(12);

  // Partners
  const [selectedPartners, setSelectedPartners] = useState(new Set(["peak"]));

  // UX
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  // ── Fetch route when both coordinates are set ──
  useEffect(() => {
    if (!startCoords || !endCoords) { setRouteGeoJSON(null); return; }

    const fetchRoute = async () => {
      try {
        const res = await api.get(`/mapbox/directions?start=${startCoords[0]},${startCoords[1]}&end=${endCoords[0]},${endCoords[1]}&profile=cycling`);
        const data = res.data;
        if (data.success && data.route) {
          setRouteGeoJSON({
            type: "Feature",
            geometry: data.route.geometry,
          });
          // Fit map to route bounds
          const coords = data.route.geometry.coordinates;
          const lngs = coords.map((c) => c[0]);
          const lats = coords.map((c) => c[1]);
          const bounds = [
            [Math.min(...lngs) - 0.01, Math.min(...lats) - 0.01],
            [Math.max(...lngs) + 0.01, Math.max(...lats) + 0.01],
          ];
          mapRef.current?.fitBounds(bounds, { padding: 40, duration: 800 });
        }
      } catch (err) {
        console.error("Route fetch error:", err);
      }
    };
    fetchRoute();
  }, [startCoords, endCoords]);

  // ── Handlers ──
  const handleZoom = (delta) => {
    setViewState((v) => ({ ...v, zoom: Math.max(1, Math.min(20, v.zoom + delta)) }));
  };

  const togglePartner = (id) => {
    setSelectedPartners((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Fetch creator name on mount
  const [creatorName, setCreatorName] = useState("Ride Leader");
  useEffect(() => {
    const isGuest = localStorage.getItem("guestUser");
    if (!isGuest) {
      api.get("/auth/me")
        .then((res) => setCreatorName(res.data.name || res.data.user?.name || "Ride Leader"))
        .catch(() => {});
    }
  }, []);

  const handlePublish = async () => {
    if (!rideName) { setError("Please enter a ride name"); return; }
    if (!startCoords || !endCoords) { setError("Please select both start and end locations"); return; }

    setPublishing(true);
    setError("");

    const scheduledStartTime = date && time ? new Date(`${date}T${time}`) : null;

    const payload = {
      rideName,
      title: rideName,
      description,
      difficulty,
      createdByName: creatorName,
      location: { type: "Point", coordinates: startCoords },
      destination: { type: "Point", coordinates: endCoords },
      route: routeGeoJSON || null,
      scheduledStartTime,
      maxPassengers: maxParticipants,
      status: scheduledStartTime ? "scheduled" : "active",
    };

    try {
      const res = await api.post("/rides", payload);
      if (res.data && res.data.success) {
        navigate("/campaign");
      } else {
        setError(res.data?.message || "Failed to publish ride");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Server error");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container" style={{ minHeight: "max(884px, 100dvh)" }}>
      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-50 bg-[#131313] text-[#ff8f75] flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            className="active:scale-95 duration-200 hover:bg-[#1a1919] transition-colors p-2 rounded-full"
            onClick={() => navigate("/campaign")}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-lg tracking-tight">Create Campaigns</h1>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="pb-32 px-6 pt-4 space-y-10 max-w-md mx-auto">
        {/* Error Banner */}
        {error && (
          <div className="bg-[#a70138]/20 px-6 py-3 rounded-xl border border-[#a70138]/20">
            <p className="text-[#ffb2b9] text-sm font-bold text-center">{error}</p>
          </div>
        )}

        {/* 1. Ride Basic Info */}
        <section className="space-y-6">
          <div className="space-y-4">
            <div className="group">
              <label className="block font-headline font-bold text-sm mb-2 ml-1 text-on-surface-variant tracking-wide">
                Ride Name
              </label>
              <input
                className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-4 text-on-surface placeholder:text-outline focus:ring-0 focus:bg-surface-bright transition-all duration-300 font-body"
                placeholder="Morning Canyon Blast"
                type="text"
                value={rideName}
                onChange={(e) => setRideName(e.target.value)}
              />
            </div>
            <div className="group">
              <label className="block font-headline font-bold text-sm mb-2 ml-1 text-on-surface-variant tracking-wide">
                Description
              </label>
              <textarea
                className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-4 text-on-surface placeholder:text-outline focus:ring-0 focus:bg-surface-bright transition-all duration-300 font-body resize-none"
                placeholder="A high-intensity climb through the northern trails..."
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>
        </section>

        {/* 2. Route Selection */}
        <section className="space-y-4">
          <h2 className="font-headline font-extrabold text-2xl tracking-tight text-primary">The Route</h2>
          <div className="relative w-full h-[320px] rounded-[1.5rem] overflow-hidden bg-surface-container-low shadow-2xl">
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
                <Marker longitude={endCoords[0]} latitude={endCoords[1]} color="#e6a7ff" />
              )}
              {routeGeoJSON && (
                <Source id="route" type="geojson" data={routeGeoJSON}>
                  <Layer {...routeLayerStyle} />
                </Source>
              )}
            </Map>
            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
              <button
                className="w-10 h-10 bg-[#1a1919]/80 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-[#252424] active:scale-95 transition-all border border-[#484847]/20"
                onClick={() => handleZoom(1)}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
              <button
                className="w-10 h-10 bg-[#1a1919]/80 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-[#252424] active:scale-95 transition-all border border-[#484847]/20"
                onClick={() => handleZoom(-1)}
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <LocationInput
              icon="location_on"
              iconClass="text-primary-fixed-dim"
              label="Start Location"
              placeholder="Search start location..."
              value={startText}
              onChange={setStartText}
              onSelect={(name, coords, updateText = true) => {
                if (updateText) setStartText(name);
                setStartCoords(coords);
                setViewState((v) => ({ ...v, longitude: coords[0], latitude: coords[1], zoom: 13 }));
              }}
            />
            <LocationInput
              icon="flag"
              iconClass="text-secondary"
              label="End Location"
              placeholder="Search end location..."
              value={endText}
              onChange={setEndText}
              onSelect={(name, coords, updateText = true) => {
                if (updateText) setEndText(name);
                setEndCoords(coords);
              }}
            />
          </div>
        </section>

        {/* 3. Schedule */}
        <section className="space-y-6">
          <h2 className="font-headline font-extrabold text-2xl tracking-tight text-primary">Schedule</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-highest p-4 rounded-xl flex flex-col gap-1">
              <span className="material-symbols-outlined text-primary text-xl mb-2">calendar_today</span>
              <p className="text-[10px] uppercase font-bold text-on-surface-variant">Date</p>
              <input
                type="date"
                className="bg-transparent border-none outline-none focus:ring-0 text-on-surface font-headline font-bold p-0 w-full"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div className="bg-surface-container-highest p-4 rounded-xl flex flex-col gap-1">
              <span className="material-symbols-outlined text-primary text-xl mb-2">schedule</span>
              <p className="text-[10px] uppercase font-bold text-on-surface-variant">Time</p>
              <input
                type="time"
                className="bg-transparent border-none outline-none focus:ring-0 text-on-surface font-headline font-bold p-0 w-full"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{ colorScheme: "dark" }}
              />
            </div>
          </div>
          <div className="bg-surface-container p-6 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary">event_repeat</span>
                <span className="font-headline font-bold">Repeat Ride</span>
              </div>
              <button
                className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${repeatEnabled ? "bg-primary" : "bg-surface-container-highest"}`}
                onClick={() => setRepeatEnabled(!repeatEnabled)}
              >
                <div className={`absolute top-1 w-4 h-4 bg-on-primary rounded-full transition-all duration-300 ${repeatEnabled ? "right-1" : "left-1"}`}></div>
              </button>
            </div>
            {repeatEnabled && (
              <div className="flex gap-2">
                <button
                  className={`flex-1 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-colors ${repeatMode === "daily" ? "bg-primary-container text-on-primary-container" : "bg-surface-container-highest text-on-surface-variant"}`}
                  onClick={() => setRepeatMode("daily")}
                >
                  Daily
                </button>
                <button
                  className={`flex-1 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-colors ${repeatMode === "weekly" ? "bg-primary-container text-on-primary-container" : "bg-surface-container-highest text-on-surface-variant"}`}
                  onClick={() => setRepeatMode("weekly")}
                >
                  Weekly
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 4. Ride Details */}
        <section className="space-y-6">
          <h2 className="font-headline font-extrabold text-2xl tracking-tight text-primary">Ride Details</h2>
          <div className="space-y-3">
            <p className="font-headline font-bold text-sm ml-1 text-on-surface-variant">Difficulty</p>
            <div className="flex gap-3">
              {["easy", "medium", "hard"].map((level) => (
                <button
                  key={level}
                  className={`px-5 py-2 rounded-full font-bold text-xs cursor-pointer transition-colors ${difficulty === level ? "bg-primary-container text-on-primary-container" : "bg-surface-container-highest text-on-surface-variant"}`}
                  onClick={() => setDifficulty(difficulty === level ? null : level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="group">
            <label className="block font-headline font-bold text-sm mb-2 ml-1 text-on-surface-variant tracking-wide">
              Max Participants
            </label>
            <div className="relative">
              <input
                className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-4 text-on-surface focus:ring-0 focus:bg-surface-bright transition-all duration-300 font-headline font-bold text-lg"
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                <button
                  className="p-1 bg-surface-container rounded-lg active:scale-90 transition-transform"
                  onClick={() => setMaxParticipants(Math.max(1, maxParticipants - 1))}
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <button
                  className="p-1 bg-surface-container rounded-lg active:scale-90 transition-transform"
                  onClick={() => setMaxParticipants(maxParticipants + 1)}
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Partner Integration */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-extrabold text-2xl tracking-tight text-primary">Partners</h2>
            <button className="text-primary font-bold text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">add</span>
              Add Partner
            </button>
          </div>
          <div className="space-y-3">
            {/* Partner 1 */}
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary">local_cafe</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-sm">Peak Performance Nutrition</p>
                  <p className="text-xs text-on-surface-variant">Attach free hydration pack offer</p>
                </div>
              </div>
              <button
                className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-colors ${selectedPartners.has("peak") ? "border-primary" : "border-outline-variant"}`}
                onClick={() => togglePartner("peak")}
              >
                {selectedPartners.has("peak") && <div className="w-3 h-3 bg-primary rounded-sm"></div>}
              </button>
            </div>
            {/* Partner 2 */}
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">directions_bike</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-sm">Velocity Bike Works</p>
                  <p className="text-xs text-on-surface-variant">Attach 15% tune-up discount</p>
                </div>
              </div>
              <button
                className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-colors ${selectedPartners.has("velocity") ? "border-primary" : "border-outline-variant"}`}
                onClick={() => togglePartner("velocity")}
              >
                {selectedPartners.has("velocity") && <div className="w-3 h-3 bg-primary rounded-sm"></div>}
              </button>
            </div>
          </div>
        </section>

        {/* 6. Action Button */}
        <div className="pt-6">
          <button
            className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed py-5 rounded-full font-headline font-black text-lg tracking-tight shadow-[0px_24px_48px_rgba(255,143,117,0.15)] active:scale-[0.98] transition-all disabled:opacity-75"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? "Publishing..." : "Publish Ride"}
          </button>
        </div>
      </main>
    </div>
  );
}
