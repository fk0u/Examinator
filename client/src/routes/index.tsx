import { component$, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import LoginForm from "~/components/auth/login-form";

// ─── Landing / Login Page ───────────────────────────────

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const { animate } = await import("motion");
    animate(".glass-card" as any, { y: [40, 0], opacity: [0, 1] }, { duration: 0.8, ease: "easeOut" } as any);
    animate(".blob-1" as any, { scale: [0.8, 1, 0.9], x: [0, 30, -20], y: [0, -50, 20], opacity: [0, 1] }, { duration: 8, repeat: Infinity, direction: "alternate", ease: "easeInOut" } as any);
    animate(".blob-2" as any, { scale: [0.9, 1.1, 0.8], x: [0, -40, 20], y: [0, 40, -30], opacity: [0, 1] }, { duration: 10, repeat: Infinity, direction: "alternate", ease: "easeInOut" } as any);
    animate(".blob-3" as any, { scale: [1, 0.8, 1.1], x: [0, 50, -40], y: [0, 20, 50], opacity: [0, 1] }, { duration: 12, repeat: Infinity, direction: "alternate", ease: "easeInOut" } as any);
  });

  return (
    <div class="font-sans relative min-h-screen w-full overflow-hidden bg-slate-50 flex items-center justify-center p-4 sm:p-8">
      {/* Immersive Background Blobs */}
      <div class="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div class="blob-1 absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px] opacity-0" />
        <div class="blob-2 absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/30 blur-[120px] opacity-0" />
        <div class="blob-3 absolute top-[30%] left-[40%] w-[400px] h-[400px] rounded-full bg-[#6366f1]/20 blur-[90px] opacity-0" />
      </div>

      {/* Main Glassmorphism Auth Card */}
      <div class="glass-card relative z-10 w-full max-w-[440px] rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden opacity-0">
        
        {/* Playful Top Border Gradient */}
        <div class="h-1.5 w-full bg-gradient-to-r from-primary via-[#6366f1] to-secondary" />

        {/* Header / Logo Section */}
        <div class="px-8 pt-10 pb-6 text-center">
          <div class="inline-flex items-center justify-center p-4 bg-white rounded-3xl shadow-sm border border-white mb-5 group hover:scale-110 transition-transform duration-300">
            <span class="material-symbols-outlined text-4xl text-primary bg-clip-text group-hover:animate-pulse">bolt</span>
          </div>
          <h1 class="text-3xl font-extrabold tracking-tight text-slate-800">
            Examinator <span class="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text drop-shadow-sm">CBT</span>
          </h1>
          <p class="text-slate-500 mt-2 font-medium">Ujian Berbasis Komputer Modern</p>
        </div>

        <LoginForm />

        {/* Footer Info */}
        <div class="px-8 py-5 bg-white/50 border-t border-white/60 flex justify-between items-center text-xs font-bold text-slate-400">
          <span class="uppercase tracking-widest">© Tech 2026</span>
          <div class="flex items-center gap-2 px-3 py-1 bg-white/60 rounded-full shadow-sm border border-white/80">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            <span class="text-slate-600">Sistem Aktif</span>
          </div>
          <span class="uppercase tracking-widest text-primary drop-shadow-sm">v4.2.0</span>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Login - Examinator",
  meta: [
    { name: "description", content: "Flawless and immersive CBT Platform" },
  ],
};
