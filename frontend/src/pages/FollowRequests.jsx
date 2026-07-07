import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function FollowRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/profile/follow-requests");
      if (res.data.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (followerId) => {
    try {
      await api.post(`/profile/accept-follow/${followerId}`);
      setRequests(requests.filter(r => r.follower._id !== followerId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (followerId) => {
    try {
      await api.post(`/profile/reject-follow/${followerId}`);
      setRequests(requests.filter(r => r.follower._id !== followerId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#0e0e0e] text-white min-h-screen">
      <header className="fixed top-0 w-full z-50 flex items-center px-6 h-20 bg-[#0e0e0e]/80 border-b border-white/5 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} className="text-[#adaaaa] hover:text-white">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="ml-4 font-bold text-xl">Follow Requests</h1>
      </header>

      <main className="w-full max-w-7xl mx-auto pt-24 px-6 space-y-3 pb-10">
        {loading ? (
          <div className="text-center text-[#adaaaa] pt-10">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="text-center text-[#adaaaa] pt-10">No pending requests</div>
        ) : (
          requests.map(r => (
            <div key={r._id} className="bg-[#1a1919] p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/user/${r.follower._id}`)}>
                 <div className="w-10 h-10 rounded-full bg-[#201f1f] flex items-center justify-center font-bold">
                    {r.follower.avatar ? <img src={r.follower.avatar} alt="avatar" className="w-full h-full rounded-full" /> : r.follower.name.charAt(0)}
                 </div>
                 <div>
                    <p className="font-bold text-sm">{r.follower.name}</p>
                    <p className="text-xs text-[#adaaaa]">@{r.follower.username}</p>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => handleAccept(r.follower._id)} className="bg-[#ff8f75] text-black px-4 py-1.5 rounded-full text-xs font-bold">Confirm</button>
                 <button onClick={() => handleReject(r.follower._id)} className="bg-[#201f1f] text-white px-4 py-1.5 rounded-full text-xs font-bold">Delete</button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
