import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { authApi, setToken, setStoredUser } from "~/lib/api";
import { getDashboardPath } from "~/lib/auth";

// ─── Login Form Component ───────────────────────────────

export default component$(() => {
  const username = useSignal("siswa1");
  const password = useSignal("siswa123");
  const error = useSignal("");
  const loading = useSignal(false);
  const activeRole = useSignal("siswa");
  const nav = useNavigate();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const { animate, stagger } = await import("motion");
    animate(".stagger-item" as any, { opacity: [0, 1], y: [20, 0] }, { duration: 0.6, delay: stagger(0.1), ease: "easeOut" } as any);
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
      error.value = e.message || "Login failed. Check your credentials.";
    } finally {
      loading.value = false;
    }
  });

  return (
    <form class="px-8 py-2 flex flex-col gap-6" preventdefault:submit onSubmit$={handleLogin}>
      {error.value && (
        <div class="p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl text-red-600 text-sm font-medium animate-shake flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px]">error</span>
          <span>{error.value}</span>
        </div>
      )}

      {/* Role Playful Selector */}
      <div class="stagger-item bg-white/40 p-1.5 rounded-2xl border border-white/60 shadow-inner flex backdrop-blur-sm opacity-0">
        {["admin", "guru", "siswa"].map((role) => (
          <label key={role} class="relative flex-1 cursor-pointer group">
            <input 
              checked={activeRole.value === role} 
              onChange$={() => activeRole.value = role}
              class="peer sr-only" 
              name="role" 
              type="radio" 
              value={role}
            />
            <div class="flex h-11 items-center justify-center rounded-xl text-xs font-bold text-slate-500 transition-all duration-300 peer-checked:bg-white peer-checked:text-primary peer-checked:shadow-sm hover:bg-white/50 capitalize relative z-10">
              {role}
            </div>
            {/* Playful background effect on hover */}
            <div class="absolute inset-0 rounded-xl bg-primary/5 scale-50 opacity-0 transition-transform duration-300 group-hover:scale-100 group-hover:opacity-100 peer-checked:hidden"></div>
          </label>
        ))}
      </div>

      {/* Input Fields */}
      <div class="space-y-4">
        <div class="stagger-item opacity-0">
          <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1" for="username">Email atau Username</label>
          <div class="relative group">
            <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-primary">
              <span class="material-symbols-outlined text-[20px]">person</span>
            </span>
            <input 
              class="block w-full rounded-2xl border border-white/60 bg-white/40 pl-12 pr-4 py-3 text-sm text-slate-800 font-medium transition-all backdrop-blur-md focus:bg-white focus:border-primary/50 focus:ring-[3px] focus:ring-primary/20 hover:bg-white/60 outline-none" 
              id="username" 
              placeholder="Ketik ID kamu disini" 
              required 
              type="text" 
              bind:value={username}
            />
          </div>
        </div>

        <div class="stagger-item opacity-0">
          <div class="flex items-center justify-between mb-1.5 ml-1">
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider" for="password">Kata Sandi</label>
            <a class="text-[11px] font-bold text-primary hover:text-indigo-600 transition-colors hover:underline" href="#">Lupa password?</a>
          </div>
          <div class="relative group">
            <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-primary">
              <span class="material-symbols-outlined text-[20px]">lock</span>
            </span>
            <input 
              class="block w-full rounded-2xl border border-white/60 bg-white/40 pl-12 pr-4 py-3 text-sm text-slate-800 font-medium transition-all backdrop-blur-md focus:bg-white focus:border-primary/50 focus:ring-[3px] focus:ring-primary/20 hover:bg-white/60 outline-none" 
              id="password" 
              placeholder="••••••••" 
              required 
              type="password" 
              bind:value={password}
            />
          </div>
        </div>
      </div>

      <div class="stagger-item opacity-0 flex items-center ml-1">
        <label class="flex items-center cursor-pointer group">
          <div class="relative flex items-center justify-center">
            <input type="checkbox" id="remember" class="peer sr-only" />
            <div class="w-4 h-4 rounded border-[1.5px] border-slate-300 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center group-hover:border-primary">
              <span class="material-symbols-outlined text-white text-[12px] opacity-0 peer-checked:opacity-100 transition-opacity font-bold">check</span>
            </div>
          </div>
          <span class="ml-2.5 text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">Ingat Saya</span>
        </label>
      </div>

      <button 
        class="stagger-item opacity-0 group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-secondary p-[2px] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none disabled:transform-none shadow-xl shadow-primary/20 mt-2" 
        type="submit"
        disabled={loading.value}
      >
        <span class="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100 mix-blend-overlay"></span>
        <div class="relative flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-white font-bold text-sm">
          {loading.value ? (
             <span class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
          ) : (
             <>
               <span>Gass Masuk!</span>
               <span class="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">rocket_launch</span>
             </>
          )}
        </div>
      </button>

      {/* Demo Credentials Snippet inside actual UI for playful touch */}
      <div class="stagger-item opacity-0 pb-4 pt-0">
         <div class="w-full py-2.5 rounded-xl border border-secondary/50 text-slate-600 bg-secondary/10 flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-secondary text-lg">hotel_class</span>
            <span class="text-xs font-semibold">Demo: Admin (admin / admin123)</span>
         </div>
      </div>
    </form>
  );
});
