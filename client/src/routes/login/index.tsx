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
    <div class="font-sans h-[100dvh] w-full flex bg-[#fafbfc] overflow-hidden selection:bg-primary/20 selection:text-primary">
      
      {/* ─── LEFT PANEL (Vibrant 3D Space) ─── */}
      <div class="relative hidden lg:flex w-[55%] xl:w-[60%] flex-col justify-between overflow-hidden p-6 lg:p-8 border-r border-slate-100 bg-[#f8fbff]">
        
        {/* Massive Animated SVG Blobs (Background) */}
        <div class="absolute inset-0 z-0 pointer-events-none flex items-center justify-center -translate-y-10">
          <div class="blob-1 absolute w-[100%] h-[100%] opacity-60 mix-blend-multiply filter blur-[60px]" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0) 70%)' }}></div>
          <div class="blob-2 absolute w-[90%] h-[90%] opacity-60 mix-blend-multiply filter blur-[80px] translate-x-[20%]" style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.2) 0%, rgba(234,179,8,0) 70%)' }}></div>
        </div>

        {/* 3D Abstract UI Composition (Now at Top) */}
        <div class="relative z-20 flex-1 w-full flex justify-start items-center mt-2 min-h-0">
           <div class="relative w-full max-w-[240px] xl:max-w-[340px] max-h-full aspect-square">
              {/* Note: In a real app, this would be the actual isometric 3D asset from the design. */}
              {/* Back Element: Code/Data Representation */}
              <div class="float-obj-2 absolute top-[10%] left-[10%] w-[70%] h-[55%] rounded-[1.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_20px_40px_-10px_rgba(59,130,246,0.2)] border border-white/20 flex flex-col p-4 overflow-hidden">
                 <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiLz48L3N2Zz4=')] opacity-50"></div>
                 <div class="w-full h-1/2 flex items-end gap-2 px-2 pb-2">
                     <div class="w-4 h-1/2 bg-white/40 rounded-t-sm"></div>
                     <div class="w-4 h-full bg-white/70 rounded-t-sm"></div>
                     <div class="w-4 h-3/4 bg-white/50 rounded-t-sm"></div>
                 </div>
                 <div class="w-full h-px bg-white/20 mt-2 mb-2"></div>
                 <div class="space-y-2 w-full mt-2">
                    <div class="w-3/4 h-2 bg-white/20 rounded-full"></div>
                    <div class="w-1/2 h-2 bg-white/20 rounded-full"></div>
                 </div>
              </div>

              {/* Front Element: Main Glass Dashboard */}
              <div class="float-obj-1 absolute bottom-[15%] right-[5%] w-[75%] h-[55%] rounded-[2rem] bg-white/70 backdrop-blur-2xl border-[1.5px] border-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col p-5">
                 <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-[1rem] bg-primary/10 flex items-center justify-center text-primary">
                       <span class="material-symbols-outlined text-xl">cloud_done</span>
                    </div>
                    <div class="w-20 h-2.5 bg-slate-200 rounded-full"></div>
                 </div>
                 <div class="flex-1 w-full bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-white/60 p-3 flex flex-col justify-end">
                     <div class="w-full flex justify-between gap-2 overflow-hidden items-end h-full pt-4">
                        <div class="flex-1 h-[40%] bg-blue-200 rounded-t-lg"></div>
                        <div class="flex-1 h-[80%] bg-primary rounded-t-lg shadow-sm"></div>
                        <div class="flex-1 h-[60%] bg-blue-200 rounded-t-lg"></div>
                     </div>
                 </div>
              </div>

              <div class="float-obj-3 absolute top-[30%] right-[0%] w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-amber-300 shadow-[0_0_30px_rgba(250,204,21,0.4)] border-[2px] border-white/80 flex items-center justify-center">
                 <span class="material-symbols-outlined text-white text-3xl">verified_user</span>
              </div>
           </div>
        </div>

        {/* Text Copy (Now at Bottom) */}
        <div class="relative z-20 mt-auto mb-6 lg:pr-8 text-left">
          <h1 class="fade-in-up text-[2.25rem] lg:text-[2.75rem] xl:text-[3.5rem] leading-[1.1] font-[900] text-slate-900 tracking-tight text-left">
            Meningkatkan standar <br />
            <span class="text-[#0e61f6]">penilaian digital.</span>
          </h1>
          <p class="fade-in-up mt-4 text-slate-600 font-medium text-[0.9rem] xl:text-[1.05rem] max-w-[95%] lg:max-w-xl leading-relaxed text-left">
            Platform Ujian Berbasis Komputer mutakhir yang mengintegrasikan pengawasan ketat, performa tinggi, dan desain estetika yang imersif.
          </p>
        </div>

        {/* Bottom Footer */}
        <div class="fade-in-up relative z-20 flex justify-between items-center text-[10px] xl:text-[11px] font-[700] text-slate-400 tracking-wider uppercase">
          <span>© 2026 Examinator Core</span>
          <div class="flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/50">
            <span class="text-slate-500 font-bold">ALL SYSTEMS ONLINE</span>
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL (Login Form Container) ─── */}
      <div class="relative w-full lg:w-[45%] xl:w-[40%] flex items-center justify-center p-4 sm:p-8 bg-[#fdfdfd] z-10 overflow-hidden before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMSkiLz48L3N2Zz4=')] before:opacity-50">
        
        {/* Inner Elevated Card */}
        <div class="w-full max-w-[480px] relative z-20 bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8 sm:p-10 xl:p-12">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div class="lg:hidden text-center mb-10 stagger-in opacity-0">
            <h1 class="text-3xl font-[900] text-slate-900 tracking-tight leading-tight">
              Examinator<span class="text-[#0e61f6]">.</span>
            </h1>
            <p class="text-slate-500 text-[13px] mt-2 font-medium tracking-wide">Next-Gen Assessment Platform</p>
          </div>

          {/* Desktop Header Greeting */}
          <div class="stagger-in hidden lg:flex flex-col mb-8 opacity-0">
            <div class="inline-flex items-center self-start px-3 py-1 rounded-full bg-slate-50 border border-slate-100 mb-5">
               <span class="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Portal Masuk</span>
            </div>
            <h2 class="text-[2rem] xl:text-[2.25rem] font-[800] text-slate-900 tracking-tight leading-tight mb-3">Selamat Datang 👋</h2>
            <p class="text-slate-500 font-medium text-[14px] leading-relaxed pr-4">
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
