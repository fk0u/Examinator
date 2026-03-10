import { component$, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import LoginForm from "~/components/auth/login-form";

// ─── Immersive Split-Screen Login Page ───────────────────────────────

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const { animate, stagger } = await import("motion");
    
    // Left side illustrations animations
    animate(".floating-element-1" as any, 
      { y: ["-20px", "20px"], rotate: [-5, 5] }, 
      { duration: 5, repeat: Infinity, direction: "alternate", ease: "easeInOut" } as any
    );
    animate(".floating-element-2" as any, 
      { y: ["25px", "-25px"], rotate: [10, -5] }, 
      { duration: 7, repeat: Infinity, direction: "alternate", ease: "easeInOut" } as any
    );
    animate(".floating-element-3" as any, 
      { scale: [0.9, 1.1], opacity: [0.6, 1] }, 
      { duration: 4, repeat: Infinity, direction: "alternate", ease: "easeInOut" } as any
    );

    // Right side form staggered entrance
    animate(".stagger-in" as any, 
      { opacity: [0, 1], x: [30, 0] }, 
      { duration: 0.8, delay: stagger(0.15), ease: [0.16, 1, 0.3, 1] } as any
    );
  });

  return (
    <div class="font-sans min-h-screen w-full flex bg-white overflow-hidden">
      
      {/* ─── LEFT PANEL (Brand & Abstract Illustration) ─── */}
      <div class="relative hidden lg:flex w-[55%] xl:w-[60%] flex-col justify-between overflow-hidden bg-[#f8fafc] p-12 lg:p-16 border-r border-slate-100">
        
        {/* Soft Ambient Background Gradients */}
        <div class="absolute inset-0 z-0 pointer-events-none">
          <div class="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] rounded-full bg-gradient-to-br from-primary/30 to-blue-300/10 blur-[130px]" />
          <div class="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-tl from-secondary/40 to-yellow-200/20 blur-[120px]" />
        </div>
        
        {/* Noise Texture */}
        <div class="pointer-events-none fixed inset-0 z-10 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

        {/* Top Header */}
        <div class="relative z-20">
          <div class="inline-flex items-center justify-center p-3.5 bg-white/60 backdrop-blur-md rounded-[1.25rem] shadow-sm border border-white mb-8 group transition-transform duration-500 hover:scale-105 hover:shadow-primary/20 hover:shadow-xl">
            <span class="material-symbols-outlined text-[32px] text-primary transition-transform duration-500 group-hover:rotate-12">view_in_ar</span>
          </div>
          <h1 class="text-[3.5rem] leading-[1.1] font-[800] text-slate-900 tracking-tight">
            Elevating the standard of <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">digital assessments.</span>
          </h1>
          <p class="mt-6 text-slate-500 font-medium text-lg max-w-xl leading-relaxed">
            A state-of-the-art Computer-Based Test platform integrating powerful proctoring, seamless performance, and awe-inspiring aesthetic design.
          </p>
        </div>

        {/* Abstract Illustration Composition (IRA Design Style) */}
        <div class="relative z-20 flex-1 w-full flex items-center justify-center mt-12 mb-8">
           <div class="relative w-full max-w-[600px] aspect-[4/3]">
              {/* Main Glass Morphic Card */}
              <div class="floating-element-1 absolute top-[10%] left-[10%] w-[70%] h-[65%] rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex items-center justify-center">
                 <div class="w-full h-full p-8 flex flex-col gap-4 opacity-50">
                    <div class="w-1/3 h-4 rounded-full bg-slate-300"></div>
                    <div class="w-3/4 h-4 rounded-full bg-slate-200"></div>
                    <div class="w-2/3 h-4 rounded-full bg-slate-200"></div>
                    <div class="mt-auto w-full h-24 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20"></div>
                 </div>
              </div>

              {/* Decorative 3D Elements */}
              <div class="floating-element-2 absolute bottom-[15%] right-[5%] w-[45%] h-[40%] rounded-[2rem] bg-gradient-to-tr from-primary/80 to-blue-400/80 backdrop-blur-md border border-white/40 shadow-2xl flex items-center justify-center">
                 <span class="material-symbols-outlined text-white/50 text-[5rem]">analytics</span>
              </div>
              
              {/* Glowing Orb */}
              <div class="floating-element-3 absolute top-[5%] right-[15%] w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-amber-300 shadow-[0_0_40px_rgba(250,204,21,0.6)] border-2 border-white/50"></div>
              
              {/* Floating Small Card */}
              <div class="floating-element-2 absolute bottom-[40%] left-[0%] w-32 h-32 rounded-[1.5rem] bg-white/70 backdrop-blur-lg border border-white/80 shadow-xl flex flex-col items-center justify-center gap-2" style={{ animationDelay: '-3s' }}>
                 <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span class="material-symbols-outlined text-emerald-500">verified</span>
                 </div>
                 <span class="text-xs font-bold text-slate-600">Secure</span>
              </div>
           </div>
        </div>

        {/* Bottom Footer */}
        <div class="relative z-20 flex justify-between items-center text-[11px] font-[800] text-slate-400 tracking-wider uppercase">
          <span>© 2026 Examinator Core</span>
          <div class="flex items-center gap-2 bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/60 shadow-sm">
            <div class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
            <span class="text-slate-600">All Systems Internal</span>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL (Login Form) ─── */}
      <div class="relative w-full lg:w-[45%] xl:w-[40%] flex items-center justify-center p-6 sm:p-12 lg:p-20 bg-white">
        
        {/* Mobile-only background effects */}
        <div class="absolute inset-0 z-0 lg:hidden overflow-hidden pointer-events-none">
          <div class="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-primary/10 blur-[80px]" />
          <div class="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-secondary/10 blur-[80px]" />
        </div>

        <div class="w-full max-w-[420px] relative z-10">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div class="lg:hidden text-center mb-10 stagger-in opacity-0">
            <div class="inline-flex items-center justify-center p-3.5 bg-slate-50 rounded-2xl shadow-sm border border-slate-100 mb-5">
              <span class="material-symbols-outlined text-4xl text-primary">view_in_ar</span>
            </div>
            <h1 class="text-3xl font-[800] text-slate-900 tracking-tight">Examinator<span class="text-primary">.</span></h1>
            <p class="text-slate-500 text-sm mt-2 font-medium">Digital Assessment Platform</p>
          </div>

          <div class="stagger-in hidden lg:block mb-10 opacity-0">
            <h2 class="text-3xl font-[800] text-slate-900 tracking-tight mb-2">Selamat Datang 👋</h2>
            <p class="text-slate-500 font-medium">Silakan masuk untuk melanjutkan ke dashboard manajemen sesi ujian Anda.</p>
          </div>

          <div class="stagger-in opacity-0">
             <LoginForm />
          </div>

        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Akses Portal - Examinator",
  meta: [
    { name: "description", content: "Sistem Manajemen Ujian Terpadu" },
  ],
};
