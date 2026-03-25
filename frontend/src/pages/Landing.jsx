// src/pages/Landing.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface-container-lowest min-h-screen pb-32" style={{ minHeight: "max(884px, 100dvh)" }}>
      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-40 no-border bg-[#0e0e0e] flex justify-between items-center px-6 py-4 max-w-xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-outline-variant/20 cursor-pointer" onClick={() => navigate("/profile")}>
            <img
              alt="User Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6juMNLnGTDWs1-39RToOMNGMM1j0zHcNfQz0I1kKwCt5aTZxlGOw5txlsTpyHqIDzHhBGwKWXLtvySRlOY5XczL1ZS56YTQZcx2iswMMhxB6QCeu4GJMJAncX2oKyCcKJV7mf6pjg6YCX1yhSHuksAB27oL-JEHURIbEWulR0iElAAAJDvFMviI3Uxdy_3O0rd8izj66EGFNvKnqnm3yFwYeooH2D95tMgk8cRiJYzKt-fhuFi1CGvgKAPqcBsOSak0fjbo1G3m4"
            />
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-2xl tracking-tight text-[#ff8f75]">
            Hi, Devashish
          </h1>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-[#1a1919] transition-colors active:scale-95 duration-200">
          <span className="material-symbols-outlined text-[#adaaaa]">notifications</span>
        </button>
      </header>

      <main className="max-w-xl mx-auto px-6 space-y-8">
        {/* Category Filter */}
        <section className="flex gap-3 overflow-x-auto hide-scrollbar -mx-6 px-6">
          <button className="px-6 py-2 rounded-full bg-gradient-to-br from-[#ff8f75] to-[#ff7859] text-black font-semibold text-sm whitespace-nowrap">
            All
          </button>
          <button className="px-6 py-2 rounded-full bg-surface-container-highest text-on-surface-variant font-medium text-sm whitespace-nowrap transition-all hover:bg-surface-bright">
            Nearby
          </button>
          <button className="px-6 py-2 rounded-full bg-surface-container-highest text-on-surface-variant font-medium text-sm whitespace-nowrap transition-all hover:bg-surface-bright">
            Trending
          </button>
          <button className="px-6 py-2 rounded-full bg-surface-container-highest text-on-surface-variant font-medium text-sm whitespace-nowrap transition-all hover:bg-surface-bright">
            Local
          </button>
        </section>

        {/* Recommended For You: Bento Style */}
        <section>
          <h2 className="font-headline font-bold text-xl mb-4 text-on-surface tracking-tight">
            Recommended For You
          </h2>
          <div className="bg-surface-container-high rounded-[28px] overflow-hidden flex min-h-[180px] group transition-transform hover:scale-[1.01]">
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-headline font-extrabold text-2xl leading-tight mb-2">Sunrise Ride</h3>
                <div className="flex items-center gap-4 text-on-surface-variant text-sm font-medium">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">route</span> 12.4km
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">timer</span> 45 min
                  </span>
                </div>
              </div>
              <div className="flex items-center mt-4">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full border border-surface-container-high bg-surface-variant overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      alt="cyclist"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCL5RRiEaHz8Yy_l0exXpebEINIJNpgEoXSw3TeiGHKimwTOC9CX33UKcMN6vgB0rVGG0_jy-tgmkOf_gMFHodXInvTHJpL_pBX40W8K0XUV-xB05Ufkf6vFfEnWIQ_81dCXoOhhRlmOO8x1CynZTRP30UY4KEyQQmjL2ds0-Z8gQpTwlyW64Dy3dCXrwIcx78RMSVKxYTLw5BuBrIuKeqF34wOQKrD9J4PmWrfrGoEgNFNhJT2oz0wpFLLWPNI4ovOBOvvGTi2GGE"
                    />
                  </div>
                  <div className="w-6 h-6 rounded-full border border-surface-container-high bg-surface-variant overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      alt="cyclist with helmet"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzbrIc5HxZDBrX2KqVN5N_oKjnVYIwKuWDlBHUSmZlBvbs5vLWow30Df00U2AmXqCmfpKzbpWVJJ_396I2EorCN4IZHQxGdl-RFe-kgx-hKdQSgfCFP88RMle_4gyf27iF60zOEHDMefdjoEXsRPIpYDLDdgEu7x6Dg4XOl2nOkHnqLmWbF0UpUVldFGxFP9LlIEY0bqzvgmPzUe4gKrXDG76LFl64GZVvP7KdHaSuXijEJlX0sdIbjV_5_-GHAaz6O_GwGwwCveo"
                    />
                  </div>
                  <div className="w-6 h-6 rounded-full border border-surface-container-high bg-surface-container-highest flex items-center justify-center text-[8px] font-bold">
                    +12
                  </div>
                </div>
                <button className="ml-auto bg-[#ff8f75] hover:bg-[#ff7859] text-black font-extrabold text-xs px-5 py-2.5 rounded-full transition-all active:scale-95">
                  Join Ride
                </button>
              </div>
            </div>
            <div className="w-1/3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-surface-container-high to-transparent z-10"></div>
              <img
                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                alt="cyclist riding into sunrise"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjlRlUqKSmr2_HehsOA3gg-ShRFJCtb7m_K8m_cCYZRAr3Tkvs4ghgNKEc9fy_BudDFK4N-Zy5HcXGTfGr4WG_T2VHZI8bnG3TBi6GhItx-jGaBLlcEHIQ578-T6AztvVXS2yJmMYHURDHyqcBvtlvw4ttJf4IMMrFyDkQLEIWKKFK54KvTUQz0mBrvGAY52KQkYyFmSUCRmsu-Jz7FpnTJXAlZSWiFJXe4tXz5irODV3JnBH54fjV4WowjkZ66HriNojOspHdji4"
              />
            </div>
          </div>
        </section>

        {/* Scheduled Rides */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-headline font-bold text-xl text-on-surface tracking-tight">Scheduled Rides</h2>
            <span className="text-primary text-sm font-semibold">View All</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Card 1 */}
            <div className="bg-surface-container rounded-[28px] p-5 flex flex-col justify-between min-h-[140px] border border-outline-variant/10">
              <div>
                <div className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">Upcoming</div>
                <h3 className="font-headline font-bold text-base leading-snug">Morning Breeze</h3>
              </div>
              <div className="text-on-surface-variant text-xs space-y-0.5 font-medium">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">calendar_today</span> 24 Oct
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">schedule</span> 06:30 AM
                </div>
              </div>
            </div>
            {/* Card 2 */}
            <div className="bg-surface-container rounded-[28px] p-5 flex flex-col justify-between min-h-[140px] border border-outline-variant/10">
              <div>
                <div className="text-on-surface-variant/40 text-[10px] font-bold uppercase tracking-widest mb-1">
                  Scheduled
                </div>
                <h3 className="font-headline font-bold text-base leading-snug">City Explorer</h3>
              </div>
              <div className="text-on-surface-variant text-xs space-y-0.5 font-medium">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">calendar_today</span> 26 Oct
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">schedule</span> 05:45 PM
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nearby Campaigns */}
        <section>
          <h2 className="font-headline font-bold text-xl mb-4 text-on-surface tracking-tight">Nearby Campaigns</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl group hover:bg-surface-bright transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    thumb_up
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Green City Dash</h4>
                  <p className="text-xs text-on-surface-variant">2.3 km away • 40 participants</p>
                </div>
              </div>
              <button className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl group hover:bg-surface-bright transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-secondary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    thumb_up
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Sprint Sundays</h4>
                  <p className="text-xs text-on-surface-variant">1.1 km away • 12 participants</p>
                </div>
              </div>
              <button className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>
        </section>

        {/* Partner Offers */}
        <section className="pb-8">
          <h2 className="font-headline font-bold text-xl mb-4 text-on-surface tracking-tight">Partner Offers</h2>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-6 px-6">
            {/* Offer 1 */}
            <div className="min-w-[280px] bg-surface-container rounded-[28px] overflow-hidden border border-outline-variant/10">
              <div className="h-32 bg-surface-variant relative">
                <img
                  className="w-full h-full object-cover opacity-60"
                  alt="cafe interior"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV5RDOEtOdWumcxWVgnbLXg7jcSMSTgiUdH3U1uU0jaGQYmIUujcTguewKtGscl7iWFX9bIjp9kezvH5v45SX5a-Gk3PfJQlAdZvyW3qdtUv1WtXCgJ-ACXAw76ivhUV8bSA14thr3uxFE31h90CCr0zBqxzVW_EBTkEu4bb--sZjAD1CrmaE1Rz7t8O0CJT_ksmxZGhm1BpUxkTEUARKp8pfFpWk9ytf47_LTTYgn7KRewYSEEQQSBSxG6IodqGlgmNRpzn0ydnc"
                />
                <div className="absolute bottom-3 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-primary tracking-tighter uppercase">
                  Cafe Partner
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-headline font-bold text-lg leading-tight mb-2">Daily Grind Cafe</h4>
                <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">
                  10% off your post-ride brew this week
                </p>
                <button className="w-full py-2.5 bg-surface-container-highest text-primary font-extrabold text-xs rounded-full tracking-widest hover:bg-primary hover:text-black transition-all">
                  REDEEM
                </button>
              </div>
            </div>
            {/* Offer 2 */}
            <div className="min-w-[280px] bg-surface-container rounded-[28px] overflow-hidden border border-outline-variant/10">
              <div className="h-32 bg-surface-variant relative">
                <img
                  className="w-full h-full object-cover opacity-60"
                  alt="gym interior"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAqEH_yZ_mMnjeRmLmoE_9D2SwZ5wCYjz49IHHqg5PoKjv-il4kPRNMCH4UNyulqYzHi19ZbNV_RCK-3fiHXz3oYFt4Q0uyvMHazEwyQlNq2tYwIRBsgWnhMdXniN94kqb_N1lOgv1X0h5lFQ6ECiJ3dxJdbmnTxqFXByqN3OSRqBWL1KDPPwrwyoZ24RFM6cQWaoUoKWX00dAY8NvT8Lk-6g3g3wz5X7QOIdFSMzdYFkMw2aLLM7m3nf1o0VXqdqOKdDt0qAVEsc"
                />
                <div className="absolute bottom-3 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-primary tracking-tighter uppercase">
                  Gym Partner
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-headline font-bold text-lg leading-tight mb-2">Iron Peak Gym</h4>
                <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">
                  Free recovery session for club members
                </p>
                <button className="w-full py-2.5 bg-surface-container-highest text-primary font-extrabold text-xs rounded-full tracking-widest hover:bg-primary hover:text-black transition-all">
                  REDEEM
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-[#2c2c2c]/60 backdrop-blur-xl rounded-t-[3rem] z-50 shadow-[0px_-24px_48px_rgba(255,143,117,0.08)]">
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#ff8f75] to-[#ff7859] text-black rounded-full px-5 py-2 active:scale-90 duration-150">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            home
          </span>
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
