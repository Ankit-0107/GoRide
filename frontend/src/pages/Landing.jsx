// src/pages/Landing.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0e0e0e] text-white min-h-screen pb-32 overflow-x-hidden" style={{ minHeight: "max(884px, 100dvh)", animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-40 bg-[#0e0e0e]/80 backdrop-blur-xl flex justify-end items-center px-6 py-4 max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/notifications-page")} className="w-10 h-10 flex items-center justify-center rounded-full glass-card hover:bg-[#ff8f75]/20 hover:text-[#ff8f75] transition-all active:scale-95 duration-200 border border-white/10 text-white">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-[#adaaaa] hover:text-white transition-all active:scale-95 duration-200 border-2 border-[#ff8f75]/20 overflow-hidden"
            title="Profile"
          >
            <span className="material-symbols-outlined text-xl">person</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-6 space-y-8 relative z-10">
        {/* Floating Orbs Background */}
        <div className="fixed top-1/4 -right-1/4 w-96 h-96 bg-[#ff8f75]/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-float"></div>
        <div className="fixed bottom-1/4 -left-1/4 w-96 h-96 bg-[#e6a7ff]/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-float" style={{ animationDelay: '2s' }}></div>

        {/* Category Filter */}
        <section className="flex gap-3 overflow-x-auto hide-scrollbar -mx-6 px-6">
          <button className="px-6 py-2 rounded-full bg-gradient-brand text-black font-bold text-sm whitespace-nowrap glow-shadow">
            All
          </button>
          <button className="px-6 py-2 rounded-full glass-card border border-white/5 text-[#adaaaa] font-medium text-sm whitespace-nowrap transition-all hover:bg-[#2c2c2c]/60 hover:text-white">
            Nearby
          </button>
          <button className="px-6 py-2 rounded-full glass-card border border-white/5 text-[#adaaaa] font-medium text-sm whitespace-nowrap transition-all hover:bg-[#2c2c2c]/60 hover:text-white">
            Trending
          </button>
          <button className="px-6 py-2 rounded-full glass-card border border-white/5 text-[#adaaaa] font-medium text-sm whitespace-nowrap transition-all hover:bg-[#2c2c2c]/60 hover:text-white">
            Local
          </button>
        </section>

        {/* Recommended For You: Bento Style */}
        <section>
          <h2 className="font-headline font-black text-xl mb-4 text-white tracking-tight uppercase">
            Recommended For You
          </h2>
          <div className="glass-card border border-white/10 rounded-[28px] overflow-hidden flex min-h-[180px] group transition-all duration-500 hover-glow-shadow">
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-headline font-extrabold text-2xl leading-tight mb-2 group-hover:text-[#ff8f75] transition-colors">Sunrise Ride</h3>
                <div className="flex items-center gap-4 text-[#adaaaa] text-sm font-medium">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-[#ff8f75]">route</span> 12.4km
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-[#ff8f75]">timer</span> 45 min
                  </span>
                </div>
              </div>
              <div className="flex items-center mt-4">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full border border-[#1a1919] overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      alt="cyclist"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCL5RRiEaHz8Yy_l0exXpebEINIJNpgEoXSw3TeiGHKimwTOC9CX33UKcMN6vgB0rVGG0_jy-tgmkOf_gMFHodXInvTHJpL_pBX40W8K0XUV-xB05Ufkf6vFfEnWIQ_81dCXoOhhRlmOO8x1CynZTRP30UY4KEyQQmjL2ds0-Z8gQpTwlyW64Dy3dCXrwIcx78RMSVKxYTLw5BuBrIuKeqF34wOQKrD9J4PmWrfrGoEgNFNhJT2oz0wpFLLWPNI4ovOBOvvGTi2GGE"
                    />
                  </div>
                  <div className="w-6 h-6 rounded-full border border-[#1a1919] overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      alt="cyclist with helmet"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzbrIc5HxZDBrX2KqVN5N_oKjnVYIwKuWDlBHUSmZlBvbs5vLWow30Df00U2AmXqCmfpKzbpWVJJ_396I2EorCN4IZHQxGdl-RFe-kgx-hKdQSgfCFP88RMle_4gyf27iF60zOEHDMefdjoEXsRPIpYDLDdgEu7x6Dg4XOl2nOkHnqLmWbF0UpUVldFGxFP9LlIEY0bqzvgmPzUe4gKrXDG76LFl64GZVvP7KdHaSuXijEJlX0sdIbjV_5_-GHAaz6O_GwGwwCveo"
                    />
                  </div>
                  <div className="w-6 h-6 rounded-full border border-[#1a1919] bg-[#2c2c2c] text-[#adaaaa] flex items-center justify-center text-[8px] font-bold">
                    +12
                  </div>
                </div>
                <button className="ml-auto bg-gradient-brand hover:brightness-110 text-black font-black text-xs px-5 py-2.5 rounded-full transition-all active:scale-95 glow-shadow uppercase tracking-widest">
                  Join Ride
                </button>
              </div>
            </div>
            <div className="w-1/3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a1919] to-transparent z-10"></div>
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
            <h2 className="font-headline font-black text-xl text-white tracking-tight uppercase">Scheduled Rides</h2>
            <span className="text-[#ff8f75] text-sm font-bold hover:brightness-110 transition-colors cursor-pointer">View All</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="glass-card border border-white/10 rounded-[28px] p-5 flex flex-col justify-between min-h-[140px] hover-glow-shadow transition-all group cursor-pointer">
              <div>
                <div className="text-[#e6a7ff] text-[10px] font-bold uppercase tracking-widest mb-1">Upcoming</div>
                <h3 className="font-headline font-bold text-base leading-snug group-hover:text-[#ff8f75] transition-colors">Morning Breeze</h3>
              </div>
              <div className="text-[#adaaaa] text-xs space-y-0.5 font-medium">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">calendar_today</span> 24 Oct
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">schedule</span> 06:30 AM
                </div>
              </div>
            </div>
            {/* Card 2 */}
            <div className="glass-card border border-white/10 rounded-[28px] p-5 flex flex-col justify-between min-h-[140px] hover-glow-shadow transition-all group cursor-pointer">
              <div>
                <div className="text-[#767575] text-[10px] font-bold uppercase tracking-widest mb-1">
                  Scheduled
                </div>
                <h3 className="font-headline font-bold text-base leading-snug group-hover:text-[#ff8f75] transition-colors">City Explorer</h3>
              </div>
              <div className="text-[#adaaaa] text-xs space-y-0.5 font-medium">
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
          <h2 className="font-headline font-black text-xl mb-4 text-white tracking-tight uppercase">Nearby Campaigns</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 glass-card border border-white/5 rounded-2xl group hover:bg-[#2c2c2c]/40 hover-glow-shadow transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#ff8f75]/10 flex items-center justify-center group-hover:bg-[#ff8f75]/20 transition-colors">
                  <span
                    className="material-symbols-outlined text-[#ff8f75]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    thumb_up
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-[#ff8f75] transition-colors">Green City Dash</h4>
                  <p className="text-xs text-[#adaaaa]">2.3 km away • 40 participants</p>
                </div>
              </div>
              <button className="w-8 h-8 rounded-full border border-white/10 bg-[#2c2c2c]/60 flex items-center justify-center text-[#ff8f75] hover:bg-gradient-brand hover:text-black hover:border-transparent transition-all">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <div className="flex items-center justify-between p-4 glass-card border border-white/5 rounded-2xl group hover:bg-[#2c2c2c]/40 hover-glow-shadow transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#e6a7ff]/10 flex items-center justify-center group-hover:bg-[#e6a7ff]/20 transition-colors">
                  <span
                    className="material-symbols-outlined text-[#e6a7ff]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    thumb_up
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-[#ff8f75] transition-colors">Sprint Sundays</h4>
                  <p className="text-xs text-[#adaaaa]">1.1 km away • 12 participants</p>
                </div>
              </div>
              <button className="w-8 h-8 rounded-full border border-white/10 bg-[#2c2c2c]/60 flex items-center justify-center text-[#ff8f75] hover:bg-gradient-brand hover:text-black hover:border-transparent transition-all">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>
        </section>

        {/* Partner Offers */}
        <section className="pb-8">
          <h2 className="font-headline font-black text-xl mb-4 text-white tracking-tight uppercase">Partner Offers</h2>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-6 px-6">
            {/* Offer 1 */}
            <div className="min-w-[280px] glass-card border border-white/10 rounded-[28px] overflow-hidden hover-glow-shadow transition-all group cursor-pointer">
              <div className="h-32 bg-[#1a1919] relative">
                <img
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  alt="cafe interior"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV5RDOEtOdWumcxWVgnbLXg7jcSMSTgiUdH3U1uU0jaGQYmIUujcTguewKtGscl7iWFX9bIjp9kezvH5v45SX5a-Gk3PfJQlAdZvyW3qdtUv1WtXCgJ-ACXAw76ivhUV8bSA14thr3uxFE31h90CCr0zBqxzVW_EBTkEu4bb--sZjAD1CrmaE1Rz7t8O0CJT_ksmxZGhm1BpUxkTEUARKp8pfFpWk9ytf47_LTTYgn7KRewYSEEQQSBSxG6IodqGlgmNRpzn0ydnc"
                />
                <div className="absolute bottom-3 left-4 bg-[#0e0e0e]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#ff8f75] tracking-widest uppercase border border-white/5">
                  Cafe Partner
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-headline font-bold text-lg leading-tight mb-2 group-hover:text-[#ff8f75] transition-colors">Daily Grind Cafe</h4>
                <p className="text-[#adaaaa] text-sm mb-4 line-clamp-2">
                  10% off your post-ride brew this week
                </p>
                <button className="w-full py-2.5 glass-card border border-[#ff8f75]/30 text-[#ff8f75] font-black text-xs rounded-full tracking-widest uppercase hover:bg-gradient-brand hover:text-black hover:border-transparent transition-all">
                  REDEEM
                </button>
              </div>
            </div>
            {/* Offer 2 */}
            <div className="min-w-[280px] glass-card border border-white/10 rounded-[28px] overflow-hidden hover-glow-shadow transition-all group cursor-pointer">
              <div className="h-32 bg-[#1a1919] relative">
                <img
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  alt="gym interior"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAqEH_yZ_mMnjeRmLmoE_9D2SwZ5wCYjz49IHHqg5PoKjv-il4kPRNMCH4UNyulqYzHi19ZbNV_RCK-3fiHXz3oYFt4Q0uyvMHazEwyQlNq2tYwIRBsgWnhMdXniN94kqb_N1lOgv1X0h5lFQ6ECiJ3dxJdbmnTxqFXByqN3OSRqBWL1KDPPwrwyoZ24RFM6cQWaoUoKWX00dAY8NvT8Lk-6g3g3wz5X7QOIdFSMzdYFkMw2aLLM7m3nf1o0VXqdqOKdDt0qAVEsc"
                />
                <div className="absolute bottom-3 left-4 bg-[#0e0e0e]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#e6a7ff] tracking-widest uppercase border border-white/5">
                  Gym Partner
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-headline font-bold text-lg leading-tight mb-2 group-hover:text-[#e6a7ff] transition-colors">Iron Peak Gym</h4>
                <p className="text-[#adaaaa] text-sm mb-4 line-clamp-2">
                  Free recovery session for club members
                </p>
                <button className="w-full py-2.5 glass-card border border-[#e6a7ff]/30 text-[#e6a7ff] font-black text-xs rounded-full tracking-widest uppercase hover:bg-gradient-to-r hover:from-[#e6a7ff] hover:to-[#c685ff] hover:text-black hover:border-transparent transition-all">
                  REDEEM
                </button>
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
