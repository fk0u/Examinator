import { component$, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import LoginForm from "~/components/auth/login-form";

// ─── Hyper-Immersive IRA Design Login Page ───────────────────────────────

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const { animate, stagger } = await import("motion");
    
    // Abstract Illustration Animations
    animate(".blob-1" as any, 
      { scale: [0.95, 1.05], rotate: [0, 10], x: [0, 30] }, 
      { duration: 8, repeat: Infinity, direction: "alternate", ease: "easeInOut" } as any
    );
    animate(".blob-2" as any, 
      { scale: [1, 1.1], rotate: [0, -15], y: [0, -40] }, 
      { duration: 10, repeat: Infinity, direction: "alternate", ease: "easeInOut" } as any
    );

    animate(".float-obj-1" as any, 
      { y: ["-15px", "15px"], rotate: [-2, 2] }, 
      { duration: 4, repeat: Infinity, direction: "alternate", ease: "easeInOut" } as any
    );
    animate(".float-obj-2" as any, 
      { y: ["20px", "-20px"], rotate: [5, -5] }, 
      { duration: 5, repeat: Infinity, direction: "alternate", ease: "easeInOut" } as any
    );
    animate(".float-obj-3" as any, 
      { y: ["-10px", "10px"], scale: [0.95, 1.05] }, 
      { duration: 3.5, repeat: Infinity, direction: "alternate", ease: "easeInOut" } as any
    );

    // Staggered entrance for the right side
    animate(".stagger-in" as any, 
      { opacity: [0, 1], x: [40, 0] }, 
      { duration: 0.8, delay: stagger(0.12), ease: [0.16, 1, 0.3, 1] } as any
    );
    
    // Smooth fade in for the left side text
    animate(".fade-in-up" as any,
      { opacity: [0, 1], y: [30, 0] }, 
      { duration: 1, delay: stagger(0.2), ease: [0.16, 1, 0.3, 1] } as any
    );
  });

  return (
    <div class="font-sans h-[100dvh] w-full flex bg-[#fafcff] overflow-hidden selection:bg-primary/20 selection:text-primary">
      
      {/* ─── LEFT PANEL (Vibrant IRA Design Illustration) ─── */}
      <div class="relative hidden lg:flex w-[55%] xl:w-[60%] flex-col justify-between overflow-hidden p-6 lg:p-10 xl:p-12 border-r border-slate-100/50 bg-[#f8fbff]">
        
        {/* Massive Animated SVG Blobs (IRA Style) */}
        <div class="absolute inset-0 z-0 pointer-events-none flex items-center justify-center -translate-x-[10%] translate-y-[10%]">
          {/* Primary Blue Blob */}
          <div class="blob-1 absolute w-[120%] h-[120%] opacity-80 mix-blend-multiply filter blur-[60px]" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0) 70%)' }}></div>
          {/* Secondary Yellow Blob */}
          <div class="blob-2 absolute w-[100%] h-[100%] opacity-80 mix-blend-multiply filter blur-[80px] translate-x-[20%] -translate-y-[20%]" style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.25) 0%, rgba(234,179,8,0) 70%)' }}></div>
          {/* Indigo Accent */}
          <div class="absolute w-[80%] h-[80%] opacity-70 mix-blend-multiply filter blur-[100px] -translate-x-[30%]" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(79,70,229,0) 70%)' }}></div>
        </div>
        
        {/* Noise Texture for Premium Feel */}
        <div class="pointer-events-none fixed inset-0 z-10 opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

        {/* Top Header & Copy */}
        <div class="relative z-20 mt-4 xl:mt-8">
          <div class="fade-in-up inline-flex items-center justify-center p-3 bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 mb-6 group transition-transform duration-500 hover:-translate-y-1">
            <span class="material-symbols-outlined text-[28px] text-primary transition-transform duration-500 group-hover:scale-110">schema</span>
          </div>
          <h1 class="fade-in-up text-[3rem] lg:text-[3.5rem] xl:text-[4rem] leading-[1.1] font-[900] text-slate-900 tracking-tight">
            Meningkatkan <br /> standar <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-indigo-500">penilaian digital</span>
            <span class="text-secondary">.</span>
          </h1>
          <p class="fade-in-up mt-6 text-slate-500 font-medium text-[1rem] xl:text-[1.1rem] max-w-lg leading-relaxed mix-blend-darken">
            Platform Ujian Berbasis Komputer mutakhir yang mengintegrasikan pengawasan ketat, performa mulus, dan desain estetika yang imersif.
          </p>
        </div>

        {/* 3D Abstract UI Composition */}
        <div class="relative z-20 flex-1 w-full flex items-center justify-end mt-6 mb-6 pr-6 xl:pr-10">
           <div class="relative w-full max-w-[450px] xl:max-w-[550px] aspect-square">
              
              {/* Back Element: Code/Data Representation */}
              <div class="float-obj-2 absolute top-[15%] right-[0%] w-[65%] h-[60%] rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_30px_60px_-15px_rgba(59,130,246,0.4)] border border-white/20 flex flex-col p-6 overflow-hidden">
                 <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiLz48L3N2Zz4=')] opacity-50"></div>
                 <div class="w-full flex justify-between items-center mb-6">
                    <div class="flex gap-2">
                       <div class="w-3 h-3 rounded-full bg-white/30"></div>
                       <div class="w-3 h-3 rounded-full bg-white/30"></div>
                    </div>
                    <span class="material-symbols-outlined text-white/50">monitoring</span>
                 </div>
                 <div class="space-y-4 w-full">
                    <div class="w-3/4 h-3 bg-white/20 rounded-full"></div>
                    <div class="w-full h-3 bg-white/20 rounded-full"></div>
                    <div class="w-5/6 h-3 bg-white/20 rounded-full"></div>
                    <div class="w-1/2 h-3 bg-white/20 rounded-full"></div>
                 </div>
              </div>

              {/* Front Element: Main Glass Morphic Dashboard */}
              <div class="float-obj-1 absolute bottom-[10%] left-[5%] w-[80%] h-[60%] rounded-[2.5rem] bg-white/60 backdrop-blur-2xl border-[1.5px] border-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col p-8">
                 <div class="flex items-center gap-4 mb-8">
                    <div class="w-12 h-12 rounded-[1.25rem] bg-primary/10 flex items-center justify-center text-primary">
                       <span class="material-symbols-outlined text-2xl">space_dashboard</span>
                    </div>
                    <div>
                       <div class="w-24 h-3.5 bg-slate-200 rounded-full mb-2"></div>
                       <div class="w-16 h-2.5 bg-slate-100 rounded-full"></div>
                    </div>
                 </div>
                 <div class="flex-1 w-full bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl border border-white/60 p-5 flex flex-col justify-between">
                    <div class="w-full h-24 bg-white rounded-xl shadow-sm border border-slate-50 flex items-end p-4 gap-3">
                       <div class="w-1/6 h-[40%] bg-blue-200 rounded-t-sm"></div>
                       <div class="w-1/6 h-[70%] bg-primary rounded-t-sm shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
                       <div class="w-1/6 h-[50%] bg-blue-200 rounded-t-sm"></div>
                       <div class="w-1/6 h-[90%] bg-secondary rounded-t-sm shadow-[0_0_15px_rgba(234,179,8,0.3)]"></div>
                       <div class="w-1/6 h-[30%] bg-blue-200 rounded-t-sm"></div>
                    </div>
                 </div>
              </div>
              
              {/* Floating Accent Orb */}
              <div class="float-obj-3 absolute top-[25%] left-[-5%] w-28 h-28 rounded-full bg-gradient-to-br from-secondary to-amber-400 shadow-[0_0_50px_rgba(250,204,21,0.5)] border-[3px] border-white/80 flex items-center justify-center">
                 <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full"></div>
              </div>
              
              {/* Floating Small Status Badge */}
              <div class="float-obj-2 absolute bottom-[35%] right-[-10%] w-36 h-auto p-4 rounded-[1.5rem] bg-white/80 backdrop-blur-xl border border-white shadow-2xl flex flex-col items-center justify-center gap-2" style={{ animationDelay: '-2s' }}>
                 <div class="w-12 h-12 rounded-[1rem] bg-emerald-100 flex items-center justify-center shadow-inner">
                    <span class="material-symbols-outlined text-emerald-500 text-[28px]">verified_user</span>
                 </div>
                 <span class="text-[13px] font-[800] text-slate-700 tracking-wide">Secure</span>
              </div>
           </div>
        </div>

        {/* Bottom Footer */}
        <div class="fade-in-up relative z-20 flex justify-between items-center text-[11px] font-[800] text-slate-400 tracking-wider uppercase">
          <span>© 2026 Examinator Core</span>
          <div class="flex items-center gap-2.5 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </div>
            <span class="text-slate-600">All Systems Online</span>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL (Login Form) ─── */}
      <div class="relative w-full lg:w-[45%] xl:w-[40%] flex items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16 bg-white shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.02)] z-10 overflow-hidden">
        
        {/* Mobile Background Elements */}
        <div class="absolute inset-0 z-0 lg:hidden overflow-hidden pointer-events-none bg-[#f8fbff]">
          <div class="absolute top-[-10%] left-[-20%] w-[300px] h-[300px] rounded-full bg-primary/20 blur-[60px]" />
          <div class="absolute bottom-[-10%] right-[-20%] w-[300px] h-[300px] rounded-full bg-secondary/20 blur-[60px]" />
          <div class="pointer-events-none fixed inset-0 z-10 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        </div>

        {/* Inner Form Container */}
        <div class="w-full max-w-[420px] relative z-10">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div class="lg:hidden text-center mb-10 stagger-in opacity-0">
            <div class="inline-flex items-center justify-center p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white mb-6">
              <span class="material-symbols-outlined text-[32px] text-primary">schema</span>
            </div>
            <h1 class="text-3xl font-[900] text-slate-900 tracking-tight leading-tight">
              Examinator<span class="text-primary">.</span>
            </h1>
            <p class="text-slate-500 text-[13px] mt-2 font-medium tracking-wide">Next-Gen Assessment Platform</p>
          </div>

          {/* Desktop Header Greeting */}
          <div class="stagger-in hidden lg:block mb-10 opacity-0">
            <div class="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 mb-6">
               <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
               <span class="text-[11px] font-[800] tracking-widest text-slate-500 uppercase">Portal Masuk</span>
            </div>
            <h2 class="text-[2.5rem] font-[900] text-slate-900 tracking-tight leading-[1.1] mb-3">Selamat Datang 👋</h2>
            <p class="text-slate-500 font-medium text-[15px] leading-relaxed pr-8">
              Silakan masuk dengan kredensial Anda untuk melanjutkan ke dashboard manajemen sesi ujian.
            </p>
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
