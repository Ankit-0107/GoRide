import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        localStorage.removeItem("guestUser");
        window.location.href = "/home";
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#050505] font-body text-white flex flex-col items-center min-h-screen selection:bg-[#ff8f75]/30">
      <style>{`
        .primary-gradient {
            background: linear-gradient(135deg, #ff8f75 0%, #ff5e3a 100%);
        }
        .glow-border {
            position: relative;
        }
        .glow-border::after {
            content: '';
            position: absolute;
            inset: -1px;
            background: linear-gradient(180deg, rgba(255, 143, 117, 0.3) 0%, rgba(255, 143, 117, 0) 40%, rgba(255, 143, 117, 0.05) 100%);
            border-radius: inherit;
            z-index: -1;
            pointer-events: none;
        }
        .hero-mask {
            mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
            -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
        }
      `}</style>
      
      {/* Header */}
      <header className="w-full max-w-md flex items-center justify-end px-6 py-8 z-20">
        <button 
          className="text-xs font-semibold text-[#949494] hover:text-white transition-colors"
          onClick={() => {
            localStorage.setItem("token", "guest-token");
            localStorage.setItem("guestUser", "true");
            window.location.href = "/home";
          }}
        >
          SKIP
        </button>
      </header>

      <main className="w-full max-w-md flex flex-col items-center px-6 pb-12 relative">
        {/* Perplexity-style Hero Image */}
        <div className="fixed top-0 left-0 right-0 h-[55vh] w-full overflow-hidden hero-mask z-0">
          <img alt="cyclist" className="w-full h-full object-cover grayscale opacity-40 brightness-75 contrast-125" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGRPecQAUlj161_PQ-lqgWUcSlGMMvms7IgnT3LZF7ZKHAikssAv7GDH6z8IrOEOZGXSyiu2N03ppGi5rYbjbPfdUK-dQCcm7oXApYnjDbWiP5BRMRtEAsdY53pD1vcAZpFiQVscE6O_-mqP8I8kppxcq3fcqZkrWK5wC12QFH_YQ4bJDI3Y8exrTbndvCtnno68z-Vyf07Zr_scoV0L589CPjxqFoMJw79zMEVN_CV8Vj36s5xfHKoQqGyJqaWn9hLCIoEEm9WEk"/>
        </div>

        {/* Content Container */}
        <div className="w-full mt-[20vh] z-10 space-y-12">
          {/* Typography Focus */}
          <div className="text-center space-y-3">
            <p className="text-[#ff8f75] font-['Plus_Jakarta_Sans'] text-[10px] tracking-[0.4em] uppercase font-bold">Performance Fuel</p>
            <h1 className="text-4xl font-['Plus_Jakarta_Sans'] font-bold tracking-tight">GoRide.</h1>
          </div>

          {/* Login Inputs & CTAs */}
          <div className="space-y-4">
            {/* Social Buttons */}
            <div className="space-y-3">
              <button className="w-full h-14 bg-white text-black rounded-full flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all font-semibold text-sm active:scale-[0.98]">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.96.95-2.04 1.44-3.23 1.47-1.15.03-2.1-.33-2.85-.33-.76 0-1.87.36-2.85.33-1.19-.03-2.27-.52-3.23-1.47-2-2-2.58-5.33-1.44-8.1 1.13-2.73 3.94-4.47 7-4.47 1.05 0 2.05.37 2.85.37.8 0 2.1-.37 3.35-.37 1.3 0 2.4.47 3.25 1.3-2.6 1.53-2.18 5.4.42 6.5-1.05 2.53-2.38 5.08-3.27 6.3zM14.6 3.6c0 1.9-1.57 3.53-3.4 3.53-.13 0-.27-.01-.39-.03.1-.22.18-.45.18-.69 0-1.8-1.46-3.46-3.3-3.46.12 0 .25.01.37.02 1.63.15 3.03 1.4 3.3 3.02 1.54-.15 2.92-1.25 3.24-2.39z" fill="currentColor"></path>
                </svg>
                Continue with Apple
              </button>
              <button className="w-full h-14 bg-white text-black rounded-full flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all font-semibold text-sm active:scale-[0.98]">
                <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-YzgSWU8EYLRYMw5ZbCeS5z7Hib9nvVsXvPYFAdf6NlYbjM_Kt-n8ZmBxjcbQlVfDO0X8DnQ57EgOcEaQ_1WDKefyYiXn0VKdGYVNaKV4e_QuenKRk9ZfW6WccSfFTcstrigekOU1sJe91iVOZOZffhMrr0MySSmbRCD1wJiLGTDZ7e-jEW65-RH3C-0C9QRaQS2aGG6rxgNwHpRnxtf64pBkNVmji4cf5E4n6jwNSvn6v6ymkDpEFYkgWysAxAItsbM-39Netco"/>
                Continue with Google
              </button>
            </div>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-[#2a2a2a]"></div>
              <span className="flex-shrink mx-4 text-[9px] text-[#949494] tracking-[0.3em] font-bold">OR</span>
              <div className="flex-grow border-t border-[#2a2a2a]"></div>
            </div>

            {/* Main Form (Minimalist with Glow) */}
            <form className="space-y-4" onSubmit={handleLogin}>
              {error && (
                <div className="bg-[#a70138]/20 px-6 py-3 rounded-lg border border-[#a70138]/20">
                  <p className="text-[#ffb2b9] text-sm font-bold text-center">{error}</p>
                </div>
              )}
              <div className="space-y-3">
                <div className="glow-border rounded-[0.75rem] bg-[#121212]">
                  <input className="w-full h-14 bg-transparent border-none outline-none focus:ring-0 text-sm px-6 placeholder:text-zinc-600 text-white" placeholder="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="glow-border rounded-[0.75rem] bg-[#121212]">
                  <input className="w-full h-14 bg-transparent border-none outline-none focus:ring-0 text-sm px-6 placeholder:text-zinc-600 text-white" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>
              
              <div className="flex justify-center">
                <a className="text-[11px] text-[#949494] hover:text-[#ff8f75] font-medium tracking-wide uppercase transition-colors" href="/forgot-password">Forgot password?</a>
              </div>

              <button 
                className="w-full h-14 primary-gradient rounded-full font-['Plus_Jakarta_Sans'] font-bold text-sm tracking-[0.15em] uppercase text-black active:scale-[0.97] transition-all shadow-xl shadow-[#ff8f75]/10 disabled:opacity-75"
                type="submit"
                disabled={loading}
              >
                {loading ? "SIGNING IN..." : "SIGN IN"}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center z-10">
          <p className="text-xs text-[#949494] font-medium">
            Don't have an account? 
            <a className="text-[#ff8f75] font-bold ml-1 hover:underline underline-offset-4" href="/register">Sign Up</a>
          </p>
          <div className="mt-8 flex justify-center gap-6 text-[10px] text-zinc-600 font-semibold tracking-wider uppercase">
            <a className="hover:text-zinc-400" href="/privacy">Privacy Policy</a>
            <a className="hover:text-zinc-400" href="/terms">Terms of Service</a>
          </div>
        </footer>
      </main>

      {/* Noise Texture Overlay */}
      <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.02] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" type="fractalNoise"></feTurbulence>
          </filter>
          <rect filter="url(#noise)" height="100%" width="100%"></rect>
        </svg>
      </div>
    </div>
  );
}
