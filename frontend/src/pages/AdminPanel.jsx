import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState({ users: 0, rides: 0, messages: 0 });
  const [users, setUsers] = useState([]);
  const [rides, setRides] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const isAdmin = localStorage.getItem("userRole") === "admin";

  useEffect(() => {
    if (!isAdmin) {
      navigate("/home");
      return;
    }
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      if (res.data.success) setStats(res.data.stats);
    } catch (err) {
      console.error("Stats error:", err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      if (res.data.success) setUsers(res.data.users);
    } catch (err) {
      console.error("Users error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRides = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/rides");
      if (res.data.success) setRides(res.data.rides);
    } catch (err) {
      console.error("Rides error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/messages");
      if (res.data.success) setMessages(res.data.messages);
    } catch (err) {
      console.error("Messages error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "stats") fetchStats();
    if (tab === "users") fetchUsers();
    if (tab === "rides") fetchRides();
    if (tab === "messages") fetchMessages();
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This also deletes their messages.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      showToast(`User "${name}" deleted`);
      fetchUsers();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete user");
    }
  };

  const toggleRole = async (id, currentRole, name) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`Change "${name}" role to ${newRole}?`)) return;
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      showToast(`"${name}" is now ${newRole}`);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to change role");
    }
  };

  const deleteRide = async (id, title) => {
    if (!window.confirm(`Delete ride "${title}"? This also deletes ride messages.`)) return;
    try {
      await api.delete(`/admin/rides/${id}`);
      showToast(`Ride "${title}" deleted`);
      fetchRides();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete ride");
    }
  };

  const deleteMessage = async (id) => {
    try {
      await api.delete(`/admin/messages/${id}`);
      showToast("Message deleted");
      fetchMessages();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete message");
    }
  };

  const clearAllMessages = async () => {
    if (!window.confirm("⚠️ DELETE ALL MESSAGES? This cannot be undone!")) return;
    if (!window.confirm("Are you absolutely sure?")) return;
    try {
      const res = await api.delete("/admin/messages-clear-all");
      showToast(res.data.message);
      fetchMessages();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to clear messages");
    }
  };

  const tabs = [
    { id: "stats", label: "Dashboard", icon: "dashboard" },
    { id: "users", label: "Users", icon: "group" },
    { id: "rides", label: "Rides", icon: "directions_bike" },
    { id: "messages", label: "Messages", icon: "chat" },
  ];

  if (!isAdmin) return null;

  return (
    <div className="bg-[#0e0e0e] text-white font-body min-h-screen" style={{ animation: 'authPageEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
      <style>{`
        @keyframes authPageEnter {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-[#1a1919] border border-[#ff8f75]/30 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-medium" style={{ animation: 'authPageEnter 0.3s ease-out' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-20 backdrop-blur-xl bg-[#0e0e0e]/80 border-b border-white/5">
        <button onClick={() => navigate("/home")} className="text-white hover:text-[#ff8f75] transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#ff8f75]" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
          <h1 className="text-xl font-black tracking-tight font-headline uppercase">Admin Panel</h1>
        </div>
        <div className="w-6"></div>
      </header>

      {/* Tab Navigation */}
      <div className="fixed top-20 w-full z-40 bg-[#0e0e0e]/90 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto max-w-2xl mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase font-headline transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#ff8f75] to-[#ff7859] text-black shadow-lg"
                  : "bg-[#1a1919] text-[#adaaaa] hover:text-white hover:bg-[#262626]"
              }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="pt-40 px-4 pb-12 max-w-2xl mx-auto">

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Users", value: stats.users, icon: "group", color: "#ff8f75" },
              { label: "Rides", value: stats.rides, icon: "directions_bike", color: "#e6a7ff" },
              { label: "Messages", value: stats.messages, icon: "chat", color: "#f5777c" },
            ].map((s) => (
              <div key={s.label} className="bg-[#1a1919] border border-white/5 rounded-2xl p-5 text-center">
                <span className="material-symbols-outlined text-3xl mb-2 block" style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                <div className="text-3xl font-black font-headline" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center text-[#adaaaa] py-12">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center text-[#adaaaa] py-12">No users found</div>
            ) : (
              users.map((u) => (
                <div key={u._id} className="bg-[#1a1919] border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff8f75] to-[#ff7859] flex items-center justify-center text-sm font-bold text-black shrink-0">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold truncate">{u.name}</div>
                      <div className="text-xs text-[#767575] truncate">{u.email}</div>
                    </div>
                    {u.role === "admin" && (
                      <span className="text-[9px] font-extrabold tracking-widest uppercase bg-[#ff8f75]/20 text-[#ff8f75] px-2 py-0.5 rounded-full shrink-0">ADMIN</span>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => toggleRole(u._id, u.role, u.name)}
                      className="w-9 h-9 rounded-full bg-[#262626] hover:bg-[#2c2c2c] flex items-center justify-center transition-colors"
                      title={u.role === "admin" ? "Demote to user" : "Promote to admin"}
                    >
                      <span className="material-symbols-outlined text-lg text-[#e6a7ff]">
                        {u.role === "admin" ? "person_remove" : "shield_person"}
                      </span>
                    </button>
                    <button
                      onClick={() => deleteUser(u._id, u.name)}
                      className="w-9 h-9 rounded-full bg-[#262626] hover:bg-[#3a1520] flex items-center justify-center transition-colors"
                      title="Delete user"
                    >
                      <span className="material-symbols-outlined text-lg text-[#ff6e84]">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Rides Tab */}
        {activeTab === "rides" && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center text-[#adaaaa] py-12">Loading rides...</div>
            ) : rides.length === 0 ? (
              <div className="text-center text-[#adaaaa] py-12">No rides found</div>
            ) : (
              rides.map((r) => (
                <div key={r._id} className="bg-[#1a1919] border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="material-symbols-outlined text-2xl text-[#e6a7ff]" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bike</span>
                    <div className="min-w-0">
                      <div className="text-sm font-bold truncate">{r.title || r.rideName || "Untitled Ride"}</div>
                      <div className="text-xs text-[#767575]">
                        {r.participants?.length || 0} riders • {r.status || "active"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRide(r._id, r.title || r.rideName || "Untitled")}
                    className="w-9 h-9 rounded-full bg-[#262626] hover:bg-[#3a1520] flex items-center justify-center transition-colors shrink-0"
                    title="Delete ride"
                  >
                    <span className="material-symbols-outlined text-lg text-[#ff6e84]">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={clearAllMessages}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#a70138]/20 text-[#ff6e84] text-xs font-bold uppercase tracking-widest hover:bg-[#a70138]/40 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                Clear All
              </button>
            </div>
            {loading ? (
              <div className="text-center text-[#adaaaa] py-12">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-[#adaaaa] py-12">No messages found</div>
            ) : (
              <div className="space-y-2">
                {messages.map((m) => (
                  <div key={m._id} className="bg-[#1a1919] border border-white/5 rounded-xl p-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#ff8f75]">{m.senderName || "Unknown"}</span>
                        {m.rideName && <span className="text-[9px] bg-[#262626] px-2 py-0.5 rounded-full text-[#adaaaa]">{m.rideName}</span>}
                      </div>
                      <div className="text-sm text-[#ccc] truncate">{m.content}</div>
                      <div className="text-[10px] text-[#767575] mt-1">{new Date(m.createdAt).toLocaleString()}</div>
                    </div>
                    <button
                      onClick={() => deleteMessage(m._id)}
                      className="w-8 h-8 rounded-full bg-[#262626] hover:bg-[#3a1520] flex items-center justify-center transition-colors shrink-0 mt-1"
                    >
                      <span className="material-symbols-outlined text-sm text-[#ff6e84]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
