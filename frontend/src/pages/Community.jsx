import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Community() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

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

    // Fetch conversations
    const fetchConversations = async () => {
      try {
        const res = await api.get('/chat/conversations');
        if (res.data.success) {
          setConversations(res.data.conversations || []);
        }
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      } finally {
        setLoading(false);
      }
    };
    if (!isGuest) fetchConversations();
    else setLoading(false);
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    // If today, show time. Otherwise show short month and day
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleChatClick = (conv) => {
    navigate(`/community-chat?type=${conv.type}&targetId=${conv.targetId}&title=${encodeURIComponent(conv.title)}`);
  };

  return (
    <div className="bg-surface-container-lowest min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-40 no-border bg-[#0e0e0e] flex justify-between items-center px-6 py-4 max-w-xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-outline-variant/20">
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
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-[#1a1919] transition-colors active:scale-95 duration-200">
          <span className="material-symbols-outlined text-[#adaaaa]">notifications</span>
        </button>
      </header>

      <main className="max-w-xl mx-auto px-6">
        {/* Large Headline Section */}
        <div className="mt-4 mb-8">
          <h2 className="font-headline font-extrabold text-[40px] leading-[1.1] tracking-tight">
            <span className="text-white block">Let's Stay</span>
            <span className="text-[#fe5d39] block">Connected</span>
          </h2>
        </div>

        {/* Search Bar Section */}
        <div className="relative w-full mb-8">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">search</span>
          </div>
          <input
            className="w-full bg-surface-container-highest border-none rounded-full py-4 pl-12 pr-6 text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary focus:bg-surface-bright transition-all"
            placeholder="Search members or groups..."
            type="text"
          />
        </div>

        {/* Recent Chats Label */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline font-bold text-xs uppercase tracking-[0.2em] text-on-surface-variant">
            RECENT CHATS
          </h2>
          <button className="text-primary text-xs font-semibold">Mark all read</button>
        </div>

        {/* Chat List */}
        <div className="space-y-4">
          {loading ? (
             <div className="p-4 text-center text-[#adaaaa] text-sm font-medium">Loading conversations...</div>
          ) : conversations.length === 0 ? (
             <div className="p-4 text-center text-[#adaaaa] text-sm font-medium">No active chats. Tap + to create one!</div>
          ) : (
            conversations.map((conv) => {
              const isUnread = conv.hasUnread;
              return (
                <div 
                  key={conv.id}
                  onClick={() => handleChatClick(conv)}
                  className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors ${
                    isUnread ? 'bg-surface-container/80' : 'bg-surface-container/40 hover:bg-surface-container-high'
                  }`}
                >
                  <div className="shrink-0 relative">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center border border-outline-variant/20 overflow-hidden bg-surface-bright">
                      {/* Default placeholder profile photo */}
                      <img 
                        src={conv.type === 'community' 
                           ? "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=150" 
                           : conv.type === 'ride' 
                             ? "https://images.unsplash.com/photo-1511994298241-608e28f14fde?auto=format&fit=crop&q=80&w=150"
                             : "https://lh3.googleusercontent.com/aida-public/AB6AXuB4KnEEoBWYZ1APXDk0vZE-IXxqiwcwTDjC1ROhY2e_14qF0jbI6vuyHClAkBV6FPJN8XRQcOJCO-ZOyD6kxSgnIcXzQA3-ZTP4ukZmchixEnNgesrT1Q-xtVVsQhW_FWSTJYlcEvnl-00E3zyz5Qu0VyGbdHIwFTkEEPxAPut6NAlv3dx-dYAek-7ZJ-EQtggEj4ycGetsAF0SQ8zX48j0ri_fj3r9GQETe8DHIheIt6JcRPkrFDjvz0ixTxG2GsTiQIdVXmCY_As"
                        }
                        alt="Profile"
                        className="w-full h-full object-cover opacity-90"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`font-headline font-bold truncate ${isUnread ? "text-on-surface" : "text-on-surface-variant"}`}>
                        {conv.title}
                      </h3>
                      <span className={`text-[10px] font-medium ${isUnread ? "text-primary" : "text-on-surface-variant"}`}>
                        {formatDate(conv.timestamp)}
                      </span>
                    </div>
                    
                    <p className={`text-sm truncate mb-2 ${isUnread ? "text-on-surface-variant font-medium" : "text-on-surface-variant/80"}`}>
                      {conv.senderName && conv.type !== 'user' ? <span className="font-medium text-on-surface">{conv.senderName}: </span> : null}
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* FAB */}
      <button 
        className="fixed right-6 bottom-32 w-14 h-14 bg-gradient-to-br from-[#ff8f75] to-[#ff7859] rounded-full flex items-center justify-center shadow-[0px_24px_48px_rgba(255,143,117,0.2)] text-black z-40 active:scale-90 duration-300"
        onClick={() => navigate("/create-community")}
      >
        <span className="material-symbols-outlined font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
          add
        </span>
      </button>

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
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#ff8f75] to-[#ff7859] text-black rounded-full px-5 py-2 active:scale-90 duration-150">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            group
          </span>
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