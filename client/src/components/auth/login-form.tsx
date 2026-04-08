<<<<<<< Updated upstream
import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { authApi, setToken, setStoredUser } from "~/lib/api";
import { getDashboardPath } from "~/lib/auth";

// ─── Refined Awwwards-Level Login Form ───────────────────────────────

export default component$(() => {
  const username = useSignal("");
  const password = useSignal("");
  const error = useSignal("");
  const loading = useSignal(false);
  const showPassword = useSignal(false);
  const nav = useNavigate();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const { animate, stagger } = await import("motion");
    // Fine-tuned stagger entering
    animate(".form-stagger" as any, 
      { opacity: [0, 1], y: [15, 0], scale: [0.98, 1] }, 
      { duration: 0.6, delay: stagger(0.08), ease: [0.16, 1, 0.3, 1] } as any
    );
  });

  const handleLogin = $(async () => {
    error.value = "";
    loading.value = true;

    try {
      const data = await authApi.login(username.value, password.value);
      setToken(data.token);
      setStoredUser(data.user);

      // Navigate based on role
      const path = getDashboardPath(data.user.role);
      await nav(path);
    } catch (e: any) {
      error.value = e.message || "Identitas tidak ditemukan. Silakan coba lagi.";
    } finally {
      loading.value = false;
    }
  });

  return (
    <form class="flex flex-col gap-6" preventdefault:submit onSubmit$={handleLogin}>
      
      {error.value && (
        <div class="p-3.5 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-2xl text-red-600 text-[13px] font-semibold animate-shake flex items-start gap-3 shadow-[0_4px_12px_rgba(239,68,68,0.1)]">
          <span class="material-symbols-outlined text-lg translate-y-[1px]">error</span>
          <span class="leading-relaxed">{error.value}</span>
        </div>
      )}

      {/* Elevated Input Fields */}
      <div class="space-y-4">
        <div class="form-stagger opacity-0 group">
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2" for="username">Identitas Pengguna</label>
          <div class="relative bg-[#f1f5f9] rounded-[16px] flex items-center p-2 border border-transparent transition-colors duration-300 focus-within:bg-white focus-within:border-[#0e61f6]/30 focus-within:ring-4 focus-within:ring-[#0e61f6]/10">
            <div class="h-10 w-11 flex items-center justify-center text-slate-400 group-focus-within:text-[#0e61f6] transition-colors">
              <span class="material-symbols-outlined text-[20px]">person</span>
            </div>
            <div class="flex-1 pr-4">
              <input 
                class="block w-full bg-transparent text-[15px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none border-none p-0 h-10" 
                id="username" 
                placeholder="Identitas pengguna..." 
                required 
                type="text" 
                bind:value={username}
              />
            </div>
          </div>
        </div>

        <div class="form-stagger opacity-0 group">
          <div class="flex items-center justify-between mb-2">
             <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest" for="password">Kata Sandi</label>
             <a class="text-[11px] font-[700] text-[#0e61f6] hover:text-blue-800 transition-colors" href="#">Lupa sandi?</a>
          </div>
          <div class="relative bg-[#f1f5f9] rounded-[16px] flex items-center p-2 border border-transparent transition-colors duration-300 focus-within:bg-white focus-within:border-[#0e61f6]/30 focus-within:ring-4 focus-within:ring-[#0e61f6]/10">
            <div class="h-10 w-11 flex items-center justify-center text-slate-400 group-focus-within:text-[#0e61f6] transition-colors">
              <span class="material-symbols-outlined text-[20px]">lock</span>
            </div>
            <div class="flex-1 flex items-center pr-2">
              <input 
                class="block w-full bg-transparent text-[15px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none border-none p-0 h-10 tracking-widest" 
                id="password" 
                placeholder="••••••••" 
                required 
                type={showPassword.value ? "text" : "password"} 
                bind:value={password}
              />
              <button type="button" onClick$={() => showPassword.value = !showPassword.value} class="h-10 w-10 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center transition-colors">
                <span class="material-symbols-outlined text-[18px]">{showPassword.value ? "visibility" : "visibility_off"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="form-stagger opacity-0 flex items-center justify-between mt-1">
        <label class="flex items-center cursor-pointer group">
          <div class="relative flex items-center justify-center w-[18px] h-[18px] rounded-[5px] border-[1.5px] border-slate-300 group-hover:border-[#0e61f6] transition-colors bg-white overflow-hidden">
            <input type="checkbox" id="remember" class="peer sr-only" />
            <div class="absolute inset-0 bg-[#0e61f6] border-[#0e61f6] opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
               <span class="material-symbols-outlined text-white text-[12px] font-bold">check</span>
            </div>
          </div>
          <span class="ml-2.5 text-[12px] font-[600] text-slate-500 group-hover:text-slate-700 transition-colors">Ingat Perangkat Ini</span>
        </label>
      </div>

      <button 
        class="form-stagger opacity-0 relative w-full h-[52px] rounded-full bg-[#0e61f6] hover:bg-blue-600 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 shadow-[0_8px_16px_rgba(14,97,246,0.25)] hover:shadow-[0_12px_24px_rgba(14,97,246,0.35)] disabled:opacity-60 disabled:pointer-events-none mt-4 text-white font-[700] text-[15px] tracking-wide flex items-center justify-center gap-2 group" 
        type="submit"
        disabled={loading.value}
      >
        {loading.value ? (
           <span class="material-symbols-outlined animate-spin text-xl">progress_activity</span>
        ) : (
           <>
             <span>Akses Platform</span>
             <span class="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
           </>
        )}
      </button>
      
    </form>
  );
});
=======
import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { authApi, setToken, setStoredUser } from "~/lib/api";
import { getDashboardPath } from "~/lib/auth";

