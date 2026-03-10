import { component$, useSignal, $ } from "@builder.io/qwik";
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
      <form class="px-8 py-2" preventdefault:submit onSubmit$={handleLogin}>
        {error.value && (
          <div class="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-600 text-sm animate-shake">
            {error.value}
          </div>
        )}

        {/* Role Selector Toggle */}
        <div class="flex h-11 items-center justify-center rounded-lg bg-primary/5 p-1 border border-primary/10">
          <label class="relative flex-1 cursor-pointer">
            <input 
              checked={activeRole.value === "admin"} 
              onChange$={() => activeRole.value = "admin"}
              class="peer sr-only" 
              name="role" 
              type="radio" 
              value="admin"
            />
            <div class="flex h-full items-center justify-center rounded-md text-xs font-semibold text-slate-500 transition-all peer-checked:bg-white peer-checked:text-primary peer-checked:shadow-sm">Admin</div>
          </label>
          <label class="relative flex-1 cursor-pointer">
            <input 
              checked={activeRole.value === "guru"}
              onChange$={() => activeRole.value = "guru"}
              class="peer sr-only" 
              name="role" 
              type="radio" 
              value="guru"
            />
            <div class="flex h-full items-center justify-center rounded-md text-xs font-semibold text-slate-500 transition-all peer-checked:bg-white peer-checked:text-primary peer-checked:shadow-sm">Guru</div>
          </label>
          <label class="relative flex-1 cursor-pointer">
            <input 
              checked={activeRole.value === "siswa"}
              onChange$={() => activeRole.value = "siswa"}
              class="peer sr-only" 
              name="role" 
              type="radio" 
              value="siswa"
            />
            <div class="flex h-full items-center justify-center rounded-md text-xs font-semibold text-slate-500 transition-all peer-checked:bg-slate-900 peer-checked:text-white peer-checked:shadow-sm">Siswa</div>
          </label>
        </div>

        {/* Input Fields */}
        <div class="mt-6 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1" for="username">Email atau Username</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <span class="material-symbols-outlined text-lg">person</span>
              </span>
              <input 
                class="block w-full rounded-lg border-slate-200 bg-slate-50/50 pl-10 text-sm py-2.5 transition-colors focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10" 
                id="username" 
                placeholder="Masukkan ID atau Email Anda" 
                required 
                type="text" 
                bind:value={username}
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-semibold text-slate-400" for="password">Kata Sandi</label>
              <a class="text-xs font-semibold text-slate-900 hover:text-primary transition-colors" href="#">Lupa password?</a>
            </div>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <span class="material-symbols-outlined text-lg">lock</span>
              </span>
              <input 
                class="block w-full rounded-lg border-slate-200 bg-slate-50/50 pl-10 text-sm py-2.5 transition-colors focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10" 
                id="password" 
                placeholder="••••••••" 
                required 
                type="password" 
                bind:value={password}
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div class="mt-4 flex items-center">
          <input class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20" id="remember" type="checkbox"/>
          <label class="ml-2 block text-xs text-slate-500" for="remember">Ingat saya di perangkat ini</label>
        </div>

        {/* Submit Button */}
        <button 
          class="group mt-8 relative w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed" 
          type="submit"
          disabled={loading.value}
        >
          <div class="absolute inset-0 w-full h-full bg-primary transition-all group-hover:bg-blue-600"></div>
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <span class="relative z-10 flex items-center gap-2">
            {loading.value ? "Memproses..." : "Masuk ke Dashboard"}
            <span class="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </span>
        </button>
      </form>

      {/* Demo Credentials */}
      <div class="px-8 pb-8 pt-4">
        <div class="bg-slate-50 border border-slate-100 rounded-lg p-4">
          <h3 class="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Demo Akun:</h3>
          <table class="w-full text-xs text-left">
            <tbody class="text-slate-500">
              <tr><th class="py-1 font-medium text-slate-400">Admin</th><td class="py-1 text-primary">admin</td><td class="py-1">admin123</td></tr>
              <tr><th class="py-1 font-medium text-slate-400">Proctor</th><td class="py-1 text-primary">operator</td><td class="py-1">operator123</td></tr>
              <tr><th class="py-1 font-medium text-slate-400">Siswa</th><td class="py-1 text-primary">siswa1</td><td class="py-1">siswa123</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
});
