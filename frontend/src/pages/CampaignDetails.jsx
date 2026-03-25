// src/pages/CampaignDetails.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Map from "react-map-gl";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const LAT = parseFloat(process.env.REACT_APP_DEFAULT_LAT) || 28.6139;
const LNG = parseFloat(process.env.REACT_APP_DEFAULT_LNG) || 77.2090;
const ZOOM = parseFloat(process.env.REACT_APP_DEFAULT_ZOOM) || 12;

export default function CampaignDetails() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background font-body antialiased" style={{ minHeight: "max(884px, 100dvh)" }}>
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#0e0e0e]/60 backdrop-blur-xl flex items-center justify-between px-6 h-16">
        <button
          className="text-[#ff8f75] hover:bg-[#2c2c2c]/40 transition-colors active:scale-95 duration-200 p-2 rounded-full"
          onClick={() => navigate("/campaign")}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-xl tracking-tight text-[#ff8f75]">Ride Details</h1>
        <button className="text-[#ff8f75] hover:bg-[#2c2c2c]/40 transition-colors active:scale-95 duration-200 p-2 rounded-full">
          <span className="material-symbols-outlined">share</span>
        </button>
      </header>

      <main className="pt-16 pb-24">
        {/* Hero Map Section */}
        <section className="px-6 pt-6 pb-2">
          <div className="mb-6">
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-2 inline-block">
              Morning Series
            </span>
            <h2 className="font-headline font-extrabold text-4xl tracking-tight text-on-background">
              Sunrise Ride
            </h2>
          </div>
          <div className="relative w-full h-[240px] rounded-3xl overflow-hidden shadow-2xl border border-white/5">
            <div className="absolute inset-0 z-0">
              <Map
                initialViewState={{
                  longitude: LNG,
                  latitude: LAT,
                  zoom: ZOOM,
                  pitch: 45
                }}
                style={{ width: "100%", height: "100%" }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
                interactive={false}
              />
            </div>
          </div>
        </section>

        <div className="px-6 pt-6 relative z-30 space-y-8">
          {/* Ride Leader Card */}
          <div className="bg-surface-container-high p-4 rounded-xl flex items-center justify-between gap-4 shadow-xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  className="w-12 h-12 rounded-full object-cover border-[1.5px] border-primary"
                  alt="Marcus Thorne"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHKm_cbnuHc0S0xPw0dI-vORW1ORFJcPd8J4tXrSKPZXcr5zFZkvDCm4SZ7JPAY8-chUYahJAVC7AG6RA5BGTcaIH5TI0ioztZyLwASGrfC6JnSLS2b4x2q9nWo-oaKIhX_BaCTQVU7pFaBshy1giy8ZuHAuSx-Hb99IRHrI81sb3xBKyr728WMJfObzcSRf-D4CuFjoNns4B-unvbP1wV71bVLuh2-O9e-mt1pmVpYVExNDxQYg7S9tK1qeG-eaqM1AoRZGFJ-G4"
                />
                <div className="absolute -bottom-1 -right-1 bg-primary w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-on-primary-fixed font-bold">
                  ✓
                </div>
              </div>
              <div>
                <p className="text-on-surface-variant text-[11px] font-medium uppercase tracking-widest mb-0.5">Ride Leader</p>
                <h3 className="font-headline font-bold text-base leading-tight">Marcus Thorne</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-primary text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-on-surface font-bold text-xs">4.8</span>
                </div>
              </div>
            </div>
            <button className="bg-surface-bright text-primary px-3 py-1.5 rounded-full text-xs font-bold border border-outline-variant/20 hover:bg-surface-container-highest transition-all">
              Profile
            </button>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              <img
                className="w-10 h-10 rounded-full border-2 border-surface-container-low object-cover"
                alt="participant"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6dVQq91SSBoqUwZlRHgz8_ufkQsbmW5UtS-41SDZFtJTk-L4Zfmkd0OTzvDKC9AT1yTI1Y7eLbm1rJIYSp1j_KLeBpvTt-DtSuIZ3Mz_D724dvvQEx6bZOl1jqKTBBXz788Vbuqk-nF-mhCypXOGG4n4qF59djQGAI7_474IuUwQVgXlNXbawtbRs9_5fPMe3QFGxYalS1bxn-Q6MwSdVXAgbK1ThFlZRXouzkg9KKW4gAAFk-yxcc4n1-ErmnWaHxam38t0EGSQ"
              />
              <img
                className="w-10 h-10 rounded-full border-2 border-surface-container-low object-cover"
                alt="participant"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmWu8E-T7ud5mZsPiOR15nj1LV9chJF-5sWFQGp75Ts-BT-MJ0qdVDtR1iZARb7OZ05jlItoeUo29XiHlnJLXTCC2WVVXWCthirVLW3-1rfaC1UXtYMzkChSNpAz0s999pFJCFYzVNZOqvUu-GOlKJG9wmUfddW8aSXZDI_B-2NhaCFvJrThF2dVuPmfwNpUP2U29rrmecl8zOs5o6SVMW2jzntzgVjHCY9NcWalgPlehfsc1AYkzhHK05t6K4bFBS4U8X5CE4E94"
              />
              <img
                className="w-10 h-10 rounded-full border-2 border-surface-container-low object-cover"
                alt="participant"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdPxDpHjKHcxKzDBLiT-WL6OI5IVc3NYmAKPv9Z22A6Ez_Q90OCpzjKSan1wXbGAe9J7xdVPSDXYcpYK0kuO5mZCxoPwqvCZkPA9fFdPIYylXjY3LzwXXLrrNMTWzDcjwG8Xs7VcJNc6MWKwaffib8BIAG0dVeki_ttxlX-oDnAndVRti3LvRThFgx3Xo33RRhNimVUTqiHgXuyVA3QNt-VFgXc3Dy684QJWYPWl9omVeLN5McX6zFy62Orv2oLEgs3Qu-0yq5b9o"
              />
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-xs font-bold border-2 border-surface-container-low">
                +9
              </div>
            </div>
            <p className="text-on-surface-variant font-medium text-sm">
              <span className="text-on-surface font-bold">12 participants</span> joined
            </p>
          </div>

          {/* Stats Bento Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low p-5 rounded-lg border-l-4 border-primary/40">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary-fixed-dim">straighten</span>
                <span className="text-on-surface-variant text-xs font-bold tracking-widest uppercase">Distance</span>
              </div>
              <p className="font-headline font-extrabold text-2xl">
                5.2 <span className="text-sm font-normal text-on-surface-variant">km</span>
              </p>
            </div>
            <div className="bg-surface-container-low p-5 rounded-lg border-l-4 border-primary/40">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary-fixed-dim">schedule</span>
                <span className="text-on-surface-variant text-xs font-bold tracking-widest uppercase">Duration</span>
              </div>
              <p className="font-headline font-extrabold text-2xl">
                45 <span className="text-sm font-normal text-on-surface-variant">min</span>
              </p>
            </div>
            <div className="bg-surface-container-low p-5 rounded-lg border-l-4 border-primary/40">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary-fixed-dim">bolt</span>
                <span className="text-on-surface-variant text-xs font-bold tracking-widest uppercase">Difficulty</span>
              </div>
              <p className="font-headline font-extrabold text-2xl">Medium</p>
            </div>
            <div className="bg-surface-container-low p-5 rounded-lg border-l-4 border-primary/40">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary-fixed-dim">location_on</span>
                <span className="text-on-surface-variant text-xs font-bold tracking-widest uppercase">Location</span>
              </div>
              <p className="font-headline font-extrabold text-2xl">Market St</p>
            </div>
          </div>

          {/* About Section */}
          <div className="space-y-4">
            <h4 className="font-headline font-bold text-2xl">About the Ride</h4>
            <p className="text-on-surface-variant leading-relaxed text-lg">
              Join us for an invigorating morning pedal through the heart of the city. We'll be catching the first rays of light as we cruise down Market St, finishing with a group coffee. Perfect for intermediate riders looking to start their day with high energy.
            </p>
          </div>

          {/* Partner Offer Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#ff8f75] to-[#ff7859] p-6 rounded-lg shadow-xl group">
            <div className="relative z-10 flex justify-between items-center">
              <div className="space-y-1">
                <span className="bg-black/20 text-on-primary-fixed px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                  Partner Offer
                </span>
                <h4 className="font-headline font-extrabold text-2xl text-on-primary-fixed">Daily Grind Cafe</h4>
                <p className="text-on-primary-fixed/80 text-sm font-medium">
                  Free Espresso for all participants after the ride.
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-fixed text-3xl">local_cafe</span>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
          </div>
        </div>
      </main>

      {/* Bottom Action */}
      <div className="fixed bottom-0 w-full z-40 bg-background/80 backdrop-blur-2xl px-6 pt-4 pb-8">
        <button
          className="w-full bg-gradient-to-br from-[#ff8f75] to-[#ff7859] text-on-primary-fixed font-headline font-extrabold text-xl py-5 rounded-full shadow-[0px_24px_48px_rgba(255,143,117,0.2)] active:scale-95 transition-transform"
          onClick={() => navigate("/ride-active")}
        >
          Join Campaign
        </button>
      </div>
    </div>
  );
}
