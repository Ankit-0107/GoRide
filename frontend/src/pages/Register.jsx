import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import api from "../api/api";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (!name || !username || !email || !password) {
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
      const res = await api.post("/auth/register", { name, username, email, password });
      if (res.data && res.data.user && res.data.user.token) {
        const user = res.data.user;
        localStorage.setItem("token", user.token);
        localStorage.setItem('userRole', user.role || 'user');
        localStorage.setItem('userName', user.name || '');
        localStorage.setItem('userUsername', user.username || '');
        localStorage.setItem('userEmail', user.email || '');
        localStorage.removeItem("guestUser");
        navigate("/home");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError("");
        const res = await api.post("/auth/google", { token: tokenResponse.access_token });
        if (res.data && res.data.user && res.data.user.token) {
          const user = res.data.user;
          localStorage.setItem("token", user.token);
          localStorage.setItem('userRole', user.role || 'user');
          localStorage.setItem('userName', user.name || '');
          localStorage.setItem('userUsername', user.username || '');
          localStorage.setItem('userEmail', user.email || '');
          localStorage.removeItem("guestUser");
          navigate("/home");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Google signup failed");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError("Google Signup failed");
    }
  });

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


      {/* Main Content Area with Full Screen Image */}
      <main className="flex-grow flex flex-col items-center justify-center relative overflow-hidden">
        {/* Full Screen Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            alt="professional cyclist"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJfjpGUgBLcECriq5mdowsDlL3QoXnmmrMMNxOkWlHR49x8DdohIMIVYSY_bCCB0d4TrCBCL-UEBp1f6wVzc5QtR02xccAbWEBRcEYfojQtaEZI2iO5FG2Z8VmLWvCekcQX0vTt59e5YepCOH8ff3Csx3mtIWGoOYf0PibTGyGA75Db2q7Nerou57w07Y4tM8lR-NJmMHWBmWvVnaSbkg4I5LedUQYPuksgUl2J6NAbt3CNfENTHA3HfkUCE8qNpvuVWQCqtklSRI"
          />
          <div className="absolute inset-0 bg-[#0e0e0e]/80 backdrop-blur-[4px]"></div>
          {/* Floating Orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#ff8f75]/20 rounded-full blur-[80px] animate-float pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#e6a7ff]/10 rounded-full blur-[80px] animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 w-full max-w-md px-8 py-10 flex flex-col items-center gap-8 glass-card rounded-[2rem] glow-border shadow-2xl mx-4 mb-8">
          {/* GoRIDE Title */}
          <div className="font-headline font-black tracking-tighter text-2xl uppercase gradient-text animate-pulse duration-1000 text-center">
            GoRIDE
          </div>

          {/* Auth Toggle Switch */}
          <div className="flex justify-center mb-4 w-full">
            <div className="bg-[#2c2c2c]/40 backdrop-blur-xl p-1.5 rounded-full flex gap-1 border border-white/10 relative w-full">
              <div className="absolute inset-y-1.5 right-1.5 w-[calc(50%-6px)] bg-gradient-brand rounded-full transition-transform duration-300 shadow-[0_0_15px_rgba(255,143,117,0.3)]"></div>
              <button 
                type="button"
                onClick={() => navigate('/login')}
                className="relative z-10 flex-1 py-2.5 rounded-full text-sm font-bold tracking-widest text-[#adaaaa] hover:text-white transition-all duration-300 ease-in-out uppercase font-headline"
              >
                LOG IN
              </button>
              <button 
                type="button"
                className="relative z-10 flex-1 py-2.5 rounded-full text-sm font-bold tracking-widest text-black transition-all duration-300 ease-in-out uppercase font-headline"
              >
                SIGN UP
              </button>
            </div>
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
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-6 py-4 text-white placeholder:text-[#484847] focus:ring-2 focus:ring-[#ff8f75] focus:bg-[#1a1a1a] transition-all outline-none"
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
                  Choose a username
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-6 py-4 text-white placeholder:text-[#484847] focus:ring-2 focus:ring-[#ff8f75] focus:bg-[#1a1a1a] transition-all outline-none"
                    placeholder="@rider_name"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-6 py-4 text-white placeholder:text-[#484847] focus:ring-2 focus:ring-[#ff8f75] focus:bg-[#1a1a1a] transition-all outline-none"
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
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-6 py-4 text-white placeholder:text-[#484847] focus:ring-2 focus:ring-[#ff8f75] focus:bg-[#1a1a1a] transition-all outline-none"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#adaaaa] hover:text-[#ff8f75] transition-transform hover:rotate-12"
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
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-6 py-4 text-white placeholder:text-[#484847] focus:ring-2 focus:ring-[#ff8f75] focus:bg-[#1a1a1a] transition-all outline-none"
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
              className="w-full py-5 rounded-full bg-gradient-brand text-black font-headline font-black text-lg tracking-widest glow-shadow hover:brightness-110 active:scale-[0.98] transition-all uppercase disabled:opacity-50 mt-6"
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
              onClick={() => loginWithGoogle()}
              className="w-14 h-14 rounded-full glass-card flex items-center justify-center hover:bg-[#2c2c2c]/60 transition-all active:scale-90 hover-glow-shadow"
            >
              <img
                alt="Google"
                className="w-6 h-6 grayscale brightness-200 contrast-200"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDt5R2p_mq__oM_p_XNifjzNfyzpBadHRQd7cNp_YbOKs2cuu8p59mrx2bT5eSCKsVQ5MkYxEFGH3cr6g6MSNM6QtT6Doi4Xx-Us-4ruTkClgstKDliUWNra7Ra0XqHELUinOXOfUVOtm9fmRvRqO_OZ35Ut05yECSMMTx7FI7i2LeHoOmejqTW_q5c67vPe9S3QvmdmQl4hqd3NRLqvJ5UWknQl5fghejzG0G6xEjfb1AkvP_mfmxXPmUutOH83RP6FejB35HMXDQ"
              />
            </button>
            <button 
              type="button" 
              className="w-14 h-14 rounded-full glass-card flex items-center justify-center hover:bg-[#2c2c2c]/60 transition-all active:scale-90 hover-glow-shadow"
            >
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                ios
              </span>
            </button>
            <button 
              type="button"
              className="w-14 h-14 rounded-full glass-card flex items-center justify-center hover:bg-[#2c2c2c]/60 transition-all active:scale-90 hover-glow-shadow"
            >
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                social_leaderboard
              </span>
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
