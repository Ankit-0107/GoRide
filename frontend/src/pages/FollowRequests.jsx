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
      const res = await api.get("/profile/requests");
      if (res.data.success) setRequests(res.data.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const accept = async (id) => {
    try {
      await api.post(`/profile/accept/${id}`);
      setRequests((prev) => prev.filter((r) => r.follower._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const reject = async (id) => {
    try {
      await api.post(`/profile/reject/${id}`);
      setRequests((prev) => prev.filter((r) => r.follower._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#0e0e0e] text-white font-body min-h-screen">
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 backdrop-blur-xl bg-[#0e0e0e]/80 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="text-white hover:text-[#ff8f75] transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-bold text-sm tracking-wider uppercase">Follow Requests</h1>
        <div className="w-6"></div>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-20 space-y-3">
        {loading ? (
          <div className="text-center text-[#adaaaa] py-12 animate-pulse">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-4xl text-[#484847] mb-3 block">person_add</span>
            <p className="text-[#adaaaa] text-sm">No pending requests</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req._id} className="bg-[#1a1919] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div
                onClick={() => navigate(`/user/${req.follower._id}`)}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff8f75] to-[#ff7859] flex items-center justify-center text-sm font-bold text-black cursor-pointer shrink-0"
              >
                {req.follower.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/user/${req.follower._id}`)}>
                <p className="font-bold text-sm truncate">{req.follower.name}</p>
                <p className="text-xs text-[#767575]">@{req.follower.username}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => accept(req.follower._id)}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-[#ff8f75] to-[#ff7859] text-black text-xs font-bold tracking-wider active:scale-95 transition-all"
                >
                  Accept
                </button>
                <button
                  onClick={() => reject(req.follower._id)}
                  className="px-4 py-2 rounded-full bg-[#262626] text-[#adaaaa] text-xs font-bold tracking-wider active:scale-95 transition-all"
                >
                  Decline
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
