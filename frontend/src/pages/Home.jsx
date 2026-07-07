// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import BottomNav from "../components/BottomNav";

export default function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [scheduledRides, setScheduledRides] = useState([]);
  const [nearbyCampaigns, setNearbyCampaigns] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

    // Fetch scheduled rides
    api.get("/rides/scheduled")
      .then((res) => setScheduledRides(res.data.rides || res.data || []))
      .catch((err) => console.error("Error fetching scheduled rides:", err));

    // Fetch nearby campaigns/rides
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        api.get(`/rides/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius=10`)
          .then((res) => setNearbyCampaigns(res.data.rides || res.data || []))
          .catch((err) => console.error("Error fetching nearby campaigns:", err));
      },
      () => {
        api.get("/rides/nearby?lat=28.6139&lng=77.2090&radius=10")
          .then((res) => setNearbyCampaigns(res.data.rides || res.data || []))
          .catch((err) => console.error("Error fetching nearby campaigns:", err));
      }
    );

    // Fetch unread notifications
    if (!isGuest) {
      api.get("/notifications").then(res => {
        if (res.data.success) {
          setUnreadNotifications(res.data.notifications.filter(n => !n.read).length);
        }
      }).catch(err => console.error("Error fetching notifications:", err));
    }
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return { date: "TBD", time: "TBD" };
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
      time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const campaignColors = [
    { bg: "bg-[#ff7859]/20", text: "text-[#ff8f75]" },
    { bg: "bg-[#84222c]/20", text: "text-[#f5777c]" },
    { bg: "bg-[#5a1778]/20", text: "text-[#e6a7ff]" },
  ];

  return (
    <div className="bg-[#0e0e0e] text-white font-body min-h-screen pb-32 overflow-x-hidden" style={{ minHeight: "max(884px, 100dvh)" }}>
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl border-none bg-[#0e0e0e]/80 flex justify-between items-center px-6 h-20">
        <div className="flex items-center">
          <h1 className="font-headline font-extrabold text-2xl tracking-tighter gradient-text animate-pulse duration-1000">GoRIDE</h1>
        </div>
        <div className="flex items-center gap-3">
          {localStorage.getItem("userRole") === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="w-10 h-10 rounded-full bg-[#201f1f] flex items-center justify-center text-[#e6a7ff] hover:opacity-70 transition-opacity active:scale-95 duration-300"
              title="Admin Panel"
            >
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
            </button>
          )}
          <button onClick={() => navigate("/notifications-page")} className="relative w-10 h-10 rounded-full bg-[#201f1f] flex items-center justify-center text-[#ff7859] hover:opacity-70 transition-opacity active:scale-95 duration-300">
            <span className="material-symbols-outlined text-2xl">notifications</span>
            {unreadNotifications > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0e0e0e]"></span>
            )}
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-[#201f1f] flex items-center justify-center text-[#adaaaa] hover:text-white transition-colors active:scale-95 duration-300 border-2 border-[#ff8f75]/20 overflow-hidden"
            title="Profile"
          >
            <span className="material-symbols-outlined text-xl">person</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-6 space-y-8 pt-24">




        {/* Scheduled Rides — FROM DATABASE */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-headline font-bold text-xl text-white tracking-tight">Scheduled Rides</h2>
            <div className="flex items-center gap-3">
              <span className="text-[#ff8f75] text-sm font-semibold cursor-pointer ml-2" onClick={() => navigate("/campaign")}>View All</span>
            </div>
          </div>
          {scheduledRides.length === 0 ? (
            <div className="grid grid-cols-1 gap-4">
              <div className="glass-card rounded-[28px] p-5 flex flex-col justify-between min-h-[140px]">
                <div>
                  <div className="text-[#adaaaa]/40 text-[10px] font-bold uppercase tracking-widest mb-1">No Rides</div>
                  <h3 className="font-headline font-bold text-base leading-snug text-[#adaaaa]">No scheduled rides yet</h3>
                </div>
                <div className="text-[#adaaaa] text-xs font-medium">
                  <div className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">event_busy</span> Check back later</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 -mx-6 px-6" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {scheduledRides.map((ride, idx) => {
                // Helper: generate a 3-letter code from a string
                const toCode = (str) => {
                  if (!str) return "---";
                  const words = str.trim().split(/\s+/);
                  if (words.length >= 2) return (words[0][0] + words[1][0] + (words[1][1] || words[0][1] || "X")).toUpperCase();
                  return str.substring(0, 3).toUpperCase();
                };

                const rideName = ride.title || ride.rideName || "Sunrise Ride";
                const startCode = toCode(rideName);
                const endCode = ride.destination ? "JAI" : "DST";
                const startName = rideName;
                const endName = ride.destination ? "Jaipur" : "Destination";
                const participants = ride.waypoints?.length || 0;
                const maxP = ride.maxPassengers || 10;
                const progress = Math.min(Math.max((participants / maxP) * 100, 10), 100);

                const statusStr = ride.status || "Scheduled";
                const isOngoing = statusStr.toLowerCase() === "ongoing" || statusStr.toLowerCase() === "active";
                const isPaused = statusStr.toLowerCase() === "paused";

                const startTimeDate = ride.scheduledStartTime ? new Date(ride.scheduledStartTime) : new Date();
                const departureTime = startTimeDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                
                const etaDate = new Date(startTimeDate.getTime() + 2 * 60 * 60 * 1000);
                const etaTime = etaDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

                let timeLeftString = "0m";
                let timeColor = "text-[#ff8f75]";

                if (isOngoing) {
                  timeColor = "text-green-500";
                  const diffMs = etaDate.getTime() - currentTime.getTime();
                  if (diffMs > 0) {
                    const hrs = Math.floor(diffMs / (1000 * 60 * 60));
                    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    timeLeftString = hrs > 0 ? `${hrs}h ${mins}m to destination` : `${mins}m to destination`;
                  } else {
                    timeLeftString = "Arriving soon";
                  }
                } else if (isPaused) {
                  timeColor = "text-[#ffd60a]"; // transit-yellow
                  timeLeftString = "Ride Paused";
                } else {
                  const diffMs = startTimeDate.getTime() - currentTime.getTime();
                  if (diffMs > 0) {
                    const hrs = Math.floor(diffMs / (1000 * 60 * 60));
                    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    timeLeftString = hrs > 0 ? `Starts in ${hrs}h ${mins}m` : `Starts in ${mins}m`;
                  } else {
                    timeLeftString = "Starting soon";
                  }
                }

                const rideId = ride._id;

                return (
                  <article
                    key={rideId || idx}
                    aria-label={`Trip card from ${startName} to ${endName}`}
                    onClick={() => rideId && navigate(`/ride/${rideId}`)}
                    className="flex-shrink-0 w-[85vw] max-w-[400px] snap-center relative rounded-[2rem] overflow-hidden bg-[#0a0a0a] shadow-[0px_4px_24px_rgba(0,0,0,0.6)] border border-[#2a2a2a] cursor-pointer group p-6"
                  >
                    {/* Card Header */}
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-2 font-semibold text-white">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>pedal_bike</span>
                      </div>
                      <div className={`${timeColor} text-[13px] font-medium tracking-tight`}>
                        {timeLeftString}
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="flex justify-between items-start mb-5">
                      {/* Departure */}
                      <div className="flex flex-col">
                        <span className="text-[#8e8e93] text-[11px] uppercase tracking-wider mb-0.5">START</span>
                        <h2 className="text-4xl font-bold tracking-tight text-white">{startCode}</h2>
                        <span className="text-[#ff8f75] text-sm mt-1 font-medium">{departureTime}</span>
                      </div>

                      {/* Progress Indicator */}
                      <div className="flex-1 mx-4 mt-7 flex flex-col items-center">
                        <div className="w-full h-[6px] bg-[#2c2c2c] rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-brand rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="text-[#8e8e93] text-[10px] mt-2 tracking-wide uppercase">{statusStr}</span>
                      </div>

                      {/* Arrival */}
                      <div className="flex flex-col text-right">
                        <span className="text-[#8e8e93] text-[11px] uppercase tracking-wider mb-0.5">DESTINATION</span>
                        <h2 className="text-4xl font-bold tracking-tight text-white">{endCode}</h2>
                        <span className="text-[#ff8f75] text-sm mt-1 font-medium">{etaTime}</span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="flex justify-between items-end">
                      {/* Passengers Badge */}
                      <div className="bg-[#ff8f75]/10 text-[#ff8f75] px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-[#ff8f75]/20">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                        <span className="text-sm font-semibold">{participants}</span>
                      </div>
                      {/* Join Button */}
                      <button
                        type="button"
                        aria-label="Join now"
                        onClick={(e) => { e.stopPropagation(); rideId && navigate(`/ride/${rideId}`); }}
                        className="h-[36px] px-5 flex items-center justify-center rounded-full bg-gradient-brand text-black font-bold text-[13px] tracking-wide uppercase active:scale-95 transition-transform glow-shadow"
                      >
                        JOIN NOW
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Nearby Campaigns — FROM DATABASE, HORIZONTALLY SCROLLABLE */}
        <section>
          <h2 className="font-headline font-bold text-xl mb-4 text-white tracking-tight">Nearby Campaigns</h2>
          {nearbyCampaigns.length === 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-[#1a1919] rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#484847]/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#adaaaa]">location_off</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">No campaigns nearby</h4>
                    <p className="text-xs text-[#adaaaa]">Check back later or enable location</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto -mx-6 px-6 pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {nearbyCampaigns.map((campaign, index) => {
                const color = campaignColors[index % campaignColors.length];
                return (
                  <div
                    key={campaign._id}
                    className="flex-shrink-0 min-w-[280px] flex items-center justify-between p-4 glass-card rounded-2xl group hover:bg-[#2c2c2c] transition-all snap-start cursor-pointer active:scale-[0.98] hover-glow-shadow relative overflow-hidden"
                    onClick={() => navigate(`/ride/${campaign._id}`)}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-brand opacity-80 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-12 h-12 rounded-xl ${color.bg} flex items-center justify-center`}>
                        <span className={`material-symbols-outlined ${color.text}`} style={{ fontVariationSettings: "'FILL' 1" }}>thumb_up</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{campaign.title || campaign.rideName}</h4>
                        <p className="text-xs text-[#adaaaa]">
                          {campaign.waypoints?.length || 0} participants
                        </p>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-[#ff8f75] hover:bg-gradient-brand hover:text-black hover:glow-shadow transition-all flex-shrink-0 z-10 hover:scale-110 active:scale-95">
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Partner Offers */}
        <section className="pb-8">
          <h2 className="font-headline font-bold text-xl mb-4 text-white tracking-tight">Partner Offers</h2>
          <div className="flex gap-4 overflow-x-auto -mx-6 px-6" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {/* Offer 1 */}
            <div className="min-w-[280px] glass-card rounded-[28px] overflow-hidden group hover-glow-shadow transition-all relative">
              <div className="h-32 bg-[#262626] relative overflow-hidden">
                <img className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" alt="coffee shop" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV5RDOEtOdWumcxWVgnbLXg7jcSMSTgiUdH3U1uU0jaGQYmIUujcTguewKtGscl7iWFX9bIjp9kezvH5v45SX5a-Gk3PfJQlAdZvyW3qdtUv1WtXCgJ-ACXAw76ivhUV8bSA14thr3uxFE31h90CCr0zBqxzVW_EBTkEu4bb--sZjAD1CrmaE1Rz7t8O0CJT_ksmxZGhm1BpUxkTEUARKp8pfFpWk9ytf47_LTTYgn7KRewYSEEQQSBSxG6IodqGlgmNRpzn0ydnc" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-4 bg-gradient-brand px-3 py-1 rounded-full text-[10px] font-bold text-black tracking-tighter uppercase shadow-lg">Cafe Partner</div>
              </div>
              <div className="p-5 relative z-10">
                <h4 className="font-headline font-bold text-lg leading-tight mb-2 group-hover:gradient-text transition-all">Daily Grind Cafe</h4>
                <p className="text-[#adaaaa] text-sm mb-4 line-clamp-2">10% off your post-ride brew this week</p>
                <button className="w-full py-2.5 glass-card text-white font-extrabold text-xs rounded-full tracking-widest hover:bg-gradient-brand hover:text-black transition-all hover-glow-shadow border border-white/10">REDEEM</button>
              </div>
            </div>
            {/* Offer 2 */}
            <div className="min-w-[280px] glass-card rounded-[28px] overflow-hidden group hover-glow-shadow transition-all relative">
              <div className="h-32 bg-[#262626] relative overflow-hidden">
                <img className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" alt="gym" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAqEH_yZ_mMnjeRmLmoE_9D2SwZ5wCYjz49IHHqg5PoKjv-il4kPRNMCH4UNyulqYzHi19ZbNV_RCK-3fiHXz3oYFt4Q0uyvMHazEwyQlNq2tYwIRBsgWnhMdXniN94kqb_N1lOgv1X0h5lFQ6ECiJ3dxJdbmnTxqFXByqN3OSRqBWL1KDPPwrwyoZ24RFM6cQWaoUoKWX00dAY8NvT8Lk-6g3g3wz5X7QOIdFSMzdYFkMw2aLLM7m3nf1o0VXqdqOKdDt0qAVEsc" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-4 bg-gradient-brand px-3 py-1 rounded-full text-[10px] font-bold text-black tracking-tighter uppercase shadow-lg">Gym Partner</div>
              </div>
              <div className="p-5 relative z-10">
                <h4 className="font-headline font-bold text-lg leading-tight mb-2 group-hover:gradient-text transition-all">Iron Peak Gym</h4>
                <p className="text-[#adaaaa] text-sm mb-4 line-clamp-2">Free recovery session for club members</p>
                <button className="w-full py-2.5 glass-card text-white font-extrabold text-xs rounded-full tracking-widest hover:bg-gradient-brand hover:text-black transition-all hover-glow-shadow border border-white/10">REDEEM</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <BottomNav active="home" />
    </div>
  );
}