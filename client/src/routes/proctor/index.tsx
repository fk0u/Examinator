import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useNavigate } from "@builder.io/qwik-city";
import { getUserData, isAuthenticated, logout } from "~/lib/auth";
import { getWsClient } from "~/lib/ws";
import { Clock } from "~/components/ui/clock";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import { initTheme } from "~/lib/theme";

interface Student {
  id: string;
  userId: string;
  fullName: string;
  attemptId: string;
  examId: string;
  cameraEnabled: boolean;
  status: "active" | "idle" | "flagged" | "submitted";
  cheatCount: number;
  lastActivity: number;
}

interface CheatAlert {
  student: Student;
  cheatType: string;
  description: string;
  timestamp: string;
}

export default component$(() => {
  const nav = useNavigate();
  const user = useSignal<any>(null);
  const students = useSignal<Student[]>([]);
  const alerts = useSignal<CheatAlert[]>([]);
  const connected = useSignal(false);

  useVisibleTask$(async () => {
    initTheme();
    if (!isAuthenticated()) { await nav("/"); return; }
    user.value = getUserData();
    if (user.value?.role !== "OPERATOR" && user.value?.role !== "ADMIN") {
      await nav("/"); return;
    }

    const ws = getWsClient();
    ws.connect();

    ws.on("connected", () => { connected.value = true; ws.send("proctor:join", {}); });
    ws.on("disconnected", () => { connected.value = false; });
    ws.on("proctor:state", (data: any) => { students.value = data.students || []; });
    ws.on("student:joined", (data: any) => {
      students.value = [...students.value.filter(s => s.id !== data.student.id), data.student];
    });
    ws.on("student:disconnected", (data: any) => {
      students.value = students.value.filter(s => s.id !== data.student.id);
    });
    ws.on("student:submitted", (data: any) => {
      students.value = students.value.map(s =>
        s.id === data.student.id ? { ...s, status: "submitted" as const } : s
      );
    });
    ws.on("cheat:alert", (data: any) => {
      students.value = students.value.map(s =>
        s.id === data.student.id ? { ...s, status: "flagged" as const, cheatCount: data.student.cheatCount } : s
      );
      alerts.value = [data, ...alerts.value].slice(0, 100);
    });
  });

  const statusStyle = (s: string) => {
    if (s === "active")    return "bg-emerald-50 text-emerald-600 border-emerald-200";
    if (s === "flagged")   return "bg-rose-50 text-rose-600 border-rose-200";
    if (s === "submitted") return "bg-blue-50 text-blue-600 border-blue-200";
    return "bg-slate-100 text-slate-400 border-slate-200";
  };
  const statusLabel = (s: string) =>
    s === "active" ? "Aktif" : s === "flagged" ? "Ditandai" : s === "submitted" ? "Selesai" : "Idle";

  const cheatLabel: Record<string, string> = {
    TAB_SWITCH: "Pindah Tab", FULLSCREEN_EXIT: "Keluar Fullscreen",
    WINDOW_BLUR: "Window Blur", COPY_PASTE: "Copy/Paste",
    RIGHT_CLICK: "Klik Kanan", DEVTOOLS: "DevTools", CAMERA_OFF: "Kamera Mati",
  };

  const activeN    = () => students.value.filter(s => s.status === "active").length;
  const flaggedN   = () => students.value.filter(s => s.status === "flagged").length;
  const submittedN = () => students.value.filter(s => s.status === "submitted").length;
  const camOffN    = () => students.value.filter(s => !s.cameraEnabled).length;

  return (
    <div class="min-h-screen bg-[#fdfdfd] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-x-hidden selection:bg-blue-500/20 selection:text-blue-700 transition-colors duration-300">

      {/* ── BACKGROUND BLOBS ── */}
      <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden dark:opacity-40">
        <div class="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full opacity-20 mix-blend-multiply filter blur-[100px]"
          style="background: radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)" />
        <div class="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-15 mix-blend-multiply filter blur-[120px]"
          style="background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)" />
      </div>

      {/* ══════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════ */}
      <header class="sticky top-0 z-50 w-full bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div class="max-w-full mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4">

          {/* Left: logo + title + live badge */}
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <span class="text-base font-[900] tracking-tight text-slate-900 dark:text-white">Proctor Dashboard</span>
              <span class="hidden sm:inline text-slate-300 mx-2">·</span>
              <span class="hidden sm:inline text-xs font-semibold text-slate-400 dark:text-slate-500">Examinator</span>
            </div>

            {/* Live / Offline pill */}
            <div class={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${
              connected.value
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-rose-50 text-rose-500 border-rose-200"
            }`}>
              <span class={`w-1.5 h-1.5 rounded-full ${connected.value ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              {connected.value ? "Live" : "Offline"}
            </div>
          </div>

          {/* Right: clock + nav + user + logout */}
          <div class="flex items-center gap-3">
            <div class="hidden md:block">
              <Clock />
            </div>

            {user.value?.role === "ADMIN" && (
              <button
                onClick$={() => nav("/admin/")}
                class="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/50 transition-all"
              >
                <span class="material-symbols-outlined text-[14px]">arrow_back</span>
                Admin Panel
              </button>
            )}

            {/* User pill */}
            <button
              class="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-all shadow-sm"
              onClick$={() => nav("/profile/")}
            >
              <div class="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-[800] text-sm shadow-sm">
                {user.value?.fullName?.charAt(0) || "P"}
              </div>
              <div class="hidden sm:flex flex-col items-start leading-tight">
                <span class="text-xs font-bold text-slate-800 dark:text-slate-100">{user.value?.fullName}</span>
                <span class="text-[10px] text-slate-400 capitalize">{user.value?.role?.toLowerCase()}</span>
              </div>
            </button>

            <ThemeToggle />

            {/* Logout */}
            <button
              onClick$={() => { logout(); }}
              class="flex items-center gap-1.5 px-3 py-2 rounded-full border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 text-red-500 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 hover:border-red-300 transition-all"
              title="Keluar"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════ */}
      <div class="relative z-10 border-b border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
        <div class="max-w-full mx-auto px-5 sm:px-8 py-4">
          <div class="grid grid-cols-5 gap-3">
            {[
              { label: "Total Online",  value: students.value.length, icon: "wifi",          bg: "bg-slate-50",    border: "border-slate-200",   text: "text-slate-700",   icolor: "text-slate-400"    },
              { label: "Aktif",         value: activeN(),              icon: "check_circle",  bg: "bg-emerald-50",  border: "border-emerald-200", text: "text-emerald-700", icolor: "text-emerald-500"  },
              { label: "Ditandai",      value: flaggedN(),             icon: "warning",       bg: "bg-rose-50",     border: "border-rose-200",    text: "text-rose-700",    icolor: "text-rose-500"     },
              { label: "Selesai",       value: submittedN(),           icon: "task_alt",      bg: "bg-blue-50",     border: "border-blue-200",    text: "text-blue-700",    icolor: "text-blue-500"     },
              { label: "Kamera OFF",    value: camOffN(),              icon: "videocam_off",  bg: "bg-amber-50",    border: "border-amber-200",   text: "text-amber-700",   icolor: "text-amber-500"    },
            ].map(stat => (
              <div key={stat.label} class={`${stat.bg} dark:bg-slate-800/80 border ${stat.border} dark:border-slate-700/50 rounded-2xl px-4 py-3 flex items-center gap-3`}>
                <div class={`w-8 h-8 rounded-lg ${stat.bg} border ${stat.border} flex items-center justify-center flex-shrink-0`}>
                  <span class={`material-symbols-outlined text-base ${stat.icolor}`}>{stat.icon}</span>
                </div>
                <div>
                  <div class={`text-xl font-[900] tracking-tight ${stat.text}`}>{stat.value}</div>
                  <div class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN: Student Grid + Alert Feed
      ══════════════════════════════════════════════════════ */}
      <div class="relative z-10 max-w-full mx-auto px-5 sm:px-8 py-6 flex gap-5">

        {/* ── STUDENT GRID ── */}
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-3 mb-5">
            <h2 class="text-base font-[900] tracking-tight text-slate-900 dark:text-white">Siswa Online</h2>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              {students.value.length} Peserta
            </span>
          </div>

          {students.value.length === 0 ? (
            /* Empty state */
            <div class="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] p-16 text-center">
              <div class="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <span class="material-symbols-outlined text-3xl text-slate-300">groups</span>
              </div>
              <p class="text-slate-400 dark:text-slate-500 font-semibold text-sm">Menunggu siswa memulai ujian...</p>
              <p class="text-slate-300 dark:text-slate-600 text-xs mt-1">Siswa akan muncul otomatis saat terhubung</p>
            </div>
          ) : (
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {students.value.map((st, i) => (
                <div
                  key={st.id}
                  class={`bg-white rounded-2xl border p-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${
                    st.status === "flagged"
                      ? "border-rose-200 shadow-[0_0_0_1px_rgba(244,63,94,0.1)] bg-rose-50/30"
                      : "border-slate-100 dark:border-slate-700 dark:bg-slate-800/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.06)]"
                  }`}
                  style={`animation-delay:${i * 40}ms`}
                >
                  {/* Avatar + name */}
                  <div class="flex items-center gap-2 mb-3">
                    <div class={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-[800] text-white flex-shrink-0 ${
                      st.status === "flagged" ? "bg-gradient-to-br from-rose-500 to-red-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"
                    }`}>
                      {st.fullName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <p class="text-xs font-[700] text-slate-800 dark:text-slate-100 truncate leading-tight">{st.fullName}</p>
                  </div>

                  {/* Status + cheat count */}
                  <div class="flex items-center justify-between gap-1">
                    <span class={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle(st.status)}`}>
                      <span class={`w-1 h-1 rounded-full ${
                        st.status === "active" ? "bg-emerald-500" :
                        st.status === "flagged" ? "bg-rose-500" :
                        st.status === "submitted" ? "bg-blue-500" : "bg-slate-400"
                      }`} />
                      {statusLabel(st.status)}
                    </span>
                    {st.cheatCount > 0 && (
                      <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-600 font-[800]">
                        ⚠ {st.cheatCount}
                      </span>
                    )}
                  </div>

                  {/* Camera off warning */}
                  {!st.cameraEnabled && (
                    <div class="mt-2 flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                      <span class="material-symbols-outlined text-[12px]">videocam_off</span>
                      Kamera Mati
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── ALERT FEED ── */}
        <div class="w-72 shrink-0 hidden lg:block">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <h3 class="text-sm font-[800] tracking-tight text-slate-900 dark:text-white">Live Alerts</h3>
            {alerts.value.length > 0 && (
              <span class="ml-auto inline-flex items-center px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[10px] font-bold text-rose-600">
                {alerts.value.length}
              </span>
            )}
          </div>

          <div class="space-y-2 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
            {alerts.value.length === 0 ? (
              <div class="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-6 text-center shadow-sm">
                <span class="material-symbols-outlined text-3xl text-slate-200 block mb-2">shield</span>
                <p class="text-slate-400 text-xs font-semibold">Belum ada pelanggaran</p>
              </div>
            ) : alerts.value.map((a, i) => (
              <div key={i} class="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/50 border-l-2 border-l-rose-400 p-3 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    <span class="material-symbols-outlined text-[10px]">warning</span>
                    {cheatLabel[a.cheatType] || a.cheatType}
                  </span>
                  <span class="text-[10px] text-slate-400 font-mono">{new Date(a.timestamp).toLocaleTimeString("id-ID")}</span>
                </div>
                <p class="text-xs font-[700] text-slate-700 dark:text-slate-200">{a.student.fullName}</p>
                {a.description && <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{a.description}</p>}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
});

export const head: DocumentHead = { title: "Proctor Dashboard — Examinator" };
