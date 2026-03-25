import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Campaign() {
  const navigate = useNavigate();
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
    <div className="bg-background min-h-screen pb-32" style={{ minHeight: "max(884px, 100dvh)" }}>
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl border-none bg-[#0e0e0e]/80 flex justify-between items-center px-6 h-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
            <img
              alt="User Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAq-vbwodivEMn2ONCS5pitv86dSKH4HnchCmYhQcvd9uUodTgXxZFdz2IYqiTkLKI2eu0UE-VeSGUMRhUCl5-3wFfaXwAQ7gKXUCrkK2coJdl2XoMwqs3htVYaB5xDpj4KETcXxqjohSsLR6O9J1g9Lu78MhNqdR1StR7ELoKSnOZWLN5NfH9kR8VGQgtuaRvjbge8e4EBEh32yThSuBmHooF0qZXtAtF33twgNpRZuI_SEjTTIr_-GBI_RU5JUsE87-_0iQs-VAc"
            />
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-2xl tracking-tight text-[#ff8f75]">Hi, {userName}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary-fixed hover:opacity-70 transition-opacity active:scale-95 duration-300">
            <span className="material-symbols-outlined text-2xl">notifications</span>
          </button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-5xl mx-auto">
        {/* Create Campaign CTA */}
        <div className="mb-12 bg-surface-container-low p-8 rounded-xl border border-white/5 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <span className="material-symbols-outlined text-4xl">add_circle</span>
          </div>
          <h3 className="font-headline font-bold text-xl">Ready to lead your own movement?</h3>
          <p className="text-on-surface-variant font-body max-w-sm">
            Create a custom campaign for your local community or club and set your own goals.
          </p>
          <button
            className="mt-4 bg-white text-black font-headline font-bold px-10 py-4 rounded-full hover:scale-105 transition-transform active:scale-95 shadow-[0_12px_24px_rgba(255,255,255,0.05)]"
            onClick={() => navigate("/create-campaign")}
          >
            Create Campaign
          </button>
        </div>

        {/* Section Header — Campaigns Created By You */}
        <div className="mb-8">
          <h2 className="font-headline font-bold text-3xl tracking-tight text-white mb-2">Campaigns Created By You</h2>
          <p className="text-on-surface-variant font-body">Manage your rides and track participation.</p>
        </div>

        {/* User's Created Campaigns */}
        <section className="mb-12">
          {myRides.length === 0 ? (
            <div className="bg-surface-container-low rounded-xl p-10 flex flex-col items-center text-center gap-4 border border-white/5">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">campaign</span>
              </div>
              <h3 className="font-headline font-bold text-lg text-white">No campaigns yet</h3>
              <p className="text-on-surface-variant font-body text-sm max-w-xs">
                You haven't created any campaigns yet. Tap "Create Campaign" above to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRides.map((ride) => (
                <div
                  key={ride._id}
                  className="bg-surface-container rounded-lg p-5 flex items-center justify-between group hover:bg-surface-container-high transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/ride-active/${ride._id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <span className="material-symbols-outlined text-2xl">directions_bike</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-headline font-bold text-white text-lg group-hover:text-primary transition-colors truncate">
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
            <h3 className="font-headline font-bold text-xl tracking-tight">Trending Missions</h3>
            <button className="text-primary font-label text-sm font-bold flex items-center gap-1 hover:opacity-70 transition-opacity">
              See All <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mission Card 1 */}
            <div className="bg-surface-container rounded-lg p-5 flex items-center justify-between group hover:bg-surface-container-high transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center text-primary overflow-hidden">
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
            <div className="bg-surface-container rounded-lg p-5 flex items-center justify-between group hover:bg-surface-container-high transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center text-primary overflow-hidden">
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
            <div className="bg-surface-container rounded-lg p-5 flex items-center justify-between group hover:bg-surface-container-high transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center text-primary overflow-hidden">
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
            <div className="bg-surface-container rounded-lg p-5 flex items-center justify-between group hover:bg-surface-container-high transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center text-primary overflow-hidden">
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
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-[#2c2c2c]/60 backdrop-blur-xl rounded-t-[3rem] z-50 shadow-[0px_-24px_48px_rgba(255,143,117,0.08)]">
        <div
          className="flex flex-col items-center justify-center text-[#adaaaa] px-5 py-2 hover:text-white transition-all active:scale-90 duration-150 cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-['Inter'] text-[10px] font-medium uppercase tracking-widest">Home</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#ff8f75] to-[#ff7859] text-black rounded-full px-5 py-2 active:scale-90 duration-150">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            explore
          </span>
          <span className="font-['Inter'] text-[10px] font-medium uppercase tracking-widest">Campaign</span>
        </div>
        <div
          className="flex flex-col items-center justify-center text-[#adaaaa] px-5 py-2 hover:text-white transition-all active:scale-90 duration-150 cursor-pointer"
          onClick={() => navigate("/community")}
        >
          <span className="material-symbols-outlined">group</span>
          <span className="font-['Inter'] text-[10px] font-medium uppercase tracking-widest">Community</span>
        </div>
        <div
          className="flex flex-col items-center justify-center text-[#adaaaa] px-5 py-2 hover:text-white transition-all active:scale-90 duration-150 cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-['Inter'] text-[10px] font-medium uppercase tracking-widest">Settings</span>
        </div>
      </nav>
    </div>
  );
}