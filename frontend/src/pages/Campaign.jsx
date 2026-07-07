import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import BottomNav from "../components/BottomNav";

export default function Campaign() {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [userName, setUserName] = useState("");
  const [myRides, setMyRides] = useState([]);

  useEffect(() => {
    // Fetch user profile (skip for guest users)
    const isGuest = localStorage.getItem("guestUser");
    if (isGuest) {
      setUserName("User");
    } else {
      api.get("/auth/me")
        .then((res) => {
          const name = res.data.name || res.data.user?.name || "User";
          setUserName(name);
          // Fetch rides created by this user
          api.get(`/rides/my?createdByName=${encodeURIComponent(name)}`)
            .then((r) => setMyRides(r.data.rides || []))
            .catch((err) => console.error("Error fetching my rides:", err));
        })
        .catch(() => setUserName("User"));
    }
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="bg-[#0e0e0e] text-white min-h-screen pb-32 font-body selection:bg-[#ff8f75] selection:text-[#5f0e00]" style={{ minHeight: "max(884px, 100dvh)", animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl border-b border-white/5 bg-[#0e0e0e]/80 flex justify-end items-center px-6 h-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/notifications-page")} className="relative w-10 h-10 rounded-full bg-[#2c2c2c]/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#ff8f75]/20 hover:text-[#ff8f75] transition-all active:scale-95 duration-300 border border-white/10">
            <span className="material-symbols-outlined text-2xl">notifications</span>
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-[#adaaaa] hover:text-white transition-colors active:scale-95 duration-300 border-2 border-[#ff8f75]/20 overflow-hidden"
            title="Profile"
          >
            <span className="material-symbols-outlined text-xl">person</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto pt-24 px-6 relative z-10">
        {/* Floating Orbs Background */}
        <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-[#ff8f75]/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-[#e6a7ff]/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-float" style={{ animationDelay: '2s' }}></div>

        {/* Create Campaign CTA */}
        <div className="mb-12 glass-card p-8 rounded-[2rem] glow-border flex flex-col items-center text-center gap-4 hover-glow-shadow transition-all duration-300">
          <div className="w-16 h-16 rounded-full bg-[#ff8f75]/20 flex items-center justify-center text-[#ff8f75] mb-2 shadow-[0_0_20px_rgba(255,143,117,0.3)]">
            <span className="material-symbols-outlined text-4xl">add_circle</span>
          </div>
          <h3 className="font-headline font-bold text-2xl text-white">Ready to lead your own movement?</h3>
          <p className="text-[#adaaaa] font-body max-w-sm">
            Create a custom campaign for your local community or club and set your own goals.
          </p>
          <button
            className="mt-4 bg-gradient-brand text-black font-headline font-black tracking-widest px-10 py-4 rounded-full hover:scale-105 transition-transform active:scale-95 glow-shadow uppercase"
            onClick={() => navigate("/create-campaign")}
          >
            Create Campaign
          </button>
        </div>

        {/* Section Header — Campaigns Created By You */}
        <div className="mb-8">
          <h2 className="font-headline font-black text-3xl tracking-tight text-white mb-2 uppercase gradient-text">Your Campaigns</h2>
          <p className="text-[#adaaaa] font-body">Manage your rides and track participation.</p>

        </div>

        {/* User's Created Campaigns */}
        <section className="mb-12">
          {myRides.length === 0 ? (
            <div className="glass-card rounded-[2rem] p-10 flex flex-col items-center text-center gap-4 border border-white/5">
              <div className="w-14 h-14 rounded-full bg-[#e6a7ff]/20 flex items-center justify-center shadow-[0_0_20px_rgba(230,167,255,0.3)]">
                <span className="material-symbols-outlined text-[#e6a7ff] text-3xl">campaign</span>
              </div>
              <h3 className="font-headline font-bold text-lg text-white">No campaigns yet</h3>
              <p className="text-[#adaaaa] font-body text-sm max-w-xs">
                You haven't created any campaigns yet. Tap "Create Campaign" above to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRides.map((ride) => (
                <div
                  key={ride._id}
                  className="glass-card rounded-[1.5rem] p-5 flex items-center justify-between group hover-glow-shadow transition-all duration-300 cursor-pointer border border-white/5 hover:border-white/10"
                  onClick={() => navigate(`/ride-active/${ride._id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#ff8f75]/20 flex items-center justify-center text-[#ff8f75] flex-shrink-0 group-hover:bg-[#ff8f75] group-hover:text-black transition-colors">
                      <span className="material-symbols-outlined text-2xl">directions_bike</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-headline font-bold text-white text-lg group-hover:text-[#ff8f75] transition-colors truncate">
                        {ride.title || ride.rideName}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-on-surface-variant font-body text-xs flex-wrap">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          {formatDate(ride.scheduledStartTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">person</span>
                          {ride.waypoints?.length || 0}/{ride.maxPassengers || 10}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide 
                          ${ride.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                            ride.status === 'scheduled' ? 'bg-[#ff8f75]/20 text-[#ff8f75]' : 
                            ride.status === 'completed' ? 'bg-gray-500/20 text-gray-400' : 
                            'bg-red-500/20 text-red-400'}`}>
                          {ride.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-primary hover:border-primary hover:text-black transition-all flex-shrink-0">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Trending Missions List */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h3 className="font-headline font-black text-2xl tracking-tight gradient-text uppercase">Trending Missions</h3>
            <button className="text-[#ff8f75] font-label text-sm font-bold flex items-center gap-1 hover:opacity-70 transition-opacity">
              See All <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mission Card 1 */}
            <div className="glass-card rounded-[1.5rem] p-5 flex items-center justify-between group hover-glow-shadow transition-all duration-300 border border-white/5 hover:border-white/10 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#201f1f] flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-[#ff8f75]/50 transition-colors">
                  <img
                    className="w-full h-full object-cover"
                    alt="city streets"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpn3KB6NeQKEu6JhGzs-XGUx7OwZIH9dmOjpJDZuSjPQh3qCqeFxFJhYVbC4xnnuvT0VsUMsN-ohbCZFQ4KVrenxPuojND90D1cFN5BzP_XLAXxYerwd9JclJ3ZnXWjXFaBCjOy4CMtc0DGcmG-C51uZfSOs5PtfjSrgyp5UPTQHUUymo7sgQo_saSL6nOL3QhbF2p7nVAswKkrWCzBi_SpQXx_s2m3YLl6XN4WZLRzH2fBxrtj-N29d_z1_jMR9G2bakCQpOUQxo"
                  />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-white text-lg group-hover:text-primary transition-colors">
                    Green City Dash
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-on-surface-variant font-body text-xs">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">distance</span> 120km
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">person</span> 842 participants
                    </span>
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-primary hover:border-primary hover:text-black transition-all">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            {/* Mission Card 2 */}
            <div className="glass-card rounded-[1.5rem] p-5 flex items-center justify-between group hover-glow-shadow transition-all duration-300 border border-white/5 hover:border-white/10 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#201f1f] flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-[#ff8f75]/50 transition-colors">
                  <img
                    className="w-full h-full object-cover"
                    alt="alpine peaks"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZlSgX5iPKRY3EcAMULrNW5O6kX95gEmD10WWDWq8P-1XGZ5B0-HnHYMZapHf2kTx2t1cdgTkNUx-m9ooTjMtsHPZx7rJng2mKmkEwyovvrubOICNEceCOXkzRDplECxzBmUETEim5o526lTdJ-U83htx2o9E0wly-cLvAcMCCuqvm7-4pOTDj2yGHfPH8XjKehEJLqIUfqwS-twCvZNyYKZo_0XEJxDXJqX1To0lE7v8nDfqL9osLQR17aQLZcmWY4unPVuHiXmc"
                  />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-white text-lg group-hover:text-primary transition-colors">
                    Alpine Ascent
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-on-surface-variant font-body text-xs">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">distance</span> 240km
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">person</span> 1.1k participants
                    </span>
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-primary hover:border-primary hover:text-black transition-all">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            {/* Mission Card 3 */}
            <div className="glass-card rounded-[1.5rem] p-5 flex items-center justify-between group hover-glow-shadow transition-all duration-300 border border-white/5 hover:border-white/10 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#201f1f] flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-[#ff8f75]/50 transition-colors">
                  <img
                    className="w-full h-full object-cover"
                    alt="cycling path"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTq_upytlNF_ZTP9aOlckXgb6Wuu8YaQI7UmFBW2LHoA6ciRXhpU2ZHuc6oQEnGhSGxUZmvSeB-UdfFGr-kFUoZte2BtZME9D9s7rJUXoKGY3OS2NI3vHV53BqZZZcPGjx6kdVzOiZgYOH3kAHaTyX4h9m31wJo4pqVa2klUtKAP5k8_qN4JyLdWG6r-1a4dgJly1s6vPe8YNi8YahSdJ2foU5Zn3mc5ZpKIjLV_Cjpxvj8y3Yk-7fUn6pmAh-O3PfpIRTaXcJid8"
                  />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-white text-lg group-hover:text-primary transition-colors">
                    Suburban Sprint
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-on-surface-variant font-body text-xs">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">distance</span> 45km
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">person</span> 320 participants
                    </span>
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-primary hover:border-primary hover:text-black transition-all">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            {/* Mission Card 4 */}
            <div className="glass-card rounded-[1.5rem] p-5 flex items-center justify-between group hover-glow-shadow transition-all duration-300 border border-white/5 hover:border-white/10 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#201f1f] flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-[#ff8f75]/50 transition-colors">
                  <img
                    className="w-full h-full object-cover"
                    alt="heritage streets"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJvz57eEqmRkWSYastllL99LWcStPGM9HRPQIgMgG64KuTyYNhnLjwhTdFhRzsdPhlZlvoQgSUDiK3kkwlPcPKLVMCD0AkhLwJlPkmeQIH4s1_jzAOLjGAFtqKyb6JWDQ-pfu7SS9W0RS5xkZHV90X5DQzifgxrYjV8Ad58M3pYHpbuA5PN2uQqw5IXrtrv59FJ0hw_noZM7iIt1d_X03L6Qov0BisWYXMJwxWKFrOqyNamYe6vhyZbt6W1dNDrvNsAuaV6k0yttA"
                  />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-white text-lg group-hover:text-primary transition-colors">
                    Heritage Loop
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-on-surface-variant font-body text-xs">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">distance</span> 85km
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">person</span> 512 participants
                    </span>
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-primary hover:border-primary hover:text-black transition-all">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <BottomNav />
    </div>
  );
}