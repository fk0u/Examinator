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
    <div>
      <h2 class="text-xl font-semibold text-surface-100 mb-6">Masuk ke Akun</h2>

      {/* Error Message */}
      {error.value && (
        <div class="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm animate-shake">
          {error.value}
        </div>
      )}

      {/* Form */}
      <div class="space-y-4">
        {/* Username */}
        <div>
          <label class="block text-sm font-medium text-surface-300 mb-1.5" for="username">
            Username
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              id="username"
              type="text"
              placeholder="Masukkan username"
              class="w-full pl-10 pr-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all duration-200"
              bind:value={username}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label class="block text-sm font-medium text-surface-300 mb-1.5" for="password">
            Password
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              id="password"
              type="password"
              placeholder="Masukkan password"
              class="w-full pl-10 pr-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all duration-200"
              bind:value={password}
              onKeyDown$={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          class="w-full py-2.5 bg-gradient-primary text-white font-medium rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          onClick$={handleLogin}
          disabled={loading.value}
        >
          {loading.value ? (
            <span class="inline-flex items-center gap-2">
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Memproses...
            </span>
          ) : (
            "Masuk"
          )}
        </button>
      </div>

      {/* Demo credentials hint */}
      <div class="mt-6 p-3 rounded-xl bg-surface-800/30 border border-surface-700/50">
        <p class="text-xs text-surface-400 font-medium mb-2">Demo Akun:</p>
        <div class="grid grid-cols-3 gap-1 text-xs text-surface-500">
          <div>Admin</div><div>admin</div><div>admin123</div>
          <div>Proctor</div><div>operator</div><div>operator123</div>
          <div>Siswa</div><div>siswa1</div><div>siswa123</div>
        </div>
      </div>
    </div>
  );
});
