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
  const activeRole = useSignal("admin");
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

      {/* Premium Segmented Control for Roles */}
      <div class="form-stagger bg-slate-500/5 p-1.5 rounded-[1.25rem] border border-slate-500/10 shadow-inner flex relative backdrop-blur-sm opacity-0">
        <div 
           class="absolute top-1.5 bottom-1.5 left-1.5 rounded-xl bg-white shadow-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
           style={{ 
             width: 'calc(33.333% - 4px)', 
             transform: `translateX(${activeRole.value === 'admin' ? '0' : activeRole.value === 'guru' ? '100%' : '200%'})` 
           }}
        ></div>
        
        {["admin", "guru", "siswa"].map((role) => (
          <label key={role} class="relative flex-1 cursor-pointer group z-10">
            <input 
              checked={activeRole.value === role} 
              onChange$={() => activeRole.value = role}
              class="peer sr-only" 
              name="role" 
              type="radio" 
              value={role}
            />
            <div class={`flex h-10 items-center justify-center rounded-xl text-[13px] font-bold capitalize transition-colors duration-300 ${activeRole.value === role ? 'text-primary' : 'text-slate-500 hover:text-slate-700'}`}>
              {role}
            </div>
          </label>
        ))}
      </div>

      {/* Elevated Input Fields */}
      <div class="space-y-4">
        <div class="form-stagger opacity-0 relative group">
          <div class="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-indigo-400/30 rounded-[1.25rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
          <div class="relative bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl flex items-center p-1.5 transition-shadow duration-300 shadow-sm group-focus-within:shadow-md">
            <div class="h-11 w-11 flex items-center justify-center bg-transparent group-focus-within:bg-primary/5 rounded-xl transition-colors duration-300 text-slate-400 group-focus-within:text-primary">
              <span class="material-symbols-outlined text-[20px]">person</span>
            </div>
            <div class="flex-1 px-3">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 group-focus-within:text-primary transition-colors" for="username">Identitas Pengguna</label>
              <input 
                class="block w-full bg-transparent text-[15px] text-slate-800 font-semibold placeholder:text-slate-300 placeholder:font-medium focus:outline-none" 
                id="username" 
                placeholder="Ketik username kamu" 
                required 
                type="text" 
                bind:value={username}
              />
            </div>
          </div>
        </div>

        <div class="form-stagger opacity-0 relative group">
          <div class="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-indigo-400/30 rounded-[1.25rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
          <div class="relative bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl flex items-center p-1.5 transition-shadow duration-300 shadow-sm group-focus-within:shadow-md">
            <div class="h-11 w-11 flex items-center justify-center bg-transparent group-focus-within:bg-primary/5 rounded-xl transition-colors duration-300 text-slate-400 group-focus-within:text-primary">
              <span class="material-symbols-outlined text-[20px]">lock</span>
            </div>
            <div class="flex-1 px-3">
              <div class="flex items-center justify-between">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 group-focus-within:text-primary transition-colors" for="password">Kata Sandi</label>
                <a class="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors -translate-y-0.5" href="#">Lupa sandi?</a>
              </div>
              <input 
                class="block w-full bg-transparent text-[15px] text-slate-800 font-semibold placeholder:text-slate-300 placeholder:font-medium focus:outline-none tracking-wider" 
                id="password" 
                placeholder="••••••••" 
                required 
                type="password" 
                bind:value={password}
              />
            </div>
          </div>
        </div>
      </div>

      <div class="form-stagger opacity-0 flex items-center justify-between mt-2">
        <label class="flex items-center cursor-pointer group">
          <div class="relative flex items-center justify-center w-5 h-5 rounded-[6px] border-[1.5px] border-slate-300 group-hover:border-primary transition-colors bg-white shadow-sm overflow-hidden">
            <input type="checkbox" id="remember" class="peer sr-only" />
            <div class="absolute inset-0 bg-primary opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
               <span class="material-symbols-outlined text-white text-[14px] font-bold">check</span>
            </div>
          </div>
          <span class="ml-3 text-[13px] font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">Ingat Perangkat Ini</span>
        </label>
      </div>

      <button 
        class="form-stagger opacity-0 group relative w-full h-14 overflow-hidden rounded-2xl bg-white p-[2px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_20px_rgba(59,130,246,0.15)] hover:shadow-[0_15px_30px_rgba(59,130,246,0.25)] disabled:opacity-60 disabled:pointer-events-none mt-2" 
        type="submit"
        disabled={loading.value}
      >
        <span class="absolute inset-0 bg-gradient-to-r from-primary via-indigo-500 to-primary bg-[length:200%_auto] animate-[gradient_3s_linear_infinite] opacity-90 group-hover:opacity-100 transition-opacity"></span>
        <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity"></div>
        <div class="relative flex h-full items-center justify-center gap-3 rounded-xl bg-transparent text-white font-[800] text-[15px] tracking-wide">
          {loading.value ? (
             <span class="material-symbols-outlined animate-spin text-xl">progress_activity</span>
          ) : (
             <>
               <span>Akses Platform</span>
               <span class="material-symbols-outlined text-xl transition-transform duration-300 group-hover:translate-x-1.5 group-hover:scale-110">login</span>
             </>
          )}
        </div>
      </button>
      
    </form>
  );
});
