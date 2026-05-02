import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await api.post("/auth/register", { name, email, password });
      if (res.data && res.data.user && res.data.user.token) {
        localStorage.setItem("token", res.data.user.token);
        localStorage.setItem("userId", res.data.user._id || "");
        localStorage.setItem("userRole", res.data.user.role || "user");
        localStorage.setItem("userName", res.data.user.name || "");
        localStorage.setItem("userUsername", res.data.user.username || "");
        localStorage.setItem("userEmail", res.data.user.email || "");
        localStorage.removeItem("guestUser");
        navigate("/home");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0e0e0e] text-white font-body min-h-screen flex flex-col selection:bg-[#ff8f75] selection:text-[#5f0e00]" style={{ animation: 'authPageEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
      <style>{`
        @keyframes authPageEnter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {/* Top Navigation Header */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-transparent">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => navigate('/login')}
            className="text-white hover:opacity-80 transition-opacity scale-95 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
        <div className="font-headline font-black tracking-tighter text-2xl text-white uppercase">
          GoRIDE
        </div>
        <div className="w-10"></div>
      </header>

      {/* Main Content Area with Full Screen Image */}
      <main className="flex-grow flex flex-col items-center justify-center relative pt-20 overflow-hidden">
        {/* Full Screen Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            alt="professional cyclist"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJfjpGUgBLcECriq5mdowsDlL3QoXnmmrMMNxOkWlHR49x8DdohIMIVYSY_bCCB0d4TrCBCL-UEBp1f6wVzc5QtR02xccAbWEBRcEYfojQtaEZI2iO5FG2Z8VmLWvCekcQX0vTt59e5YepCOH8ff3Csx3mtIWGoOYf0PibTGyGA75Db2q7Nerou57w07Y4tM8lR-NJmMHWBmWvVnaSbkg4I5LedUQYPuksgUl2J6NAbt3CNfENTHA3HfkUCE8qNpvuVWQCqtklSRI"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e0e]/40 to-[#0e0e0e]/95"></div>
        </div>

        <div className="relative z-10 w-full max-w-md px-8 py-10 flex flex-col items-center gap-8">
          {/* Auth Toggle Switch */}
          <div className="flex bg-[#131313]/60 backdrop-blur-md rounded-full p-1 w-full max-w-[280px]">
            <button 
              type="button"
              onClick={() => navigate('/login')}
              className="flex-1 py-3 px-6 rounded-full font-headline font-extrabold text-sm tracking-widest text-[#adaaaa] hover:text-white transition-all duration-300 ease-in-out"
            >
              LOG IN
            </button>
            <button 
              type="button"
              className="flex-1 py-3 px-6 rounded-full font-headline font-extrabold text-sm tracking-widest bg-gradient-to-r from-[#ff8f75] to-[#ff7859] text-black transition-all duration-300 ease-in-out"
            >
              SIGN UP
            </button>
          </div>

          <form onSubmit={handleRegister} className="w-full space-y-6">
            {error && (
              <div className="bg-[#ff6e84]/10 border border-[#ff6e84]/20 text-[#ff6e84] px-4 py-3 rounded-xl text-sm font-medium text-center">
                {error}
              </div>
            )}

            {/* Input Form Section */}
            <div className="w-full space-y-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-[#adaaaa] ml-4">
                  Your full name
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-[#2c2c2c]/40 border-none rounded-xl px-6 py-4 text-white placeholder:text-[#484847] focus:ring-2 focus:ring-[#ff8f75]/50 transition-all backdrop-blur-sm outline-none"
                    placeholder="Alex Rider"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-[#adaaaa] ml-4">
                  Your e-mail address
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-[#2c2c2c]/40 border-none rounded-xl px-6 py-4 text-white placeholder:text-[#484847] focus:ring-2 focus:ring-[#ff8f75]/50 transition-all backdrop-blur-sm outline-none"
                    placeholder="ride@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-[#adaaaa] ml-4">
                  Create password
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-[#2c2c2c]/40 border-none rounded-xl px-6 py-4 text-white placeholder:text-[#484847] focus:ring-2 focus:ring-[#ff8f75]/50 transition-all backdrop-blur-sm outline-none"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#adaaaa] hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-[#adaaaa] ml-4">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-[#2c2c2c]/40 border-none rounded-xl px-6 py-4 text-white placeholder:text-[#484847] focus:ring-2 focus:ring-[#ff8f75]/50 transition-all backdrop-blur-sm outline-none"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Main CTA */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-full bg-[#dc95fb] text-[#50086f] font-headline font-black text-lg tracking-widest shadow-[0px_24px_48px_rgba(255,143,117,0.1)] hover:scale-[1.02] active:scale-95 transition-all uppercase disabled:opacity-75 disabled:hover:scale-100 mt-6"
            >
              {loading ? "SIGNING UP..." : "SIGN UP"}
            </button>
          </form>

          {/* Social Login Divider */}
          <div className="flex items-center gap-4 w-full">
            <div className="h-[1px] flex-grow bg-[#484847]/30"></div>
            <span className="text-[10px] font-headline font-bold text-[#adaaaa] tracking-widest uppercase">
              Or connect with
            </span>
            <div className="h-[1px] flex-grow bg-[#484847]/30"></div>
          </div>

          {/* Social Icons */}
          <div className="flex justify-center gap-6">
            <button 
              type="button" 
              className="w-14 h-14 rounded-full flex items-center justify-center bg-[#201f1f]/80 backdrop-blur-md hover:bg-[#2c2c2c] transition-colors text-white"
            >
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                ios
              </span>
            </button>
            <button 
              type="button"
              className="w-14 h-14 rounded-full flex items-center justify-center bg-[#201f1f]/80 backdrop-blur-md hover:bg-[#2c2c2c] transition-colors text-[#1877F2]"
            >
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                social_leaderboard
              </span>
            </button>
            <button 
              type="button"
              className="w-14 h-14 rounded-full flex items-center justify-center bg-[#201f1f]/80 backdrop-blur-md hover:bg-[#2c2c2c] transition-colors text-white"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="currentColor"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"></path>
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* Footer Links Section */}
      <footer className="relative z-10 w-full py-8 flex flex-col items-center gap-4 bg-[#0e0e0e]/80 backdrop-blur-md">
        <div className="flex gap-6 text-[11px] font-['Inter'] font-medium uppercase tracking-widest text-[#adaaaa]">
          <button className="hover:text-[#ff8f75] transition-colors">Terms of use</button>
          <button className="hover:text-[#ff8f75] transition-colors">Privacy policy</button>
          <button className="hover:text-[#ff8f75] transition-colors">Copyrights</button>
        </div>
        <div className="text-[10px] text-[#767575] opacity-50 font-['Inter'] uppercase tracking-widest">
          © 2024 GoRIDE PERFORMANCE CYCLING
        </div>
      </footer>
    </div>
  );
}
