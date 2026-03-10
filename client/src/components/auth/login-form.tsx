import { component$, useSignal, $ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { authApi, setToken, setStoredUser } from "~/lib/api";
import { getDashboardPath } from "~/lib/auth";

// ─── Login Form Component ───────────────────────────────

export const LoginForm = component$(() => {
  const username = useSignal("");
  const password = useSignal("");
  const error = useSignal("");
  const loading = useSignal(false);
  const activeRole = useSignal("Siswa");
  const nav = useNavigate();

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
    <>
      {/* Role Selector Component */}
      <div class="px-8 py-2">
        <div class="flex h-11 items-center justify-center rounded-lg bg-primary-500/5 p-1 border border-primary-500/10">
          {["Admin", "Guru", "Siswa"].map((role) => (
            <label key={role} class={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 text-sm font-semibold transition-all ${activeRole.value === role ? 'bg-white dark:bg-slate-800 shadow-sm text-primary-500' : 'text-slate-500 dark:text-slate-400'}`}>
              <span class="truncate">{role}</span>
              <input 
                class="invisible w-0" 
                name="role" 
                type="radio" 
                value={role} 
                checked={activeRole.value === role}
                onChange$={() => activeRole.value = role}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Login Form */}
      <form class="px-8 pt-6 pb-10 flex flex-col gap-5" preventdefault:submit onSubmit$={handleLogin}>
        {error.value && (
          <div class="mb-2 p-3 bg-red-100 border border-red-200 rounded-lg text-red-600 text-sm animate-shake">
            {error.value}
          </div>
        )}

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1" for="identifier">Email atau Username</label>
          <div class="relative group">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors text-[20px]">person</span>
            <input 
              class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400" 
              id="identifier" 
              placeholder="Masukkan ID anda" 
              type="text"
              bind:value={username}
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <div class="flex justify-between items-center ml-1">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300" for="password">Kata Sandi</label>
            <a class="text-xs font-semibold text-primary-500 hover:text-primary-700 hover:underline transition-colors" href="#">Lupa password?</a>
          </div>
          <div class="relative group">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors text-[20px]">lock</span>
            <input 
              class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400" 
              id="password" 
              placeholder="••••••••" 
              type="password"
              bind:value={password}
            />
          </div>
        </div>

        <div class="flex items-center gap-2 px-1">
          <input class="size-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500 transition-all accent-primary-500" id="remember" type="checkbox"/>
          <label class="text-sm text-slate-600 dark:text-slate-400" for="remember">Ingat saya di perangkat ini</label>
        </div>

        <button 
          class="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-2 mt-2 border-b-4 border-primary-700 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed" 
          type="submit"
          disabled={loading.value}
        >
          {loading.value ? "Memproses..." : "Masuk"}
          <span class="material-symbols-outlined text-[20px]">login</span>
        </button>
      </form>

      {/* Demo credentials hint */}
      <div class="px-8 pb-6">
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700">
          <p class="text-xs text-slate-500 font-medium mb-2">Demo Akun:</p>
          <div class="grid grid-cols-3 gap-1 text-xs text-slate-600 dark:text-slate-400">
            <div>Admin</div><div>admin</div><div>admin123</div>
            <div>Proctor</div><div>operator</div><div>operator123</div>
            <div>Siswa</div><div>siswa1</div><div>siswa123</div>
          </div>
        </div>
      </div>
    </>
  );
});
