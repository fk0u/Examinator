import { component$, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import LoginForm from "~/components/auth/login-form";

// ─── Premium Awwwards-Level Login Page ───────────────────────────────

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const { animate, stagger } = await import("motion");
    
    // Complex entry animations
    animate(".premium-card" as any, 
      { y: [50, 0], opacity: [0, 1], scale: [0.95, 1], rotateX: [5, 0] }, 
      { duration: 1.2, ease: [0.16, 1, 0.3, 1] } as any
    );
    
    animate(".stagger-entrance" as any, 
      { opacity: [0, 1], y: [20, 0] }, 
      { duration: 0.8, delay: stagger(0.1), ease: "easeOut" } as any
    );

    // Continuous floating environment
    animate(".float-slow" as any, 
      { y: ["-15px", "15px"] }, 
      { duration: 6, repeat: Infinity, direction: "alternate", ease: "easeInOut" } as any
    );
    animate(".float-fast" as any, 
      { y: ["10px", "-10px"], rotate: [0, 5, -5] }, 
      { duration: 4, repeat: Infinity, direction: "alternate", ease: "easeInOut" } as any
    );
    
    // Subtle background breathing
    animate(".ambient-light" as any,
      { opacity: [0.4, 0.7, 0.4], scale: [0.9, 1.1, 0.9] },
      { duration: 15, repeat: Infinity, ease: "easeInOut" } as any
    );
  });

  return (
    <div class="font-sans relative min-h-screen w-full overflow-hidden bg-[#f8fafc] flex items-center justify-center p-4 sm:p-8 perspective-[1000px]">
      
      {/* Texture Overlay (Noise) */}
      <div class="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      {/* Advanced Ambient Mesh Gradient Background */}
      <div class="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div class="ambient-light absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-br from-primary/30 to-blue-300/20 blur-[120px]" />
        <div class="ambient-light absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-tl from-secondary/40 to-amber-200/20 blur-[100px]" style={{ animationDelay: '-5s' }} />
        <div class="ambient-light absolute top-[20%] left-[60%] w-[30vw] h-[30vw] max-w-[500px] max-h-[500px] rounded-full bg-indigo-500/15 blur-[90px]" style={{ animationDelay: '-10s' }} />
      </div>

      {/* Floating Abstract Decorative Elements (Glass Shards) */}
      <div class="fixed inset-0 z-0 pointer-events-none flex justify-center items-center">
         <div class="relative w-full max-w-[1200px] h-full h-max-[800px]">
            <div class="float-slow absolute top-[15%] right-[10%] w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rotate-12"></div>
            <div class="float-fast absolute bottom-[20%] left-[15%] w-20 h-20 rounded-full bg-gradient-to-tr from-white/40 to-white/10 backdrop-blur-xl border border-white/50 shadow-lg -rotate-12"></div>
            <div class="float-slow absolute top-[40%] left-[5%] w-12 h-12 rounded-xl bg-secondary/20 backdrop-blur-lg border border-white/30 rotate-45" style={{ animationDelay: '-2s' }}></div>
         </div>
      </div>

      {/* Main Glassmorphism Auth Card */}
      <div class="premium-card relative z-10 w-full max-w-[460px] rounded-[2.5rem] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05),_0_0_0_1px_rgba(255,255,255,0.4)_inset] overflow-hidden opacity-0">
        
        {/* Playful Top Border Glow */}
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

        <div class="px-10 py-12 flex flex-col h-full relative z-10">
          
          {/* Header / Logo Section */}
          <div class="stagger-entrance text-center mb-8">
            <div class="inline-flex items-center justify-center p-4 bg-white/80 rounded-[1.5rem] shadow-sm border border-white mb-6 group hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 transition-all duration-500 relative">
              <div class="absolute inset-0 rounded-[1.5rem] bg-primary/5 blur-md group-hover:bg-primary/20 transition-colors"></div>
              <span class="material-symbols-outlined text-4xl text-primary bg-clip-text relative z-10">view_in_ar</span>
            </div>
            <h1 class="text-[2rem] font-[800] tracking-tight text-slate-800 leading-none mb-2">
              Examinator<span class="text-primary">.</span>
            </h1>
            <p class="text-slate-500 text-sm font-medium tracking-wide">Next-Gen Assessment Platform</p>
          </div>

          <LoginForm />

        </div>
        
        {/* Footer Info */}
        <div class="stagger-entrance px-10 py-5 bg-gradient-to-b from-transparent to-white/40 border-t border-white/40 flex justify-between items-center text-[10px] font-bold text-slate-400">
          <span class="uppercase tracking-widest">© 2026 Core</span>
          <div class="flex items-center gap-2 group cursor-pointer">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span class="text-slate-500 group-hover:text-slate-800 transition-colors">System Online</span>
          </div>
          <span class="uppercase tracking-widest text-primary/70">vX.Elite</span>
        </div>

      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Examinator - Portal Masuk",
  meta: [
    { name: "description", content: "Platform Ujian Premium" },
  ],
};
