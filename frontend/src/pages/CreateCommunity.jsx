// src/pages/CreateCommunity.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function CreateCommunity() {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loadingStr, setLoadingStr] = useState("Loading rides...");
  
  const [selectedRide, setSelectedRide] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [communityName, setCommunityName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    // Fetch user's created rides
    const fetchMyRides = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userObj = JSON.parse(userStr);
          const nameToSearch = userObj.name || userObj.user?.name;
          if (nameToSearch) {
            const res = await api.get(`/rides/my?createdByName=${encodeURIComponent(nameToSearch)}`);
            if (res.data.success) {
              setRides(res.data.rides || []);
              if (res.data.rides?.length === 0) setLoadingStr("No rides found. Create a campaign first.");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching my rides:", error);
        setLoadingStr("Failed to load rides");
      }
    };
    fetchMyRides();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRide || !communityName.trim() || !description.trim()) {
      alert("Please fill all fields and select a ride.");
      return;
    }
    // TODO: implement community creation API
    alert(`Community "${communityName}" created around ride "${selectedRide.title || selectedRide.rideName}"!`);
    navigate('/community');
  };

  return (
    <div className="bg-[#0e0e0e] text-white min-h-[max(884px,100dvh)] font-body selection:bg-primary/30 pb-12">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#0e0e0e] border-b border-white/5 flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/community")}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-xl tracking-tight text-white">Create Community</h1>
        </div>
        <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden ring-2 ring-[#ff8f75]/20">
          <img 
            className="w-full h-full object-cover" 
            alt="User profile" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4KnEEoBWYZ1APXDk0vZE-IXxqiwcwTDjC1ROhY2e_14qF0jbI6vuyHClAkBV6FPJN8XRQcOJCO-ZOyD6kxSgnIcXzQA3-ZTP4ukZmchixEnNgesrT1Q-xtVVsQhW_FWSTJYlcEvnl-00E3zyz5Qu0VyGbdHIwFTkEEPxAPut6NAlv3dx-dYAek-7ZJ-EQtggEj4ycGetsAF0SQ8zX48j0ri_fj3r9GQETe8DHIheIt6JcRPkrFDjvz0ixTxG2GsTiQIdVXmCY_As"
          />
        </div>
      </header>

      <main className="px-6 max-w-2xl mx-auto space-y-10 pt-20">
        {/* Hero Section/Visual */}
        <section className="relative h-48 w-full rounded-xl overflow-hidden mb-8 group">
          <img 
            className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-700" 
            alt="scenic coastal road" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcH2OY0uSdGx0ZMbF6mOEtPhLjx1BV3OiWRvGnYHu2WB5z2I4a5r-RwEU_INPWpRqRyA6tH7TPl0-s8EsjohYVOtyv-vjtvlgR_VOWNxVBU6OpUlif6rVu9Tse8tabGkPAerXDtNfIPYwZKx7QGjqR0q989_N63SeHB2HYBZVowWWgDqHm_NHG91NpnLEkP5-8oxOdC7oZMmcZReubqBzddkSmFSo5wgSgEvKbtARnLiqoARuYqzdIiiPcHPRfgFgKShv_5rrkQik"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent"></div>
          <div className="absolute bottom-4 left-6">
            <span className="bg-[#ff8f75]/20 text-[#ff8f75] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#ff8f75]/30">New Tribe</span>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Select Ride */}
          <div className="space-y-3" ref={dropdownRef}>
            <label className="font-headline font-bold text-lg tracking-tight px-1">Select Ride</label>
            <div className="relative">
              <div 
                className={`bg-[#2c2c2c]/40 backdrop-blur-md rounded-lg p-5 flex items-center justify-between cursor-pointer border border-[#484847]/40 hover:border-[#ff8f75]/40 transition-all duration-300 group ${isDropdownOpen ? 'ring-2 ring-[#ff8f75]/50 bg-[#2c2c2c]' : 'active:scale-[0.98]'}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-[#ff7859]/20 p-3 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#ff8f75]">directions_bike</span>
                  </div>
                  <div>
                    {selectedRide ? (
                      <>
                        <p className="font-bold text-white">{selectedRide.title || selectedRide.rideName}</p>
                        <p className="text-[#adaaaa] text-sm hidden sm:block">
                          {selectedRide.difficulty ? selectedRide.difficulty.charAt(0).toUpperCase() + selectedRide.difficulty.slice(1) : "All Levels"}
                        </p>
                      </>
                    ) : (
                      <p className="font-bold text-[#adaaaa]">Choose a campaign</p>
                    )}
                  </div>
                </div>
                <span className={`material-symbols-outlined text-[#adaaaa] group-hover:text-[#ff8f75] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </div>

              {/* Custom Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1919] border border-[#484847]/40 rounded-lg shadow-2xl z-20 overflow-hidden">
                  {rides.length === 0 ? (
                    <div className="p-4 text-center text-[#adaaaa] text-sm">
                      {loadingStr}
                    </div>
                  ) : (
                    <ul className="max-h-[220px] overflow-y-auto custom-scrollbar">
                      {rides.map(ride => (
                        <li 
                          key={ride._id}
                          className={`p-4 hover:bg-[#2c2c2c] cursor-pointer border-b border-white/5 last:border-0 transition-colors ${selectedRide?._id === ride._id ? 'bg-[#ff8f75]/10 border-l-4 border-l-[#ff8f75]' : 'border-l-4 border-l-transparent'}`}
                          onClick={() => {
                            setSelectedRide(ride);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <p className="font-bold text-white">{ride.title || ride.rideName}</p>
                          <p className="text-[#adaaaa] text-xs mt-1 truncate">{ride.description || "No description provided."}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Community Name */}
          <div className="space-y-3">
            <label className="font-headline font-bold text-lg tracking-tight px-1">Community Name</label>
            <div className="relative">
              <input 
                className="w-full bg-[#262626] border-none rounded-lg p-5 text-white placeholder:text-[#adaaaa] focus:ring-2 focus:ring-[#ff8f75]/50 focus:bg-[#2c2c2c] transition-all outline-none" 
                placeholder="Enter Name" 
                type="text"
                value={communityName}
                onChange={(e) => setCommunityName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="font-headline font-bold text-lg tracking-tight px-1">Description</label>
            <textarea 
              className="w-full bg-[#262626] border-none rounded-lg p-5 text-white placeholder:text-[#adaaaa] focus:ring-2 focus:ring-[#ff8f75]/50 focus:bg-[#2c2c2c] transition-all outline-none resize-none" 
              placeholder="Tell us about this tribe..." 
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          {/* Privacy Toggle section removed entirely as per user request */}

          {/* Action Button */}
          <div className="pt-6">
            <button 
              type="submit"
              className="w-full py-5 rounded-full bg-gradient-to-br from-[#ff8f75] to-[#ff7859] text-black font-extrabold text-lg uppercase tracking-wider shadow-[0_8px_24px_rgba(255,143,117,0.2)] hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              Create Community
            </button>
          </div>
        </form>
      </main>

      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1919;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #484847;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #767575;
        }
      `}</style>
    </div>
  );
}