// ─── Refined Awwwards-Level Login Form ───────────────────────────────

export default component$(() => {
  const username = useSignal("admin");
  const password = useSignal("admin123");
  const error = useSignal("");
  const loading = useSignal(false);
  const showPassword = useSignal(false);
  const nav = useNavigate();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const { animate, stagger } = await import("motion");
    // Fine-tuned stagger entering
    animate(".form-stagger" as any, 
      { opacity: [0, 1], y: [15, 0], scale: [0.98, 1] }, 
      { duration: 0.6, delay: stagger(0.08), ease: [0.16, 1, 0.3, 1] } as any
    );
  });

  const handleLogin = $(async () => {
    error.value = "";
    loading.value = true;

    try {
      const data = await authApi.login(username.value, password.value);
      setToken(data.token);
      setStoredUser(data.user);

      // Navigate based on role
      const path = getDashboardPath(data.user.role);
      await nav(path);
    } catch (e: any) {
      error.value = e.message || "Identitas tidak ditemukan. Silakan coba lagi.";
    } finally {
      loading.value = false;
    }
  });

  return (
    <form class="flex flex-col gap-6" preventdefault:submit onSubmit$={handleLogin}>
      
      {error.value && (
        <div class="p-3.5 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-2xl text-red-600 text-[13px] font-semibold animate-shake flex items-start gap-3 shadow-[0_4px_12px_rgba(239,68,68,0.1)]">
          <span class="material-symbols-outlined text-lg translate-y-[1px]">error</span>
          <span class="leading-relaxed">{error.value}</span>
        </div>
      )}

      {/* Elevated Input Fields */}
      <div class="space-y-4">
        <div class="form-stagger opacity-0 group">
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2" for="username">Identitas Pengguna</label>
          <div class="relative bg-[#f1f5f9] rounded-[16px] flex items-center p-2 border border-transparent transition-colors duration-300 focus-within:bg-white focus-within:border-[#0e61f6]/30 focus-within:ring-4 focus-within:ring-[#0e61f6]/10">
            <div class="h-10 w-11 flex items-center justify-center text-slate-400 group-focus-within:text-[#0e61f6] transition-colors">
              <span class="material-symbols-outlined text-[20px]">person</span>
            </div>
            <div class="flex-1 pr-4">
              <input 
                class="block w-full bg-transparent text-[15px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none border-none p-0 h-10" 
                id="username" 
                placeholder="Identitas pengguna..." 
                required 
                type="text" 
                bind:value={username}
              />
            </div>
          </div>
        </div>

        <div class="form-stagger opacity-0 group">
          <div class="flex items-center justify-between mb-2">
             <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest" for="password">Kata Sandi</label>
             <a class="text-[11px] font-[700] text-[#0e61f6] hover:text-blue-800 transition-colors" href="#">Lupa sandi?</a>
          </div>
          <div class="relative bg-[#f1f5f9] rounded-[16px] flex items-center p-2 border border-transparent transition-colors duration-300 focus-within:bg-white focus-within:border-[#0e61f6]/30 focus-within:ring-4 focus-within:ring-[#0e61f6]/10">
            <div class="h-10 w-11 flex items-center justify-center text-slate-400 group-focus-within:text-[#0e61f6] transition-colors">
              <span class="material-symbols-outlined text-[20px]">lock</span>
            </div>
            <div class="flex-1 flex items-center pr-2">
              <input 
                class="block w-full bg-transparent text-[15px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none border-none p-0 h-10 tracking-widest" 
                id="password" 
                placeholder="••••••••" 
                required 
                type={showPassword.value ? "text" : "password"} 
                bind:value={password}
              />
              <button type="button" onClick$={() => showPassword.value = !showPassword.value} class="h-10 w-10 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center transition-colors">
                <span class="material-symbols-outlined text-[18px]">{showPassword.value ? "visibility" : "visibility_off"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="form-stagger opacity-0 flex items-center justify-between mt-1">
        <label class="flex items-center cursor-pointer group">
          <div class="relative flex items-center justify-center w-[18px] h-[18px] rounded-[5px] border-[1.5px] border-slate-300 group-hover:border-[#0e61f6] transition-colors bg-white overflow-hidden">
            <input type="checkbox" id="remember" class="peer sr-only" />
            <div class="absolute inset-0 bg-[#0e61f6] border-[#0e61f6] opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
               <span class="material-symbols-outlined text-white text-[12px] font-bold">check</span>
            </div>
          </div>
          <span class="ml-2.5 text-[12px] font-[600] text-slate-500 group-hover:text-slate-700 transition-colors">Ingat Perangkat Ini</span>
        </label>
      </div>

      <button 
        class="form-stagger opacity-0 relative w-full h-[52px] rounded-full bg-[#0e61f6] hover:bg-blue-600 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 shadow-[0_8px_16px_rgba(14,97,246,0.25)] hover:shadow-[0_12px_24px_rgba(14,97,246,0.35)] disabled:opacity-60 disabled:pointer-events-none mt-4 text-white font-[700] text-[15px] tracking-wide flex items-center justify-center gap-2 group" 
        type="submit"
        disabled={loading.value}
      >
        {loading.value ? (
           <span class="material-symbols-outlined animate-spin text-xl">progress_activity</span>
        ) : (
           <>
             <span>Akses Platform</span>
             <span class="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
           </>
        )}
      </button>
      
    </form>
  );
});
>>>>>>> Stashed changes
