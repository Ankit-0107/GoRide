import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Profile() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Fetch user profile (skip for guest users)
    const isGuest = localStorage.getItem("guestUser");
    if (isGuest) {
      setUserName("User");
    } else {
      api.get("/auth/me")
        .then((res) => setUserName(res.data.name || res.data.user?.name || "User"))
        .catch(() => setUserName("User"));
    }
  }, []);

  return (
    <div className="bg-surface-container-lowest min-h-screen" style={{ minHeight: "max(884px, 100dvh)" }}>
      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-40 no-border bg-[#0e0e0e] flex justify-between items-center px-6 py-4 max-w-xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-outline-variant/20">
            <img
              alt="Elena Rodriguez"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuADaQOiKRBy6AKN0y0exY5nmskzlLKnhoacPrey-0FtM01IWK6xeicsCQMpyclQIwp5zPrvBqb6GLQ-Lijp56fyEqBj5Faywmk5kTVGbekCneFg8VgLTsqPBYySduvVZbEpTMvOIzLSIAzxqevdfC5MrGWvVQ-BoO7na0kNXK7P-Wk_mR0N1eAN3kp3pDk-NKNUjnmLIqnXSat5h9aUSPs9mqYxOa-bXisR1F3Xbq0k-NgooPxe3cMVbuG8vaDHonJ7M3j_LAfFWuI"
            />
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-2xl tracking-tight text-[#ff8f75]">Profile</h1>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-[#1a1919] transition-colors active:scale-95 duration-200">
          <span className="material-symbols-outlined text-[#adaaaa]">notifications</span>
        </button>
      </header>

      <main className="pb-32 px-6 max-w-xl mx-auto space-y-10 pt-8">
        {/* Profile Section */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150"></div>
            <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-primary-container">
              <img
                alt="Elena Rodriguez"
                className="w-full h-full object-cover rounded-full border-4 border-surface"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuADaQOiKRBy6AKN0y0exY5nmskzlLKnhoacPrey-0FtM01IWK6xeicsCQMpyclQIwp5zPrvBqb6GLQ-Lijp56fyEqBj5Faywmk5kTVGbekCneFg8VgLTsqPBYySduvVZbEpTMvOIzLSIAzxqevdfC5MrGWvVQ-BoO7na0kNXK7P-Wk_mR0N1eAN3kp3pDk-NKNUjnmLIqnXSat5h9aUSPs9mqYxOa-bXisR1F3Xbq0k-NgooPxe3cMVbuG8vaDHonJ7M3j_LAfFWuI"
              />
            </div>
          </div>
          <div>
            <h2 className="font-headline font-extrabold text-3xl tracking-tight">{userName}</h2>
            <p className="text-on-surface-variant font-medium mt-1">Gravel Enthusiast • San Francisco, CA</p>
          </div>
        </section>

        {/* Stats Row */}
        <section className="flex justify-between items-center py-6 px-8 bg-surface-container rounded-[28px]">
          <div className="text-center">
            <p className="font-headline font-extrabold text-xl text-primary">42</p>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">RIDES</p>
          </div>
          <div className="w-px h-8 bg-outline-variant/30"></div>
          <div className="text-center">
            <p className="font-headline font-extrabold text-xl text-primary">120</p>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">KM</p>
          </div>
          <div className="w-px h-8 bg-outline-variant/30"></div>
          <div className="text-center">
            <p className="font-headline font-extrabold text-xl text-primary">Top 10%</p>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">RIDER</p>
          </div>
        </section>

        {/* Achievements */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="font-headline font-bold text-xl text-on-surface tracking-tight">Achievements</h3>
            <button className="text-primary text-sm font-semibold">View All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-6 px-6 py-2">
            <div className="flex-shrink-0 w-32 aspect-square bg-surface-container rounded-[28px] flex flex-col items-center justify-center p-4 space-y-2 border border-outline-variant/10">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              </div>
              <p className="font-bold text-sm">Streak 5</p>
            </div>
            <div className="flex-shrink-0 w-32 aspect-square bg-surface-container rounded-[28px] flex flex-col items-center justify-center p-4 space-y-2 border border-outline-variant/10">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
              </div>
              <p className="font-bold text-sm">Explorer</p>
            </div>
            <div className="flex-shrink-0 w-32 aspect-square bg-surface-container rounded-[28px] flex flex-col items-center justify-center p-4 space-y-2 border border-outline-variant/10">
              <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
              </div>
              <p className="font-bold text-sm">Top Rider</p>
            </div>
          </div>
        </section>

        {/* Metrics Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container p-5 rounded-[28px] border border-outline-variant/5">
            <span className="material-symbols-outlined text-primary-dim mb-3">calendar_month</span>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">WEEKLY RIDES</p>
            <p className="font-headline font-extrabold text-2xl mt-1">14</p>
          </div>
          <div className="bg-surface-container p-5 rounded-[28px] border border-outline-variant/5">
            <span className="material-symbols-outlined text-primary-dim mb-3">distance</span>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">AVERAGE DIST</p>
            <p className="font-headline font-extrabold text-2xl mt-1">28.4 <span className="text-xs font-medium">km</span></p>
          </div>
          <div className="bg-surface-container p-5 rounded-[28px] border border-outline-variant/5">
            <span className="material-symbols-outlined text-primary-dim mb-3">schedule</span>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">TOTAL HOURS</p>
            <p className="font-headline font-extrabold text-2xl mt-1">156</p>
          </div>
          <div className="bg-surface-container p-5 rounded-[28px] border border-outline-variant/5">
            <span className="material-symbols-outlined text-primary-dim mb-3">bolt</span>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">BEST STREAK</p>
            <p className="font-headline font-extrabold text-2xl mt-1">12 <span className="text-xs font-medium">Days</span></p>
          </div>
        </section>

        {/* Go Premium Banner */}
        <section className="relative overflow-hidden bg-surface-container-high rounded-[28px] p-6 border border-primary/20">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/10 blur-3xl rounded-full"></div>
          <div className="relative z-10 space-y-4">
            <div>
              <h3 className="font-headline font-bold text-xl tracking-tight">Unlock Full Power</h3>
              <p className="text-on-surface-variant text-sm mt-1">Advanced metrics and custom routes.</p>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs font-medium">
                <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Live Performance Ghost
              </li>
              <li className="flex items-center gap-2 text-xs font-medium">
                <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Unlimited Route Planning
              </li>
            </ul>
            <button className="w-full py-4 bg-gradient-to-br from-[#ff8f75] to-[#ff7859] text-black font-extrabold rounded-full shadow-lg shadow-primary/10 active:scale-95 transition-transform">
              UPGRADE NOW
            </button>
          </div>
        </section>

        {/* Global Leaderboard Rank */}
        <section className="bg-surface-container p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all border border-outline-variant/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>leaderboard</span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">GLOBAL RANK</p>
              <p className="font-headline font-bold text-lg">#124</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-outline">chevron_right</span>
        </section>

        {/* Account Settings List */}
        <section className="space-y-1">
          <div className="px-2 py-3">
            <h3 className="text-[10px] font-black text-outline uppercase tracking-[0.2em]">Account Settings</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-surface-container rounded-2xl group hover:bg-surface-bright transition-colors">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-on-surface-variant">history</span>
                <span className="font-medium">My Rides History</span>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-surface-container rounded-2xl group hover:bg-surface-bright transition-colors">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-on-surface-variant">bookmark</span>
                <span className="font-medium">Saved Rides</span>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-surface-container rounded-2xl group hover:bg-surface-bright transition-colors">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                <span className="font-medium">Notifications</span>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-surface-container rounded-2xl group hover:bg-surface-bright transition-colors">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-on-surface-variant">payments</span>
                <span className="font-medium">Payment Settings</span>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-surface-container rounded-2xl group hover:bg-surface-bright transition-colors">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-on-surface-variant">help</span>
                <span className="font-medium">Help &amp; Support</span>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-surface-container rounded-2xl group hover:bg-surface-bright transition-colors">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-on-surface-variant">gavel</span>
                <span className="font-medium">Legal</span>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Session Action Button */}
        <section className="pt-4">
          {!localStorage.getItem("guestUser") ? (
            <button 
              className="w-full py-4 bg-[#a70138]/10 text-[#d73357] font-black tracking-widest rounded-[28px] border border-[#a70138]/20 active:scale-95 transition-transform uppercase"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("guestUser");
                navigate("/");
              }}
            >
              LOG OUT
            </button>
          ) : (
            <button 
              className="w-full py-4 bg-[#ff8f75]/10 text-[#ff8f75] font-black tracking-widest rounded-[28px] border border-[#ff8f75]/20 active:scale-95 transition-transform uppercase"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("guestUser");
                navigate("/");
              }}
            >
              LOG IN
            </button>
          )}
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-[#2c2c2c]/60 backdrop-blur-xl rounded-t-[3rem] z-50 shadow-[0px_-24px_48px_rgba(255,143,117,0.08)]">
        <div
          className="flex flex-col items-center justify-center text-[#adaaaa] px-5 py-2 hover:text-white transition-all active:scale-90 duration-150 cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-['Inter'] text-[10px] font-medium uppercase tracking-widest">Home</span>
        </div>
        <div
          className="flex flex-col items-center justify-center text-[#adaaaa] px-5 py-2 hover:text-white transition-all active:scale-90 duration-150 cursor-pointer"
          onClick={() => navigate("/campaign")}
        >
          <span className="material-symbols-outlined">explore</span>
          <span className="font-['Inter'] text-[10px] font-medium uppercase tracking-widest">Campaign</span>
        </div>
        <div
          className="flex flex-col items-center justify-center text-[#adaaaa] px-5 py-2 hover:text-white transition-all active:scale-90 duration-150 cursor-pointer"
          onClick={() => navigate("/community")}
        >
          <span className="material-symbols-outlined">group</span>
          <span className="font-['Inter'] text-[10px] font-medium uppercase tracking-widest">Community</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#ff8f75] to-[#ff7859] text-black rounded-full px-5 py-2 active:scale-90 duration-150">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
          <span className="font-['Inter'] text-[10px] font-medium uppercase tracking-widest">Settings</span>
        </div>
      </nav>
    </div>
  );
}