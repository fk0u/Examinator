import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { LoginForm } from "~/components/auth/login-form";

// ─── Landing / Login Page ───────────────────────────────

export default component$(() => {
  return (
    <div class="min-h-screen bg-gradient-mesh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div class="absolute top-[-10%] left-[-5%] w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-blob" />
      <div class="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-info/15 rounded-full blur-3xl animate-blob" style="animation-delay: 2s" />
      <div class="absolute top-[50%] left-[60%] w-64 h-64 bg-success/10 rounded-full blur-3xl animate-blob" style="animation-delay: 4s" />

      <div class="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo & Title */}
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4 shadow-lg shadow-primary-500/25">
            <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gradient mb-2">Examinator</h1>
          <p class="text-surface-400 text-sm">CBT Proctoring System — Kurikulum Merdeka</p>
        </div>

        {/* Login Card */}
        <div class="glass rounded-2xl p-8 shadow-2xl">
          <LoginForm />
        </div>

        {/* Footer */}
        <p class="text-center text-surface-500 text-xs mt-6">
          © 2026 Examinator — Self-hosted CBT Platform
        </p>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Examinator — CBT Proctoring System",
  meta: [
    { name: "description", content: "Self-hosted Computer-Based Test proctoring platform for SMK Indonesia" },
  ],
};
