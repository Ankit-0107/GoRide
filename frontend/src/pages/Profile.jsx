import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", username: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [activeSection, setActiveSection] = useState("rides"); // rides | settings

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/profile/me");
      if (res.data.success) {
        setProfile(res.data.user);
        setRides(res.data.rides || []);
        setEditForm({
          name: res.data.user.name || "",
          username: res.data.user.username || "",
          bio: res.data.user.bio || "",
        });
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const res = await api.put("/profile/me", editForm);
      if (res.data.success) {
        setProfile((prev) => ({ ...prev, ...res.data.user }));
        localStorage.setItem("userName", res.data.user.name || "");
        localStorage.setItem("userUsername", res.data.user.username || "");
        setEditMode(false);
        showToast("Profile updated");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const togglePrivacy = async () => {
    try {
      const newVal = !profile.isPublic;
      const res = await api.put("/profile/me", { isPublic: newVal });
      if (res.data.success) {
        setProfile((prev) => ({ ...prev, isPublic: newVal }));
        showToast(newVal ? "Profile is now Public" : "Profile is now Private");
      }
    } catch (err) {
      showToast("Failed to update privacy");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userUsername");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("guestUser");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="bg-[#0e0e0e] min-h-screen flex items-center justify-center">
        <div className="text-[#adaaaa] text-sm font-bold tracking-widest uppercase animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-[#0e0e0e] min-h-screen flex items-center justify-center">
        <div className="text-[#ff6e84] text-sm">Failed to load profile</div>
      </div>
    );
  }

  const initials = profile.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="bg-[#0e0e0e] text-white font-body min-h-screen pb-32" style={{ animation: "profileEnter 0.4s cubic-bezier(0.16,1,0.3,1) forwards" }}>
      <style>{`
        @keyframes profileEnter {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-[#1a1919] border border-[#ff8f75]/30 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-medium" style={{ animation: "profileEnter 0.3s ease-out" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-20 backdrop-blur-xl bg-[#0e0e0e]/80 border-b border-white/5">
        <div className="flex items-center gap-3">
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-2xl tracking-tight text-[#ff8f75]">Profile</h1>
        </div>
        <div className="flex items-center gap-3">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="w-10 h-10 rounded-full bg-[#201f1f] flex items-center justify-center text-[#adaaaa] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
            </button>
          ) : (
            <button
              onClick={() => setEditMode(false)}
              className="w-10 h-10 rounded-full bg-[#201f1f] flex items-center justify-center text-[#adaaaa] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-24 space-y-8">
        {/* Profile Header Section */}
        <section className="flex flex-col items-center text-center space-y-4">
          {/* Avatar */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#ff8f75]/15 blur-3xl rounded-full scale-150"></div>
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-[#ff8f75] to-[#e6a7ff] p-[3px]">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover rounded-full border-4 border-[#0e0e0e]" />
              ) : (
                <div className="w-full h-full rounded-full border-4 border-[#0e0e0e] bg-[#1a1919] flex items-center justify-center text-3xl font-black text-[#ff8f75]">
                  {initials}
                </div>
              )}
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#34d399] rounded-full border-[3px] border-[#0e0e0e]"></div>
          </div>

          {/* Name & Username */}
          {!editMode ? (
            <>
              <div>
                <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl tracking-tight">{profile.name}</h2>
                <p className="text-[#adaaaa] text-sm mt-0.5">@{profile.username}</p>
              </div>
              {profile.bio && (
                <p className="text-[#adaaaa] text-sm max-w-xs leading-relaxed">{profile.bio}</p>
              )}
              {/* Privacy Badge */}
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePrivacy}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                    profile.isPublic
                      ? "bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20"
                      : "bg-[#e6a7ff]/10 text-[#e6a7ff] border border-[#e6a7ff]/20"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {profile.isPublic ? "lock_open" : "lock"}
                  </span>
                  {profile.isPublic ? "Public" : "Private"}
                </button>
              </div>
            </>
          ) : (
            /* Edit Mode Form */
            <div className="w-full max-w-xs space-y-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] ml-1">Name</label>
                <input
                  className="w-full bg-[#1a1919] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-[#ff8f75]/50 transition-all"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] ml-1">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#767575] text-sm">@</span>
                  <input
                    className="w-full bg-[#1a1919] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-[#ff8f75]/50 transition-all"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, "") })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] ml-1">Bio</label>
                <textarea
                  className="w-full bg-[#1a1919] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-[#ff8f75]/50 transition-all resize-none h-20"
                  value={editForm.bio}
                  maxLength={160}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell people about yourself..."
                />
                <p className="text-right text-[10px] text-[#767575]">{editForm.bio.length}/160</p>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#ff8f75] to-[#ff7859] text-black font-black text-sm tracking-widest uppercase active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? "SAVING..." : "SAVE CHANGES"}
              </button>
            </div>
          )}
        </section>

        {/* Stats Row */}
        <section className="flex justify-around items-center py-5 px-4 bg-[#1a1919] rounded-2xl border border-white/5">
          <button onClick={() => navigate(`/followers/${profile._id}`)} className="text-center group">
            <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-[#ff8f75] group-hover:scale-110 transition-transform">{profile.followersCount || 0}</p>
            <p className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold">Followers</p>
          </button>
          <div className="w-px h-8 bg-white/10"></div>
          <button onClick={() => navigate(`/following/${profile._id}`)} className="text-center group">
            <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-[#e6a7ff] group-hover:scale-110 transition-transform">{profile.followingCount || 0}</p>
            <p className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold">Following</p>
          </button>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="text-center">
            <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-white">{profile.ridesCompleted || 0}</p>
            <p className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold">Rides</p>
          </div>
        </section>

        {/* Section Toggle */}
        <div className="flex bg-[#1a1919] rounded-full p-1 border border-white/5">
          <button
            onClick={() => setActiveSection("rides")}
            className={`flex-1 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
              activeSection === "rides"
                ? "bg-gradient-to-r from-[#ff8f75] to-[#ff7859] text-black"
                : "text-[#adaaaa] hover:text-white"
            }`}
          >
            Ride History
          </button>
          <button
            onClick={() => setActiveSection("settings")}
            className={`flex-1 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
              activeSection === "settings"
                ? "bg-gradient-to-r from-[#ff8f75] to-[#ff7859] text-black"
                : "text-[#adaaaa] hover:text-white"
            }`}
          >
            Settings
          </button>
        </div>

        {/* Ride History */}
        {activeSection === "rides" && (
          <section className="space-y-3">
            {rides.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-[#767575] mb-3 block">directions_bike</span>
                <p className="text-[#adaaaa] text-sm">No rides yet. Go explore!</p>
              </div>
            ) : (
              rides.map((ride) => (
                <div
                  key={ride._id}
                  onClick={() => navigate(`/ride/${ride._id}`)}
                  className="bg-[#1a1919] border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-[#201f1f] transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#ff8f75]/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#ff8f75]" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bike</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{ride.title || ride.rideName || "Ride"}</p>
                    <p className="text-xs text-[#767575] mt-0.5">
                      {ride.status} • {new Date(ride.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#767575] text-lg">chevron_right</span>
                </div>
              ))
            )}
          </section>
        )}

        {/* Settings Section */}
        {activeSection === "settings" && (
          <section className="space-y-3">
            <button
              onClick={() => navigate("/notifications-page")}
              className="w-full flex items-center justify-between p-4 bg-[#1a1919] rounded-2xl border border-white/5 hover:bg-[#201f1f] transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-[#adaaaa]">notifications</span>
                <span className="font-medium text-sm">Notifications</span>
              </div>
              <span className="material-symbols-outlined text-[#767575] group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>

            <button
              onClick={() => navigate("/follow-requests")}
              className="w-full flex items-center justify-between p-4 bg-[#1a1919] rounded-2xl border border-white/5 hover:bg-[#201f1f] transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-[#adaaaa]">person_add</span>
                <span className="font-medium text-sm">Follow Requests</span>
              </div>
              <span className="material-symbols-outlined text-[#767575] group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-[#1a1919] rounded-2xl border border-white/5 hover:bg-[#201f1f] transition-colors group">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-[#adaaaa]">help</span>
                <span className="font-medium text-sm">Help & Support</span>
              </div>
              <span className="material-symbols-outlined text-[#767575] group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>

            {/* Privacy Toggle */}
            <div className="flex items-center justify-between p-4 bg-[#1a1919] rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-[#adaaaa]">{profile.isPublic ? "lock_open" : "lock"}</span>
                <div>
                  <span className="font-medium text-sm">Private Account</span>
                  <p className="text-[10px] text-[#767575] mt-0.5">Approve followers manually</p>
                </div>
              </div>
              <button
                onClick={togglePrivacy}
                className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${
                  !profile.isPublic ? "bg-[#ff8f75]" : "bg-[#484847]"
                }`}
              >
                <div className={`absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white transition-all duration-300 shadow ${
                  !profile.isPublic ? "left-[23px]" : "left-[3px]"
                }`}></div>
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full py-4 mt-4 bg-[#a70138]/10 text-[#ff6e84] font-black tracking-widest rounded-2xl border border-[#a70138]/20 active:scale-95 transition-transform uppercase text-sm"
            >
              LOG OUT
            </button>
          </section>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-[#2c2c2c]/60 backdrop-blur-xl rounded-t-[3rem] z-50">
        <div className="flex flex-col items-center text-[#adaaaa] px-5 py-2 hover:text-white transition-all active:scale-90 cursor-pointer" onClick={() => navigate("/home")}>
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-medium uppercase tracking-widest">Home</span>
        </div>
        <div className="flex flex-col items-center text-[#adaaaa] px-5 py-2 hover:text-white transition-all active:scale-90 cursor-pointer" onClick={() => navigate("/campaign")}>
          <span className="material-symbols-outlined">explore</span>
          <span className="text-[10px] font-medium uppercase tracking-widest">Campaign</span>
        </div>
        <div className="flex flex-col items-center text-[#adaaaa] px-5 py-2 hover:text-white transition-all active:scale-90 cursor-pointer" onClick={() => navigate("/community")}>
          <span className="material-symbols-outlined">group</span>
          <span className="text-[10px] font-medium uppercase tracking-widest">Community</span>
        </div>
        <div className="flex flex-col items-center bg-gradient-to-br from-[#ff8f75] to-[#ff7859] text-black rounded-full px-5 py-2 active:scale-90">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="text-[10px] font-medium uppercase tracking-widest">Profile</span>
        </div>
      </nav>
    </div>
  );
}