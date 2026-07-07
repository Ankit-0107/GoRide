import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import BottomNav from "../components/BottomNav";

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
    <div className="bg-[#0e0e0e] text-white min-h-screen pb-32 overflow-x-hidden font-body selection:bg-[#ff8f75] selection:text-[#5f0e00]" style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-40 bg-[#0e0e0e]/80 backdrop-blur-xl border-b border-white/5 flex justify-end items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/notifications-page")} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#2c2c2c]/60 backdrop-blur-md hover:bg-[#ff8f75]/20 hover:text-[#ff8f75] transition-all active:scale-95 duration-200 border border-white/10 text-white">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-[#2c2c2c]/60 flex items-center justify-center text-[#adaaaa] hover:text-white transition-colors active:scale-95 duration-200 border-2 border-[#ff8f75]/20 overflow-hidden"
            title="Profile"
          >
            <span className="material-symbols-outlined text-xl">person</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-6 relative z-10">
        {/* Floating Orbs Background */}
        <div className="fixed top-1/4 -right-1/4 w-96 h-96 bg-[#ff8f75]/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-float"></div>
        <div className="fixed bottom-1/4 -left-1/4 w-96 h-96 bg-[#e6a7ff]/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-float" style={{ animationDelay: '2s' }}></div>

        {/* Large Headline Section */}
        <div className="mt-4 mb-8">
          <h2 className="font-headline font-black text-[40px] leading-[1.1] tracking-tight uppercase">
            <span className="text-white block">Let's Stay</span>
            <span className="gradient-text block animate-pulse duration-1000">Connected</span>
          </h2>
        </div>

        {/* Search Bar Section */}
        <div className="relative w-full mb-8">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-[#adaaaa] text-xl">search</span>
          </div>
    <input
            className="w-full bg-black text-white border border-[#333] rounded-full py-4 pl-12 pr-6 placeholder:text-[#adaaaa]/60 focus:ring-2 focus:ring-[#ff8f75] transition-all outline-none"
            placeholder="Search members or groups..."
            type="text"
          />
        </div>

        {/* Recent Chats Label */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline font-black text-xs uppercase tracking-[0.2em] text-[#adaaaa]">
            RECENT CHATS
          </h2>
          <button className="text-[#ff8f75] text-xs font-bold hover:brightness-110 transition-colors">Mark all read</button>
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
                  className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border border-white/5 hover:border-white/10 hover-glow-shadow ${
                    isUnread ? 'glass-card border-[#ff8f75]/30 shadow-[0_0_15px_rgba(255,143,117,0.1)]' : 'bg-[#2c2c2c]/30 backdrop-blur-sm hover:bg-[#2c2c2c]/60'
                  }`}
                >
                  <div className="shrink-0 relative">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center border border-white/10 overflow-hidden bg-[#2c2c2c]">
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
                      <h3 className={`font-headline font-bold truncate ${isUnread ? "text-white group-hover:text-[#ff8f75]" : "text-[#adaaaa] group-hover:text-white"}`}>
                        {conv.title}
                      </h3>
                      <span className={`text-[10px] font-medium ${isUnread ? "text-[#ff8f75]" : "text-[#adaaaa]/60"}`}>
                        {formatDate(conv.timestamp)}
                      </span>
                    </div>
                    
                    <p className={`text-sm truncate mb-2 ${isUnread ? "text-[#adaaaa] font-medium" : "text-[#adaaaa]/60"}`}>
                      {conv.senderName && conv.type !== 'user' ? <span className="font-medium text-white">{conv.senderName}: </span> : null}
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
        className="fixed right-6 bottom-32 w-14 h-14 bg-gradient-brand rounded-full flex items-center justify-center glow-shadow text-black z-40 hover:scale-105 active:scale-95 transition-all duration-300"
        onClick={() => navigate("/create-community")}
      >
        <span className="material-symbols-outlined font-black text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          add
        </span>
      </button>

      {/* BottomNavBar */}
      <BottomNav active="messages" />
    </div>
  );
}