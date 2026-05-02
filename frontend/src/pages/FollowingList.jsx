import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";

export default function FollowingList() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await api.get(`/profile/following/${id}`);
        if (res.data.success) setUsers(res.data.following);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowing();
  }, [id]);

  return (
    <div className="bg-[#0e0e0e] text-white font-body min-h-screen">
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 backdrop-blur-xl bg-[#0e0e0e]/80 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="text-white hover:text-[#ff8f75] transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-bold text-sm tracking-wider uppercase">Following</h1>
        <div className="w-6"></div>
      </header>
      <main className="max-w-xl mx-auto px-6 pt-20 space-y-2">
        {loading ? (
          <div className="text-center text-[#adaaaa] py-12 animate-pulse">Loading...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-[#adaaaa] text-sm">Not following anyone yet</div>
        ) : (
          users.map((u) => (
            <div
              key={u._id}
              onClick={() => navigate(`/user/${u._id}`)}
              className="bg-[#1a1919] border border-white/5 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-[#201f1f] transition-colors active:scale-[0.98]"
            >
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#e6a7ff] to-[#ff8f75] flex items-center justify-center text-sm font-bold text-black shrink-0">
                  {u.name?.charAt(0)?.toUpperCase()}
                </div>
                {u.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#34d399] rounded-full border-2 border-[#1a1919]"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{u.name}</p>
                <p className="text-xs text-[#767575]">@{u.username}</p>
              </div>
              <span className="material-symbols-outlined text-[#767575] text-lg">chevron_right</span>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
