import { component$, useSignal, useVisibleTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useNavigate } from "@builder.io/qwik-city";
import { getUserData, isAuthenticated, logout } from "~/lib/auth";
import { setStoredUser } from "~/lib/api";
import { usersApi, authApi } from "~/lib/api";
import { Clock } from "~/components/ui/clock";

export default component$(() => {
  const nav = useNavigate();
  const user = useSignal<any>(null);
  
  // Form State
  const fullName = useSignal("");
  const username = useSignal("");
  const password = useSignal("");
  const confirmPassword = useSignal("");
  
  // UI State
  const isLoading = useSignal(true);
  const isSaving = useSignal(false);
  const successMessage = useSignal("");
  const errorMessage = useSignal("");

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    if (!isAuthenticated()) {
      await nav("/");
      return;
    }
    try {
      const response = await authApi.me();
      user.value = response.user;
      fullName.value = response.user.fullName || "";
      username.value = response.user.username || "";
    } catch {
      user.value = getUserData();
      fullName.value = user.value?.fullName || "";
      username.value = user.value?.username || "";
    } finally {
      isLoading.value = false;
    }
  });

  const handleSave = $(async () => {
    errorMessage.value = "";
    successMessage.value = "";

    if (!user.value?.id) {
      errorMessage.value = "Sesi pengguna tidak valid. Muat ulang halaman lalu coba lagi.";
      return;
    }
    
    if (password.value && password.value !== confirmPassword.value) {
      errorMessage.value = "Password baru dan konfirmasi tidak cocok.";
      return;
    }

    isSaving.value = true;
    try {
      const payload: any = {
        fullName: fullName.value,
        username: username.value,
      };
      
      if (password.value) {
        payload.password = password.value;
      }

      await usersApi.update(user.value.id, payload);
      
      // Update local storage if needed
      const updatedUser = { ...user.value, fullName: fullName.value, username: username.value };
      setStoredUser(updatedUser);
      user.value = updatedUser;

      successMessage.value = "Profil berhasil diperbarui!";
      password.value = "";
      confirmPassword.value = "";
      
      setTimeout(() => {
        successMessage.value = "";
      }, 3000);
      
    } catch (err: any) {
      errorMessage.value = err.message || "Gagal memperbarui profil. Username mungkin sudah digunakan.";
    } finally {
      isSaving.value = false;
    }
  });

  const handleBack = $(() => {
    if (user.value?.role === "ADMIN") nav("/admin/");
    else if (user.value?.role === "OPERATOR") nav("/proctor/");
    else nav("/student/");
  });

  if (isLoading.value) {
    return (
      <div class="min-h-screen bg-slate-50 flex items-center justify-center">
        <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div class="font-sans min-h-screen bg-slate-50 text-slate-800 mesh-gradient pb-12">
      {/* ═══ Sticky Glassmorphic Navbar ═══ */}
      <nav class="sticky top-0 z-50 px-6 py-3">
        <div class="max-w-7xl mx-auto glass rounded-2xl px-6 py-2 flex items-center justify-between shadow-sm">
          <div class="flex items-center gap-8">
            <button onClick$={handleBack} class="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div class="bg-blue-500 p-2 rounded-xl flex items-center justify-center text-white">
                <span class="material-symbols-outlined text-2xl">rocket_launch</span>
              </div>
              <h2 class="text-slate-900 text-xl font-bold tracking-tight hidden sm:block">
                Examinator
              </h2>
            </button>
          </div>

          <div class="flex items-center gap-4">
            <div class="hidden lg:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-slate-600">
              <span class="material-symbols-outlined text-sm">schedule</span>
              <span class="text-xs font-bold uppercase tracking-wider">
                <Clock />
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span class="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 truncate max-w-[150px] sm:max-w-none">
                Hai, {user.value?.fullName?.split(" ")[0] || "Siswa"}
              </span>
              <button
                onClick$={() => {
                  logout();
                  nav("/");
                }}
                class="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors relative"
                title="Keluar"
              >
                <span class="material-symbols-outlined">logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-3xl mx-auto px-6 py-12 space-y-8 animate-fade-in">
        
        <header class="text-center md:text-left flex flex-col md:flex-row items-center gap-6 mb-8">
          <div class="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 text-white flex items-center justify-center text-4xl font-black shadow-xl shadow-blue-500/30">
            {user.value?.fullName?.charAt(0).toUpperCase() || "S"}
          </div>
          <div>
            <h1 class="text-3xl font-black text-slate-900 mb-1">Pengaturan Profil</h1>
            <p class="text-slate-500">Kelola informasi akun dan amankan kredensialmu.</p>
          </div>
        </header>

        <section class="glass rounded-3xl p-8 border border-white/50 shadow-sm relative overflow-hidden">
           
           {successMessage.value && (
            <div class="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in">
              <span class="material-symbols-outlined">check_circle</span>
              <p class="font-medium text-sm">{successMessage.value}</p>
            </div>
          )}

          {errorMessage.value && (
            <div class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in">
              <span class="material-symbols-outlined">error</span>
              <p class="font-medium text-sm">{errorMessage.value}</p>
            </div>
          )}

          <form preventdefault:submit onSubmit$={handleSave} class="space-y-6 relative z-10">
            
            <div class="space-y-4">
              <h2 class="text-lg font-bold text-slate-900 border-b border-slate-200/60 pb-2">Informasi Pribadi</h2>
              
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Nama Lengkap</label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <span class="material-symbols-outlined text-[20px]">person</span>
                    </span>
                    <input 
                      type="text" 
                      value={fullName.value}
                      onInput$={(e) => fullName.value = (e.target as HTMLInputElement).value}
                      class="w-full bg-white/60 border border-slate-200 text-slate-900 text-sm rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-11 p-3.5 transition-shadow hover:bg-white focus:bg-white" 
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Username</label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <span class="material-symbols-outlined text-[20px]">alternate_email</span>
                    </span>
                    <input 
                      type="text" 
                      value={username.value}
                      onInput$={(e) => username.value = (e.target as HTMLInputElement).value}
                      class="w-full bg-white/60 border border-slate-200 text-slate-900 text-sm rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-11 p-3.5 transition-shadow hover:bg-white focus:bg-white" 
                      placeholder="Masukkan username"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-4 pt-6">
              <h2 class="text-lg font-bold text-slate-900 border-b border-slate-200/60 pb-2">Ubah Password</h2>
              <p class="text-xs text-slate-500 mb-4 ml-1">Kosongkan jika tidak ingin mengubah password.</p>
              
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Password Baru</label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <span class="material-symbols-outlined text-[20px]">lock</span>
                    </span>
                    <input 
                      type="password" 
                      value={password.value}
                      onInput$={(e) => password.value = (e.target as HTMLInputElement).value}
                      class="w-full bg-white/60 border border-slate-200 text-slate-900 text-sm rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-11 p-3.5 transition-shadow hover:bg-white focus:bg-white" 
                      placeholder="Minimal 6 karakter"
                      minLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Konfirmasi Password Baru</label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <span class="material-symbols-outlined text-[20px]">password</span>
                    </span>
                    <input 
                      type="password" 
                      value={confirmPassword.value}
                      onInput$={(e) => confirmPassword.value = (e.target as HTMLInputElement).value}
                      class="w-full bg-white/60 border border-slate-200 text-slate-900 text-sm rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-11 p-3.5 transition-shadow hover:bg-white focus:bg-white" 
                      placeholder="Ulangi password baru"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-6 flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving.value}
                class="bg-blue-500 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSaving.value ? (
                  <>
                    <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <span class="material-symbols-outlined text-[20px]">save</span>
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>

          </form>
        </section>

      </main>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Profil Saya — Examinator",
};
