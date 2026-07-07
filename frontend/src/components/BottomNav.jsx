// src/components/BottomNav.jsx
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Floating Pill Bottom Navigation Bar
 * 🏠 Home  |  🎞️ Moments  |  ➕ Create  |  💬 Messages  |  🔍 Search
 *
 * - Glassmorphism floating pill matching reference image
 * - Active tab has a pill-shaped background highlight
 * - No text labels, purely iconographic
 */

const navItems = [
  { key: "home",     path: "/home" },
  { key: "reels",    path: "/coming-soon" },
  { key: "create",   path: "/create-campaign" },
  { key: "messages", path: "/community" },
  { key: "explore",  path: "/coming-soon" },
];

/* ── Minimalist SVG icons ─────────────────────────────────────── */
const icons = {
  home: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#fff" : "none"} stroke={active ? "#fff" : "#8A8A8E"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10z" />
      <path d="M9 21V12h6v9" stroke={active ? "#1A1A1A" : "#8A8A8E"} />
    </svg>
  ),
  reels: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#fff" : "none"} stroke={active ? "#fff" : "#8A8A8E"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="4" />
      <polygon points="10 8 16 12 10 16 10 8" fill={active ? "#1A1A1A" : "none"} stroke={active ? "#1A1A1A" : "#8A8A8E"} />
    </svg>
  ),
  create: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#8A8A8E"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  messages: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#fff" : "none"} stroke={active ? "#fff" : "#8A8A8E"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  explore: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#8A8A8E"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" fill={active ? "#fff" : "none"} />
      <line x1="21" y1="21" x2="16.65" y2="16.65" stroke={active ? "#fff" : "#8A8A8E"} />
    </svg>
  ),
};

export default function BottomNav({ active: activeProp }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab: explicit prop or inferred from path
  const getActiveKey = () => {
    if (activeProp) return activeProp;
    const p = location.pathname;
    if (p === "/home" || p === "/landing")       return "home";
    if (p === "/campaign" || p.startsWith("/campaign") || p.startsWith("/create-campaign")) return null;
    if (p === "/create-ride")                    return "create";
    if (p === "/community" || p.startsWith("/community") || p.startsWith("/chat")) return "messages";
    if (p === "/active" || p.startsWith("/ride")) return "explore";
    return "home";
  };

  const activeKey = getActiveKey();

  return (
    <>
      <style>{`
        .goride-bnav__item {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          height: 44px;
          width: 44px;
          border-radius: 9999px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .goride-bnav__item:active { transform: scale(0.9); }
        .goride-bnav__item--active {
          width: 72px;
          background: linear-gradient(135deg, rgba(255,143,117,0.15), rgba(230,167,255,0.05));
          border: 1px solid rgba(255, 143, 117, 0.2);
          box-shadow: inset 0 0 10px rgba(255, 143, 117, 0.05), 0 0 15px rgba(255, 143, 117, 0.1);
        }
        .goride-bnav__item-create {
          background: linear-gradient(135deg, #ff8f75, #e6a7ff);
          box-shadow: 0 4px 20px rgba(255, 143, 117, 0.4);
          transform: translateY(-4px);
        }
        .goride-bnav__item-create:active { transform: translateY(-4px) scale(0.9); }
        .goride-bnav__item-create svg {
          stroke: #000 !important;
        }
      `}</style>

      {/* 
        Standard fixed positioning at the bottom with safe-area handling for mobile devices.
        Provides a consistent dimension and prevents background bleeding underneath.
      */}
      <div 
        className="fixed left-0 right-0 w-full z-[999] bg-[#141414] shadow-[0_-10px_30px_rgba(0,0,0,0.6)]"
        style={{
          bottom: "-5px",
          paddingBottom: "calc(5px + env(safe-area-inset-bottom, 0px))"
        }}
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff8f75]/30 to-transparent"></div>
        <nav className="flex items-center justify-evenly w-full max-w-md mx-auto px-4 py-3 min-h-[64px]">
          {navItems.map((item) => {
            const isActive = activeKey === item.key;
            const isCreate = item.key === "create";
            return (
              <div
                key={item.key}
                className={`relative goride-bnav__item ${isActive && !isCreate ? "goride-bnav__item--active" : ""} ${isCreate ? "goride-bnav__item-create w-[48px] h-[48px]" : ""}`}
                onClick={() => {
                  navigate(item.path);
                }}
                role="button"
                aria-label={item.key}
              >
                {icons[item.key](isActive)}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}