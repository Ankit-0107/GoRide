import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/profile/user/${id}`);
      if (res.data.success) {
        setProfile(res.data.user);
        setRides(res.data.rides || []);
        setIsFollowing(res.data.isFollowing);
        setHasRequested(res.data.hasRequested);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const res = await api.post(`/profile/follow/${id}`);
      if (res.data.success) {
        if (res.data.status === 'accepted') {
          setIsFollowing(true);
          setProfile(p => ({ ...p, followersCount: (p.followersCount || 0) + 1 }));
        } else {
          setHasRequested(true);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to follow");
    }
  };

  const handleUnfollow = async () => {
    try {
      const res = await api.post(`/profile/unfollow/${id}`);
      if (res.data.success) {
        setIsFollowing(false);
        setProfile(p => ({ ...p, followersCount: Math.max(0, (p.followersCount || 0) - 1) }));
      }
    } catch (err) {
      showToast("Failed to unfollow");
    }
  };

  if (loading) return <div className="bg-[#0e0e0e] min-h-screen text-white text-center pt-20">Loading...</div>;
  if (!profile) return <div className="bg-[#0e0e0e] min-h-screen text-white text-center pt-20">Profile not found</div>;

  const currentUserId = localStorage.getItem('userId');
  const isSelf = currentUserId === profile._id;

  return (
    <div className="bg-[#0e0e0e] text-white min-h-screen pb-20">
      {toast && <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-[#1a1919] border border-[#ff8f75]/30 px-6 py-3 rounded-xl">{toast}</div>}
      
      <header className="fixed top-0 w-full z-50 flex items-center px-6 h-20 bg-[#0e0e0e]/80 border-b border-white/5 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} className="text-[#adaaaa] hover:text-white">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="ml-4 font-bold text-xl">{profile.name}</h1>
      </header>

      <main className="w-full max-w-7xl mx-auto pt-24 px-6 space-y-8">
        <section className="flex flex-col items-center text-center">
          <div className="w-28 h-28 rounded-full bg-[#1a1919] border-2 border-[#ff8f75] flex items-center justify-center text-3xl font-black mb-4 overflow-hidden">
             {profile.avatar ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" /> : profile.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold">{profile.name}</h2>
          <p className="text-[#adaaaa]">@{profile.username}</p>
          {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}

          {!isSelf && (
            <div className="mt-4">
              {isFollowing ? (
                 <button onClick={handleUnfollow} className="bg-[#1a1919] border border-white/20 px-6 py-2 rounded-full font-bold hover:bg-[#2c2c2c]">Following</button>
              ) : hasRequested ? (
                 <button disabled className="bg-[#1a1919] text-[#adaaaa] px-6 py-2 rounded-full font-bold">Requested</button>
              ) : (
                 <button onClick={handleFollow} className="bg-[#ff8f75] text-black px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform">Follow</button>
              )}
            </div>
          )}
        </section>

        <section className="flex justify-around bg-[#1a1919] rounded-xl p-4">
          <div className="text-center cursor-pointer" onClick={() => navigate(`/followers/${profile._id}`)}>
             <p className="text-xl font-bold text-[#ff8f75]">{profile.followersCount || 0}</p>
             <p className="text-xs text-[#adaaaa] uppercase tracking-wider font-bold">Followers</p>
          </div>
          <div className="text-center cursor-pointer" onClick={() => navigate(`/following/${profile._id}`)}>
             <p className="text-xl font-bold text-[#e6a7ff]">{profile.followingCount || 0}</p>
             <p className="text-xs text-[#adaaaa] uppercase tracking-wider font-bold">Following</p>
          </div>
        </section>

        <section className="space-y-3">
           <h3 className="font-bold text-lg mb-4">Rides</h3>
           {!profile.isPublic && !isFollowing && !isSelf ? (
             <div className="text-center text-[#adaaaa] py-10 bg-[#1a1919] rounded-xl">
               <span className="material-symbols-outlined block text-4xl mb-2">lock</span>
               This account is private
             </div>
           ) : rides.length === 0 ? (
             <div className="text-center text-[#adaaaa] py-10 bg-[#1a1919] rounded-xl">No rides yet</div>
           ) : (
             rides.map(r => (
               <div key={r._id} onClick={() => navigate(`/ride/${r._id}`)} className="bg-[#1a1919] p-4 rounded-xl cursor-pointer hover:bg-[#201f1f]">
                 <p className="font-bold">{r.title}</p>
                 <p className="text-xs text-[#adaaaa] mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
               </div>
             ))
           )}
        </section>
      </main>
    </div>
  );
}
