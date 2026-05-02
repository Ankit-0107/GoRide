// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [scheduledRides, setScheduledRides] = useState([]);
  const [nearbyCampaigns, setNearbyCampaigns] = useState([]);
  const [recommendedOpen, setRecommendedOpen] = useState(true);
  const [scheduledPage, setScheduledPage] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const RIDES_PER_PAGE = 4;

  useEffect(() => {
    // Fetch user profile (skip for guest users)
    const isGuest = localStorage.getItem("guestUser");
    if (isGuest) {
      setUserName("User");
    } else {
      api.get("/auth/me")
        .then((res) => setUserName(res.data.name || res.data.user?.name || "User"))
        .catch(() => setUserName("User"));

      // Fetch unread notification count
      api.get("/notifications/unread-count")
        .then((res) => setUnreadNotifs(res.data.count || 0))
        .catch(() => {});
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
    <div className="bg-black text-white font-body min-h-screen pb-32" style={{ minHeight: "max(884px, 100dvh)" }}>
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl border-none bg-[#0e0e0e]/80 flex justify-between items-center px-6 h-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#ff8f75]/20">
            <img
              alt="User Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6juMNLnGTDWs1-39RToOMNGMM1j0zHcNfQz0I1kKwCt5aTZxlGOw5txlsTpyHqIDzHhBGwKWXLtvySRlOY5XczL1ZS56YTQZcx2iswMMhxB6QCeu4GJMJAncX2oKyCcKJV7mf6pjg6YCX1yhSHuksAB27oL-JEHURIbEWulR0iElAAAJDvFMviI3Uxdy_3O0rd8izj66EGFNvKnqnm3yFwYeooH2D95tMgk8cRiJYzKt-fhuFi1CGvgKAPqcBsOSak0fjbo1G3m4"
            />
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-2xl tracking-tight text-[#ff8f75]">
            Hi, {userName}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {localStorage.getItem("userRole") === "admin" && (
            <button 
              onClick={() => navigate("/admin")}
              className="w-10 h-10 rounded-full bg-[#201f1f] flex items-center justify-center text-[#e6a7ff] hover:opacity-70 transition-opacity active:scale-95 duration-300"
              title="Admin Panel"
            >
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
            </button>
          )}
          <button 
            onClick={() => navigate("/notifications-page")}
            className="w-10 h-10 rounded-full bg-[#201f1f] flex items-center justify-center text-[#ff7859] hover:opacity-70 transition-opacity active:scale-95 duration-300 relative"
          >
            <span className="material-symbols-outlined text-2xl">notifications</span>
            {unreadNotifs > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#ff6e84] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadNotifs > 99 ? '99+' : unreadNotifs}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 space-y-8 pt-24">
        {/* Category Filter */}
        <section className="flex gap-3 overflow-x-auto -mx-6 px-6" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <button className="px-6 py-2 rounded-full bg-gradient-to-br from-[#ff8f75] to-[#ff7859] text-black font-semibold text-sm whitespace-nowrap">All</button>
          <button className="px-6 py-2 rounded-full bg-[#262626] text-[#adaaaa] font-medium text-sm whitespace-nowrap transition-all hover:bg-[#2c2c2c]">Nearby</button>
          <button className="px-6 py-2 rounded-full bg-[#262626] text-[#adaaaa] font-medium text-sm whitespace-nowrap transition-all hover:bg-[#2c2c2c]">Trending</button>
          <button className="px-6 py-2 rounded-full bg-[#262626] text-[#adaaaa] font-medium text-sm whitespace-nowrap transition-all hover:bg-[#2c2c2c]">Local</button>
        </section>

        {/* Recommended For You: Bento Style — DROPDOWN */}
        <section>
          <button
            className="w-full flex items-center justify-between mb-4"
            onClick={() => setRecommendedOpen(!recommendedOpen)}
          >
            <h2 className="font-headline font-bold text-xl text-white tracking-tight">Recommended For You</h2>
            <span
              className={`material-symbols-outlined text-[#adaaaa] transition-transform duration-300 ${recommendedOpen ? "rotate-180" : ""}`}
            >
              expand_more
            </span>
          </button>

          <div className={`overflow-hidden transition-all duration-400 ease-in-out ${recommendedOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="bg-[#201f1f] rounded-[28px] overflow-hidden flex min-h-[180px] group transition-transform hover:scale-[1.01]">
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-headline font-extrabold text-2xl leading-tight mb-2">Sunrise Ride</h3>
                  <div className="flex items-center gap-4 text-[#adaaaa] text-sm font-medium">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">route</span> 12.4km</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">timer</span> 45 min</span>
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border border-[#201f1f] bg-[#262626] overflow-hidden">
                      <img className="w-full h-full object-cover" alt="cyclist" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCL5RRiEaHz8Yy_l0exXpebEINIJNpgEoXSw3TeiGHKimwTOC9CX33UKcMN6vgB0rVGG0_jy-tgmkOf_gMFHodXInvTHJpL_pBX40W8K0XUV-xB05Ufkf6vFfEnWIQ_81dCXoOhhRlmOO8x1CynZTRP30UY4KEyQQmjL2ds0-Z8gQpTwlyW64Dy3dCXrwIcx78RMSVKxYTLw5BuBrIuKeqF34wOQKrD9J4PmWrfrGoEgNFNhJT2oz0wpFLLWPNI4ovOBOvvGTi2GGE" />
                    </div>
                    <div className="w-6 h-6 rounded-full border border-[#201f1f] bg-[#262626] overflow-hidden">
                      <img className="w-full h-full object-cover" alt="cyclist" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzbrIc5HxZDBrX2KqVN5N_oKjnVYIwKuWDlBHUSmZlBvbs5vLWow30Df00U2AmXqCmfpKzbpWVJJ_396I2EorCN4IZHQxGdl-RFe-kgx-hKdQSgfCFP88RMle_4gyf27iF60zOEHDMefdjoEXsRPIpYDLDdgEu7x6Dg4XOl2nOkHnqLmWbF0UpUVldFGxFP9LlIEY0bqzvgmPzUe4gKrXDG76LFl64GZVvP7KdHaSuXijEJlX0sdIbjV_5_-GHAaz6O_GwGwwCveo" />
                    </div>
                    <div className="w-6 h-6 rounded-full border border-[#201f1f] bg-[#262626] flex items-center justify-center text-[8px] font-bold">+12</div>
                  </div>
                  <button className="ml-auto bg-[#ff8f75] hover:bg-[#ff7859] text-black font-extrabold text-xs px-5 py-2.5 rounded-full transition-all active:scale-95">Join Ride</button>
                </div>
              </div>
              <div className="w-1/3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#201f1f] to-transparent z-10"></div>
                <img className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" alt="sunrise ride" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjlRlUqKSmr2_HehsOA3gg-ShRFJCtb7m_K8m_cCYZRAr3Tkvs4ghgNKEc9fy_BudDFK4N-Zy5HcXGTfGr4WG_T2VHZI8bnG3TBi6GhItx-jGaBLlcEHIQ578-T6AztvVXS2yJmMYHURDHyqcBvtlvw4ttJf4IMMrFyDkQLEIWKKFK54KvTUQz0mBrvGAY52KQkYyFmSUCRmsu-Jz7FpnTJXAlZSWiFJXe4tXz5irODV3JnBH54fjV4WowjkZ66HriNojOspHdji4" />
              </div>
            </div>
          </div>
        </section>

        {/* Scheduled Rides — FROM DATABASE */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-headline font-bold text-xl text-white tracking-tight">Scheduled Rides</h2>
            <div className="flex items-center gap-3">
              {scheduledPage > 0 && (
                <button 
                  className="w-8 h-8 rounded-full bg-[#1a1919] flex items-center justify-center hover:bg-[#252424] transition-colors border border-[#484847]/20"
                  onClick={() => setScheduledPage(p => p - 1)}
                >
                  <span className="material-symbols-outlined text-[#adaaaa] text-sm ml-1">arrow_back_ios</span>
                </button>
              )}
              {(scheduledPage + 1) * RIDES_PER_PAGE < scheduledRides.length && (
                <button 
                  className="w-8 h-8 rounded-full bg-[#1a1919] flex items-center justify-center hover:bg-[#252424] transition-colors border border-[#484847]/20"
                  onClick={() => setScheduledPage(p => p + 1)}
                >
                  <span className="material-symbols-outlined text-[#adaaaa] text-sm">arrow_forward_ios</span>
                </button>
              )}
              <span className="text-[#ff8f75] text-sm font-semibold cursor-pointer ml-2" onClick={() => navigate("/active")}>View All</span>
            </div>
          </div>
          {scheduledRides.length === 0 ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1a1919] rounded-[28px] p-5 flex flex-col justify-between min-h-[140px] border border-[#484847]/10">
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
            <div className="grid grid-cols-2 gap-4">
              {scheduledRides.slice(scheduledPage * RIDES_PER_PAGE, (scheduledPage + 1) * RIDES_PER_PAGE).map((ride, idx) => {
                const globalIndex = scheduledPage * RIDES_PER_PAGE + idx;
                const { date, time } = formatDate(ride.scheduledStartTime);
                return (
                  <div
                    key={ride._id}
                    className="bg-[#1a1919] rounded-[28px] p-5 flex flex-col justify-between min-h-[140px] border border-[#484847]/10 cursor-pointer hover:bg-[#201f1f] transition-colors active:scale-[0.98]"
                    onClick={() => navigate(`/ride/${ride._id}`)}
                  >
                    <div>
                      <div className={`${globalIndex === 0 ? "text-[#f5777c]" : "text-[#adaaaa]/40"} text-[10px] font-bold uppercase tracking-widest mb-1 truncate`}>
                        {ride.status === "scheduled" ? (globalIndex === 0 ? "Upcoming" : "Scheduled") : ride.status}
                      </div>
                      <h3 className="font-headline font-bold text-base leading-snug line-clamp-2">{ride.title || ride.rideName}</h3>
                    </div>
                    <div className="text-[#adaaaa] text-xs space-y-0.5 font-medium mt-2">
                      <div className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">calendar_today</span> {date}</div>
                      <div className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">schedule</span> {time}</div>
                    </div>
                  </div>
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
                    className="flex-shrink-0 min-w-[280px] flex items-center justify-between p-4 bg-[#1a1919] rounded-2xl group hover:bg-[#2c2c2c] transition-colors snap-start cursor-pointer active:scale-[0.98]"
                    onClick={() => navigate(`/ride/${campaign._id}`)}
                  >
                    <div className="flex items-center gap-4">
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
                    <button className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-[#ff8f75] hover:bg-[#ff8f75] hover:text-black transition-all flex-shrink-0">
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
            <div className="min-w-[280px] bg-[#1a1919] rounded-[28px] overflow-hidden border border-[#484847]/10">
              <div className="h-32 bg-[#262626] relative">
                <img className="w-full h-full object-cover opacity-60" alt="coffee shop" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV5RDOEtOdWumcxWVgnbLXg7jcSMSTgiUdH3U1uU0jaGQYmIUujcTguewKtGscl7iWFX9bIjp9kezvH5v45SX5a-Gk3PfJQlAdZvyW3qdtUv1WtXCgJ-ACXAw76ivhUV8bSA14thr3uxFE31h90CCr0zBqxzVW_EBTkEu4bb--sZjAD1CrmaE1Rz7t8O0CJT_ksmxZGhm1BpUxkTEUARKp8pfFpWk9ytf47_LTTYgn7KRewYSEEQQSBSxG6IodqGlgmNRpzn0ydnc" />
                <div className="absolute bottom-3 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#ff8f75] tracking-tighter uppercase">Cafe Partner</div>
              </div>
              <div className="p-5">
                <h4 className="font-headline font-bold text-lg leading-tight mb-2">Daily Grind Cafe</h4>
                <p className="text-[#adaaaa] text-sm mb-4 line-clamp-2">10% off your post-ride brew this week</p>
                <button className="w-full py-2.5 bg-[#262626] text-[#ff8f75] font-extrabold text-xs rounded-full tracking-widest hover:bg-[#ff8f75] hover:text-black transition-all">REDEEM</button>
              </div>
            </div>
            {/* Offer 2 */}
            <div className="min-w-[280px] bg-[#1a1919] rounded-[28px] overflow-hidden border border-[#484847]/10">
              <div className="h-32 bg-[#262626] relative">
                <img className="w-full h-full object-cover opacity-60" alt="gym" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAqEH_yZ_mMnjeRmLmoE_9D2SwZ5wCYjz49IHHqg5PoKjv-il4kPRNMCH4UNyulqYzHi19ZbNV_RCK-3fiHXz3oYFt4Q0uyvMHazEwyQlNq2tYwIRBsgWnhMdXniN94kqb_N1lOgv1X0h5lFQ6ECiJ3dxJdbmnTxqFXByqN3OSRqBWL1KDPPwrwyoZ24RFM6cQWaoUoKWX00dAY8NvT8Lk-6g3g3wz5X7QOIdFSMzdYFkMw2aLLM7m3nf1o0VXqdqOKdDt0qAVEsc" />
                <div className="absolute bottom-3 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#ff8f75] tracking-tighter uppercase">Gym Partner</div>
              </div>
              <div className="p-5">
                <h4 className="font-headline font-bold text-lg leading-tight mb-2">Iron Peak Gym</h4>
                <p className="text-[#adaaaa] text-sm mb-4 line-clamp-2">Free recovery session for club members</p>
                <button className="w-full py-2.5 bg-[#262626] text-[#ff8f75] font-extrabold text-xs rounded-full tracking-widest hover:bg-[#ff8f75] hover:text-black transition-all">REDEEM</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-[#2c2c2c]/60 backdrop-blur-xl rounded-t-[3rem] z-50 shadow-[0px_-24px_48px_rgba(255,143,117,0.08)]">
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#ff8f75] to-[#ff7859] text-black rounded-full px-5 py-2 active:scale-90 duration-150">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
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