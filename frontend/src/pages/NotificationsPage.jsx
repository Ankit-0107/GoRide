import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const NOTIF_ICONS = {
  follow: { icon: "person_add", color: "#ff8f75" },
  follow_request: { icon: "person_add", color: "#e6a7ff" },
  follow_accepted: { icon: "how_to_reg", color: "#34d399" },
  ride_invite: { icon: "directions_bike", color: "#ff8f75" },
  ride_joined: { icon: "group_add", color: "#e6a7ff" },
  ride_completed: { icon: "flag", color: "#34d399" },
  message: { icon: "chat", color: "#60a5fa" },
  rating: { icon: "star", color: "#fbbf24" },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      if (res.data.success) setNotifications(res.data.notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    // Mark as read
    if (!notif.read) {
      try {
        await api.put(`/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
      } catch (err) { /* ignore */ }
    }

    // Navigate based on type
    if (["follow", "follow_request", "follow_accepted"].includes(notif.type) && notif.sender) {
      navigate(`/user/${notif.sender}`);
    } else if (["ride_invite", "ride_joined", "ride_completed"].includes(notif.type) && notif.referenceId) {
      navigate(`/ride/${notif.referenceId}`);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return `${Math.floor(days / 7)}w`;
  };

  return (
    <div className="bg-[#0e0e0e] text-white font-body min-h-screen">
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 backdrop-blur-xl bg-[#0e0e0e]/80 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="text-white hover:text-[#ff8f75] transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-bold text-sm tracking-wider uppercase">Notifications</h1>
        <button onClick={markAllRead} className="text-xs font-bold text-[#ff8f75] tracking-wider uppercase">
          Read All
        </button>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-20 space-y-1 pb-12">
        {loading ? (
          <div className="text-center text-[#adaaaa] py-12 animate-pulse">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-4xl text-[#484847] mb-3 block">notifications_none</span>
            <p className="text-[#adaaaa] text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => {
            const cfg = NOTIF_ICONS[n.type] || { icon: "info", color: "#adaaaa" };
            return (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-colors active:scale-[0.98] ${
                  n.read ? "bg-transparent hover:bg-[#1a1919]/50" : "bg-[#1a1919] border border-white/5"
                }`}
              >
                {/* Icon or Avatar */}
                <div className="relative shrink-0">
                  {n.senderAvatar ? (
                    <img src={n.senderAvatar} alt="" className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#ff8f75] to-[#e6a7ff] flex items-center justify-center text-sm font-bold text-black">
                      {n.senderName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: cfg.color + "20" }}
                  >
                    <span className="material-symbols-outlined text-xs" style={{ color: cfg.color, fontVariationSettings: "'FILL' 1" }}>
                      {cfg.icon}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">
                    <span className="font-bold">{n.senderName}</span>{" "}
                    <span className="text-[#adaaaa]">{n.content?.replace(n.senderName, "").trim()}</span>
                  </p>
                  <p className="text-xs text-[#767575] mt-1">{timeAgo(n.createdAt)}</p>
                </div>

                {/* Unread dot */}
                {!n.read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff8f75] shrink-0 mt-2"></div>
                )}
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
