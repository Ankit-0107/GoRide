import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import api from "../api/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both fields");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await api.post("/auth/login", { email, password });
      if (res.data && res.data.user && res.data.user.token) {
        localStorage.setItem("token", res.data.user.token);
        localStorage.setItem("userRole", res.data.user.role || "user");
        localStorage.setItem("userName", res.data.user.name || "");
        localStorage.setItem("userUsername", res.data.user.username || "");
        localStorage.setItem("userEmail", res.data.user.email || "");
        localStorage.removeItem("guestUser");
        window.location.href = "/home";
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
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
          localStorage.setItem("token", res.data.user.token);
          localStorage.setItem("userRole", res.data.user.role || "user");
          localStorage.setItem("userName", res.data.user.name || "");
          localStorage.setItem("userUsername", res.data.user.username || "");
          localStorage.setItem("userEmail", res.data.user.email || "");
          localStorage.removeItem("guestUser");
          window.location.href = "/home";
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Google login failed");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError("Google Login failed");
    }
  });

  return (
    <div className="bg-[#0e0e0e] text-white font-body min-h-screen selection:bg-[#ff8f75] selection:text-[#5f0e00]" style={{ animation: 'authPageEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
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

      <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Full Screen Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            alt="cyclist riding city"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJfjpGUgBLcECriq5mdowsDlL3QoXnmmrMMNxOkWlHR49x8DdohIMIVYSY_bCCB0d4TrCBCL-UEBp1f6wVzc5QtR02xccAbWEBRcEYfojQtaEZI2iO5FG2Z8VmLWvCekcQX0vTt59e5YepCOH8ff3Csx3mtIWGoOYf0PibTGyGA75Db2q7Nerou57w07Y4tM8lR-NJmMHWBmWvVnaSbkg4I5LedUQYPuksgUl2J6NAbt3CNfENTHA3HfkUCE8qNpvuVWQCqtklSRI"
          />
          <div className="absolute inset-0 bg-[#0e0e0e]/80 backdrop-blur-[4px]"></div>
          {/* Floating Orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#ff8f75]/20 rounded-full blur-[80px] animate-float pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#e6a7ff]/10 rounded-full blur-[80px] animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Login Container */}
        <div className="relative z-10 w-full max-w-md px-8 py-12 flex flex-col gap-8 glass-card rounded-[2rem] glow-border mt-8 shadow-2xl mx-4">
          {/* GoRIDE Title */}
          <h1 className="text-3xl font-black tracking-tighter uppercase font-headline gradient-text text-center mb-2">GoRIDE</h1>
          {/* Auth Toggle */}
          <div className="flex justify-center mb-4">
            <div className="bg-[#2c2c2c]/40 backdrop-blur-xl p-1.5 rounded-full flex gap-1 border border-white/10 relative">
              <div className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] bg-gradient-brand rounded-full transition-transform duration-300 shadow-[0_0_15px_rgba(255,143,117,0.3)]"></div>
              <button 
                type="button"
                className="relative z-10 px-8 py-2.5 rounded-full text-sm font-bold tracking-widest text-black transition-all duration-300 ease-in-out uppercase font-headline"
              >
                LOG IN
              </button>
              <button 
                type="button"
                onClick={() => navigate('/register')}
                className="relative z-10 px-8 py-2.5 rounded-full text-sm font-bold tracking-widest text-[#adaaaa] hover:text-white transition-all duration-300 ease-in-out uppercase font-headline"
              >
                SIGN UP
              </button>
            </div>
          </div>

          {/* Header Content */}
          <div className="text-center space-y-2">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight font-headline text-white uppercase">
              Welcome back
            </h2>
            <p className="text-[#adaaaa] text-lg">Enter your details below</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="bg-[#ff6e84]/10 border border-[#ff6e84]/20 text-[#ff6e84] px-4 py-3 rounded-xl text-sm font-medium text-center">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-[#adaaaa] ml-4 font-headline">
                Your e-mail address
              </label>
              <div className="relative">
                <input
                  className="w-full bg-[#1a1a1a] border border-[#333] focus:ring-2 focus:ring-[#ff8f75] focus:bg-[#1a1a1a] rounded-xl px-6 py-5 text-white placeholder:text-[#adaaaa]/50 transition-all outline-none"
                  placeholder="example@goride.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-[#adaaaa] ml-4 font-headline">
                Your password
              </label>
              <div className="relative">
                <input
                  className="w-full bg-[#1a1a1a] border border-[#333] focus:ring-2 focus:ring-[#ff8f75] focus:bg-[#1a1a1a] rounded-xl px-6 py-5 text-white placeholder:text-[#adaaaa]/50 transition-all outline-none"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#adaaaa] hover:text-[#ff8f75] transition-transform hover:rotate-12"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="w-full bg-gradient-brand text-black py-5 rounded-full font-black text-lg tracking-widest hover:brightness-110 active:scale-[0.98] transition-all uppercase font-headline mt-4 glow-shadow disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? "LOGGING IN..." : "LOG IN"}
            </button>
            <div className="text-center pt-2">
              <button type="button" className="text-[#adaaaa] hover:text-[#ff8f75] text-sm font-medium transition-colors border-b border-transparent hover:border-[#ff8f75] pb-0.5">
                Forgot password?
              </button>
            </div>
          </form>

          {/* Social Logins */}
          <div className="mt-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-xs font-bold text-[#adaaaa]/60 uppercase tracking-widest font-headline">
                OR CONTINUE WITH
              </span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

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
        </div>
      </main>
    </div>
  );
}
