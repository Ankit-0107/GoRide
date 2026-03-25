// src/pages/CommunityChat.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/api";

export default function CommunityChat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'community';
  const targetId = searchParams.get('targetId') || 'global';
  const title = searchParams.get('title') || 'Global Community';

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  
  const messagesEndRef = useRef(null);

  // Fetch current user
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    } else {
      api.get("/auth/me").then((res) => setCurrentUser({
        id: res.data._id || res.data.id,
        name: res.data.name
      })).catch(console.error);
    }
  }, []);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/messages?type=${type}&targetId=${targetId}`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Simple polling for new messages every 3s
    const int = setInterval(fetchMessages, 3000);
    return () => clearInterval(int);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, targetId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      const res = await api.post('/chat/messages', {
        type,
        targetId,
        content: newMessage.trim()
      });
      if (res.data.success) {
        setMessages([...messages, res.data.message]);
        setNewMessage("");
      }
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ minHeight: "max(884px, 100dvh)" }}>
      {/* TopAppBar */}
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 bg-[#0e0e0e]/60 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <button
            className="hover:bg-[#2c2c2c] transition-colors p-2 rounded-full active:scale-95 duration-200"
            onClick={() => navigate("/community")}
          >
            <span className="material-symbols-outlined text-[#ff8f75]">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <h1 className="font-headline font-bold tracking-tight text-xl text-[#ff8f75]">
              {title}
            </h1>
            <p className="text-[10px] font-medium text-[#adaaaa] uppercase tracking-widest">
              {type === 'ride' ? 'Active Ride' : type === 'user' ? 'Direct Message' : 'Public Group'}
            </p>
          </div>
        </div>
        <button className="hover:bg-[#2c2c2c] transition-colors p-2 rounded-full active:scale-95 duration-200">
          <span className="material-symbols-outlined text-[#ff8f75]">groups</span>
        </button>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 mt-20 px-4 space-y-6 mb-16">
        {/* Ongoing Session Card - only show for rides */}
        {type === 'ride' && (
          <section className="bg-surface-container rounded-lg p-5 border border-outline-variant/10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff8f75] to-[#ff7859] flex items-center justify-center shadow-[0_8px_20px_rgba(255,143,117,0.3)]">
                  <span className="material-symbols-outlined text-black font-bold">directions_bike</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-[#ff6e84]/20 text-[#ff6e84] px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      Live
                    </span>
                  </div>
                  <h2 className="font-headline font-semibold text-white mt-1">{title}</h2>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                className="flex-1 bg-gradient-to-r from-[#ff8f75] to-[#ff7859] text-black font-bold py-3 rounded-xl active:scale-95 transition-all text-sm"
                onClick={() => navigate(`/ride-active/${targetId}`)}
              >
                View Ride
              </button>
            </div>
          </section>
        )}

        {/* Chat Thread */}
        <section className="space-y-6 flex flex-col pb-6">
          {messages.length === 0 ? (
            <div className="text-center text-[#adaaaa] py-10 text-sm">
              No messages yet. Send a message to start the conversation!
            </div>
          ) : (
            messages.map((msg) => {
              // Compare IDs correctly whether they are Objects or plain Strings
              const currentUserId = currentUser?._id || currentUser?.id || currentUser?.user?.id;
              const isMine = msg.senderId === currentUserId;

              if (isMine) {
                return (
                  <div key={msg._id} className="flex flex-col items-end gap-1 self-end max-w-[85%]">
                    <div className="bg-gradient-to-br from-[#ff8f75] to-[#ff7859] text-black p-4 rounded-2xl rounded-br-none shadow-[0_4px_12px_rgba(255,143,117,0.15)]">
                      <p className="text-sm font-medium leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 mr-1">
                      <span className="text-[10px] text-[#adaaaa]">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`material-symbols-outlined text-[14px] ${msg.read ? 'text-[#ff8f75]' : 'text-[#adaaaa]'}`}>
                        done_all
                      </span>
                    </div>
                  </div>
                );
              }

              // Other user message
              return (
                <div key={msg._id} className="flex items-end gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2c2c2c] flex-shrink-0">
                    {/* Default profile photo generated from initials */}
                    <img
                      alt={msg.senderName}
                      className="w-full h-full object-cover opacity-80"
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}&background=2c2c2c&color=ff8f75`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-[#adaaaa] ml-2">{msg.senderName}</span>
                    <div className="bg-[#201f1f] text-white p-4 rounded-2xl rounded-bl-none">
                      <p className="text-sm leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </section>
      </main>

      {/* Chat Input Area (Fixed) */}
      <div className="fixed left-0 w-full px-4 z-40 bottom-4">
        <form onSubmit={handleSend} className="bg-[#201f1f] rounded-full p-2 flex items-center gap-2 border border-[#484847]/30 shadow-2xl">
          <button type="button" className="w-10 h-10 flex items-center justify-center text-[#adaaaa] hover:text-white transition-colors">
            <span className="material-symbols-outlined">add</span>
          </button>
          <input
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-[#adaaaa] py-2 outline-none"
            placeholder="Type your message..."
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="w-10 h-10 bg-gradient-to-br from-[#ff8f75] to-[#ff7859] rounded-full flex items-center justify-center text-black active:scale-90 transition-transform disabled:opacity-50"
          >
            <span className="material-symbols-outlined font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
              send
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
