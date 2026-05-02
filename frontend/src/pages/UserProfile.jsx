import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";

export default function UserProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [rides, setRides] = useState([]);
  const [followStatus, setFollowStatus] = useState("none"); // none | pending | following
  const [canSeeProfile, setCanSeeProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState("");

  const myId = localStorage.getItem("userId");

  useEffect(() => {
    if (id === myId) {
      navigate("/profile");
      return;
    }
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/profile/user/${id}`);
      if (res.data.success) {
        setProfile(res.data.user);
        setRides(res.data.rides || []);
        setFollowStatus(res.data.followStatus);
        setCanSeeProfile(res.data.canSeeProfile);
      }
    } catch (err) {
      console.error("User profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/profile/follow/${id}`);
      if (res.data.success) {
        setFollowStatus(res.data.status);
        showToast(res.data.message);
        fetchUserProfile();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfollow = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/profile/unfollow/${id}`);
      if (res.data.success) {
        setFollowStatus("none");
        showToast("Unfollowed");
        fetchUserProfile();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
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
        <div className="text-[#ff6e84] text-sm">User not found</div>
      </div>
    );
  }

  const initials = profile.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="bg-[#0e0e0e] text-white font-body min-h-screen pb-12" style={{ animation: "upEnter 0.4s cubic-bezier(0.16,1,0.3,1) forwards" }}>
      <style>{`
        @keyframes upEnter {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-[#1a1919] border border-[#ff8f75]/30 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-medium" style={{ animation: "upEnter 0.3s ease-out" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 backdrop-blur-xl bg-[#0e0e0e]/80 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="text-white hover:text-[#ff8f75] transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-bold text-sm tracking-wider uppercase">@{profile.username}</h1>
        <div className="w-6"></div>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-20 space-y-6">
        {/* Profile Card */}
        <section className="flex flex-col items-center text-center space-y-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#ff8f75] to-[#e6a7ff] p-[3px]">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover rounded-full border-4 border-[#0e0e0e]" />
              ) : (
                <div className="w-full h-full rounded-full border-4 border-[#0e0e0e] bg-[#1a1919] flex items-center justify-center text-2xl font-black text-[#ff8f75]">
                  {initials}
                </div>
              )}
            </div>
            {/* Online indicator */}
            {profile.isOnline && (
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#34d399] rounded-full border-[3px] border-[#0e0e0e]"></div>
            )}
          </div>

          <div>
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl tracking-tight">{profile.name}</h2>
            <p className="text-[#adaaaa] text-sm mt-0.5">@{profile.username}</p>
          </div>

          {profile.bio && <p className="text-[#adaaaa] text-sm max-w-xs leading-relaxed">{profile.bio}</p>}

          {/* Privacy badge */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#767575]">
            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
              {profile.isPublic ? "lock_open" : "lock"}
            </span>
            {profile.isPublic ? "Public" : "Private"}
          </div>

          {/* Follow / Unfollow Button */}
          <div className="flex gap-3 w-full max-w-xs">
            {followStatus === "none" && (
              <button
                onClick={handleFollow}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#ff8f75] to-[#ff7859] text-black font-black text-sm tracking-widest uppercase active:scale-95 transition-all disabled:opacity-50"
              >
                {actionLoading ? "..." : "FOLLOW"}
              </button>
            )}
            {followStatus === "pending" && (
              <button
                onClick={handleUnfollow}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-full bg-[#1a1919] text-[#adaaaa] font-bold text-sm tracking-widest uppercase border border-white/10 active:scale-95 transition-all"
              >
                REQUESTED
              </button>
            )}
            {followStatus === "following" && (
              <button
                onClick={handleUnfollow}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-full bg-[#1a1919] text-white font-bold text-sm tracking-widest uppercase border border-white/10 active:scale-95 transition-all hover:bg-[#3a1520] hover:text-[#ff6e84] hover:border-[#ff6e84]/30"
              >
                FOLLOWING
              </button>
            )}
            <button
              onClick={() => navigate(`/chat/${id}`)}
              className="py-3 px-5 rounded-full bg-[#1a1919] border border-white/10 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-white text-lg">chat</span>
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="flex justify-around items-center py-5 px-4 bg-[#1a1919] rounded-2xl border border-white/5">
          <button onClick={() => navigate(`/followers/${id}`)} className="text-center">
            <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-[#ff8f75]">{profile.followersCount || 0}</p>
            <p className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold">Followers</p>
          </button>
          <div className="w-px h-8 bg-white/10"></div>
          <button onClick={() => navigate(`/following/${id}`)} className="text-center">
            <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-[#e6a7ff]">{profile.followingCount || 0}</p>
            <p className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold">Following</p>
          </button>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="text-center">
            <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-white">{profile.ridesCompleted || 0}</p>
            <p className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold">Rides</p>
          </div>
        </section>

        {/* Rides (only if can see profile) */}
        {canSeeProfile ? (
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#adaaaa] mb-3">Ride History</h3>
            {rides.length === 0 ? (
              <div className="text-center py-8 text-[#767575] text-sm">No rides yet</div>
            ) : (
              rides.map((ride) => (
                <div
                  key={ride._id}
                  className="bg-[#1a1919] border border-white/5 rounded-2xl p-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#ff8f75]/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#ff8f75] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bike</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{ride.title || ride.rideName || "Ride"}</p>
                    <p className="text-xs text-[#767575]">{new Date(ride.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </section>
        ) : (
          /* Private profile - can't see content */
          <section className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-[#484847] mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            <h3 className="font-bold text-lg mb-1">This Account is Private</h3>
            <p className="text-[#adaaaa] text-sm">Follow this account to see their rides and activity.</p>
          </section>
        )}
      </main>
    </div>
  );
}
