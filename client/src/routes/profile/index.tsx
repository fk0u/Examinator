import { component$, useSignal, useVisibleTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useNavigate } from "@builder.io/qwik-city";
import { getUserData, isAuthenticated, logout } from "~/lib/auth";
import { Clock } from "~/components/ui/clock";

export default component$(() => {
  const nav = useNavigate();
  const user = useSignal<any>(null);

  useVisibleTask$(async () => {
    if (!isAuthenticated()) {
      await nav("/");
      return;
    }
    user.value = getUserData();
  });

  if (!user.value) {
    return (
      <div class="min-h-screen bg-surface-900 bg-gradient-mesh flex items-center justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const handleBack = $(() => {
    if (user.value?.role === "ADMIN") nav("/admin/");
    else if (user.value?.role === "OPERATOR") nav("/proctor/");
    else nav("/student/");
  });

  return (
    <div class="min-h-screen bg-surface-900 bg-gradient-mesh">
      {/* Header */}
      <header class="glass sticky top-0 z-40">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button 
              onClick$={handleBack}
              class="p-2 rounded-lg text-surface-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              title="Kembali"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <span class="font-bold text-gradient text-lg tracking-tight">Profil Pengguna</span>
          </div>
          <Clock />
        </div>
      </header>

      {/* Content */}
      <main class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div class="animate-fade-in bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
          {/* Profile Header Background */}
          <div class="h-32 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
          
          <div class="px-6 sm:px-10 px-b-10 relative">
            {/* Avatar */}
            <div class="absolute -top-16 w-32 h-32 rounded-full bg-white p-2 shadow-lg">
              <div class="w-full h-full rounded-full bg-gradient-to-tr from-primary-400 to-secondary-500 flex items-center justify-center text-white text-5xl font-bold shadow-inner">
                {user.value?.fullName?.charAt(0) || "U"}
              </div>
            </div>

            <div class="pt-20 pb-8 sm:flex sm:items-center sm:justify-between">
              <div>
                <h1 class="text-3xl font-bold text-surface-800">{user.value?.fullName}</h1>
                <div class="mt-2 flex items-center gap-3">
                  <span class="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary-100 text-primary-700 border border-primary-200">
                    {user.value?.role}
                  </span>
                  {user.value?.kelas && (
                    <span class="px-3 py-1 rounded-full text-xs font-medium bg-surface-100 text-surface-600 border border-surface-200">
                      Kelas {user.value.kelas}
                    </span>
                  )}
                </div>
              </div>
              <div class="mt-6 sm:mt-0">
                <button
                  onClick$={() => { logout(); }}
                  class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all font-medium border border-danger/20 hover:border-danger shadow-sm active:scale-95"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Keluar dari Akun
                </button>
              </div>
            </div>

            {/* Profile Details */}
            <div class="border-t border-surface-100 py-8">
              <h2 class="text-lg font-semibold text-surface-800 mb-6">Informasi Akun</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p class="text-sm text-surface-500 mb-1">Nama Lengkap</p>
                  <p class="text-surface-800 font-medium bg-surface-50 px-4 py-2.5 rounded-lg border border-surface-100">{user.value?.fullName}</p>
                </div>
                <div>
                  <p class="text-sm text-surface-500 mb-1">Username</p>
                  <p class="text-surface-800 font-medium bg-surface-50 px-4 py-2.5 rounded-lg border border-surface-100 font-mono">{user.value?.username}</p>
                </div>
                {user.value?.kelas && (
                  <div>
                    <p class="text-sm text-surface-500 mb-1">Kelas</p>
                    <p class="text-surface-800 font-medium bg-surface-50 px-4 py-2.5 rounded-lg border border-surface-100">{user.value?.kelas}</p>
                  </div>
                )}
                <div>
                  <p class="text-sm text-surface-500 mb-1">Peran Akses</p>
                  <p class="text-surface-800 font-medium bg-surface-50 px-4 py-2.5 rounded-lg border border-surface-100 capitalize">{user.value?.role.toLowerCase()}</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Profil Pengguna — Examinator",
  meta: [
    {
      name: "description",
      content: "Profil pengguna aplikasi Examinator",
    },
  ],
};
