import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white font-body selection:bg-[#ff8f75] selection:text-[#5f0e00] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-[#ff8f75]/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-float"></div>
      <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-[#e6a7ff]/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="text-center z-10 space-y-6 max-w-md w-full">
        <div className="w-24 h-24 mx-auto bg-[#1a1a1a] border border-[#333] rounded-full flex items-center justify-center mb-8 shadow-[0px_4px_24px_rgba(255,143,117,0.15)]">
          <span className="material-symbols-outlined text-[#ff8f75] text-5xl">rocket_launch</span>
        </div>

        <h1 className="font-headline font-black text-4xl tracking-tight text-white uppercase">
          Coming <span className="gradient-text">Soon</span>
        </h1>
        
        <p className="text-[#adaaaa] text-base leading-relaxed">
          We're working hard to bring this feature to you. Stay tuned for exciting updates!
        </p>

        <div className="pt-8">
          <button
            onClick={() => navigate('/home')}
            className="w-full h-14 bg-[#1a1a1a] hover:bg-[#2c2c2c] text-white font-headline font-bold text-sm tracking-widest uppercase rounded-full border border-[#333] transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
