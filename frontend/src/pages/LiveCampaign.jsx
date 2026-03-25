// src/pages/LiveCampaign.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Map from "react-map-gl";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const LAT = parseFloat(process.env.REACT_APP_DEFAULT_LAT) || 28.6139;
const LNG = parseFloat(process.env.REACT_APP_DEFAULT_LNG) || 77.2090;
const ZOOM = parseFloat(process.env.REACT_APP_DEFAULT_ZOOM) || 12;

export default function LiveCampaign() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30" style={{ minHeight: "max(884px, 100dvh)" }}>
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-md">
        <div className="flex justify-between items-center px-6 py-4 w-full">
          <div className="flex items-center gap-4">
            <button
              className="text-[#ff8f75] hover:bg-neutral-800/50 transition-colors active:scale-95 duration-200 p-2 rounded-full"
              onClick={() => navigate("/campaign")}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-lg font-extrabold text-neutral-50 font-['Plus_Jakarta_Sans'] tracking-tight">
              Ride Active
            </h1>
          </div>
          <button className="text-neutral-400 hover:bg-neutral-800/50 transition-colors active:scale-95 duration-200 p-2 rounded-full">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      {/* Main Canvas: Live Map Background */}
      <main className="relative h-screen w-full overflow-hidden">
        {/* Map Visualization */}
        <div className="absolute inset-0 z-0 bg-black">
          <Map
            initialViewState={{
              longitude: LNG,
              latitude: LAT,
              zoom: ZOOM + 2,
              pitch: 60,
              bearing: 45
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(circle, transparent 20%, rgba(14, 14, 14, 0.8) 100%)" }}
          ></div>
        </div>

        {/* Group Status Floating Indicator */}
        <div className="absolute top-24 left-6 z-10 flex flex-col gap-3">
          <div className="bg-surface-bright/60 backdrop-blur-xl rounded-full px-4 py-2 flex items-center gap-3 border border-outline-variant/20">
            <div className="flex -space-x-3">
              <img
                className="w-8 h-8 rounded-full border-2 border-surface object-cover"
                alt="participant"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzvY0aNJt5o7r1dI0w1_vgY4RkFIku4uNDYJ1p4MLheQ2YeDg2ouh6d4G8hwMRJV5APn0qHt4dN0ZrOxhgGUL_OMT4Dh0lh_h5F07V7c9KIqNFn3jvX44jM-ubWCPolWDkO329WsKBgiA-Y02uU3xKaMR2WtIGOEV4Ds2-zIVgy101vDFTwWCAUYEdanITiBpqsZBYmOi3nekehSBrOSrKBBUonEiYNc0ZftEpV2EwAeC1iWLDvViAotDL6hGDrxkVDL-Bb1PGB7U"
              />
              <img
                className="w-8 h-8 rounded-full border-2 border-surface object-cover"
                alt="participant"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT-GpVocOeBP02Lfmr-8k5KG-gtX6MbMpi9Pu86FPvt__gBcZ4L65ArjlctVResnHbu7blSC7hp_qqxZQvzhBMmkqEkz8mVhvwQx20bxt2QA_Kta4WbJHQ8Fv4wGe1MTKdy-urI_TEVkwvPo-oI651NeX-ECw9O3e0nMhTOYBSf4Yu8CjGHzu5BLm_rutDzJj8wCoikKEc_zJVMKBVG4HPhSmUn5wZ2JV7GK7GIs5WBT-TPN1CN0oVYPjzBLvFGDJsPTkgbMN_gio"
              />
              <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary-container flex items-center justify-center text-[10px] font-bold text-on-primary-container">
                +4
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest">
                Group
              </span>
              <span className="text-xs font-bold text-primary">In Range</span>
            </div>
          </div>
        </div>

        {/* Real-time Stats Overlay Wrapper */}
        <div className="absolute bottom-32 inset-x-0 px-6 z-10 space-y-4">

          {/* Grid Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container-high/60 backdrop-blur-xl rounded-lg p-4 flex flex-col items-center justify-center border border-white/5">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">
                Distance
              </span>
              <span className="text-lg font-headline font-extrabold">
                5.2<span className="text-xs text-[#ff7859] ml-1">km</span>
              </span>
            </div>
            <div className="bg-surface-container-high/60 backdrop-blur-xl rounded-lg p-4 flex flex-col items-center justify-center border border-white/5">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">
                Time
              </span>
              <span className="text-lg font-headline font-extrabold">45:12</span>
            </div>
          </div>

          {/* Ride Controls */}
          <div className="flex gap-4 pt-2">
            <button className="flex-1 h-16 bg-surface-bright/80 backdrop-blur-md rounded-full flex items-center justify-center gap-3 border border-outline-variant/30 active:scale-95 duration-200 group">
              <span
                className="material-symbols-outlined text-on-surface group-hover:text-primary transition-colors"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                pause_circle
              </span>
              <span className="font-headline font-bold text-on-surface">Pause Ride</span>
            </button>
            <button
              className="flex-1 h-16 rounded-full flex items-center justify-center gap-3 shadow-[0px_24px_48px_rgba(255,143,117,0.15)] active:scale-95 duration-200"
              style={{ background: "linear-gradient(135deg, #ff8f75 0%, #ff7859 100%)" }}
              onClick={() => navigate("/home")}
            >
              <span
                className="material-symbols-outlined text-black"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                stop_circle
              </span>
              <span className="font-headline font-bold text-black">End Ride</span>
            </button>
          </div>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md rounded-[3rem] z-50 bg-[#2c2c2c]/60 backdrop-blur-xl shadow-[0px_24px_48px_rgba(255,143,117,0.08)]">
        <div className="flex justify-around items-center px-4 py-2">
          <button
            className="flex items-center justify-center text-neutral-400 p-4 hover:text-white transition-all active:scale-90 duration-200"
            onClick={() => navigate("/community-chat")}
          >
            <span className="material-symbols-outlined">chat_bubble</span>
          </button>
          <button
            className="flex items-center justify-center bg-gradient-to-br from-[#ff8f75] to-[#ff7859] text-black rounded-full p-4 scale-110 active:scale-90 duration-200"
            onClick={() => navigate("/home")}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              stop_circle
            </span>
          </button>
          <button className="flex items-center justify-center text-neutral-400 p-4 hover:text-white transition-all active:scale-90 duration-200">
            <span className="material-symbols-outlined">insert_chart</span>
          </button>
        </div>
      </nav>

      {/* Extra subtle glow at the bottom to ground the layout */}
      <div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-40"></div>
    </div>
  );
}
