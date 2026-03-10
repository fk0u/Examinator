import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { LoginForm } from "~/components/auth/login-form";

// ─── Landing / Login Page ───────────────────────────────

export default component$(() => {
  return (
    <div class="font-sans bg-surface-50 dark:bg-surface-900 min-h-screen flex items-center justify-center p-4">
      {/* Subtle Gradient Background Elements */}
      <div class="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-500/10 blur-[120px]"></div>
        <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary-500/10 blur-[120px]"></div>
      </div>

      {/* Main Auth Card */}
      <div class="relative z-10 w-full max-w-[440px] bg-white dark:bg-slate-900 shadow-xl rounded-xl border border-primary-500/10 overflow-hidden">
        {/* Header / Logo Section */}
        <div class="px-8 pt-10 pb-6 text-center">
          <div class="flex flex-col items-center gap-3">
            <div class="w-16 h-16 bg-primary-500/10 text-primary-500 rounded-xl flex items-center justify-center border border-primary-500/20">
              <span class="material-symbols-outlined !text-4xl">shield_person</span>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">Examinator</h1>
              <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Computer Based Test Platform</p>
            </div>
          </div>
        </div>

        <LoginForm />

        {/* Footer Info */}
        <div class="px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-center items-center gap-4">
          <p class="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">© 2026 Examinator Tech</p>
          <div class="w-1 h-1 rounded-full bg-slate-300"></div>
          <p class="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Versi 4.2.0</p>
        </div>
      </div>

      {/* System Requirements / Support Mini Card */}
      <div class="fixed bottom-6 right-6 hidden md:flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-primary-500/10 shadow-sm">
        <div class="w-2 h-2 rounded-full bg-accent-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]"></div>
        <p class="text-xs font-medium text-slate-600 dark:text-slate-300">Sistem Berjalan Normal</p>
        <div class="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
        <button class="text-xs font-bold text-primary-500 hover:text-primary-700 transition-colors">Bantuan</button>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Login - Examinator CBT",
  meta: [
    { name: "description", content: "Self-hosted Computer-Based Test proctoring platform for SMK Indonesia" },
  ],
};
