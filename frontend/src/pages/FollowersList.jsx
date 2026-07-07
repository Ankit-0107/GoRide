import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function FollowersList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchFollowers = async () => {
    try {
      const res = await api.get(`/profile/followers/${id}`);
      if (res.data.success) {
        setUsers(res.data.users);
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
        <h1 className="ml-4 font-bold text-xl">Followers</h1>
      </header>
      <main className="w-full max-w-7xl mx-auto pt-24 px-6 space-y-3 pb-10">
        {loading ? (
          <div className="text-center text-[#adaaaa] pt-10">Loading...</div>
        ) : users.length === 0 ? (
          <div className="text-center text-[#adaaaa] pt-10">No followers yet</div>
        ) : (
          users.map(u => (
            <div key={u._id} onClick={() => navigate(`/user/${u._id}`)} className="bg-[#1a1919] p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-[#201f1f]">
               <div className="w-10 h-10 rounded-full bg-[#201f1f] flex items-center justify-center font-bold">
                  {u.avatar ? <img src={u.avatar} alt="avatar" className="w-full h-full rounded-full" /> : u.name.charAt(0)}
               </div>
               <div>
                  <p className="font-bold text-sm">{u.name}</p>
                  <p className="text-xs text-[#adaaaa]">@{u.username}</p>
               </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
