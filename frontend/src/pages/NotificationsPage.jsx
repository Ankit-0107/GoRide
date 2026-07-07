import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

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
      if (res.data.success) {
        setNotifications(res.data.notifications);
        api.put("/notifications/mark-read");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0e0e0e] text-white min-h-screen">
      <header className="fixed top-0 w-full z-50 flex items-center px-6 h-20 bg-[#0e0e0e]/80 border-b border-white/5 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} className="text-[#adaaaa] hover:text-white">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="ml-4 font-bold text-xl">Notifications</h1>
      </header>

      <main className="w-full max-w-7xl mx-auto pt-24 px-6 space-y-3 pb-10">
        {loading ? (
          <div className="text-center text-[#adaaaa] pt-10">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-[#adaaaa] pt-10">No notifications</div>
        ) : (
          notifications.map(n => (
            <div key={n._id} onClick={() => n.link && navigate(n.link)} className={`bg-[#1a1919] p-4 rounded-xl flex items-center gap-4 cursor-pointer ${!n.read ? 'border-l-4 border-[#ff8f75]' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-[#201f1f] flex items-center justify-center shrink-0">
                 <span className="material-symbols-outlined text-[#ff8f75]">{n.type === 'follow_request' ? 'person_add' : 'notifications'}</span>
              </div>
              <div>
                <p className="text-sm">{n.message}</p>
                <p className="text-xs text-[#adaaaa] mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
