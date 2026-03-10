import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useNavigate } from "@builder.io/qwik-city";
import { getUserData, isAuthenticated, logout } from "~/lib/auth";
import { getWsClient } from "~/lib/ws";
import { Clock } from "~/components/ui/clock";

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
    if (!isAuthenticated()) { await nav("/"); return; }
    user.value = getUserData();
    if (user.value?.role !== "OPERATOR" && user.value?.role !== "ADMIN") {
      await nav("/"); return;
    }

    const ws = getWsClient();
    ws.connect();

    ws.on("connected", () => {
      connected.value = true;
      ws.send("proctor:join", {});
    });
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
    if (s === "active") return "bg-success/10 text-success border-success/20";
    if (s === "flagged") return "bg-danger/10 text-danger border-danger/20";
    if (s === "submitted") return "bg-info/10 text-info border-info/20";
    return "bg-surface-700/10 text-surface-400 border-surface-600/20";
  };
  const statusLabel = (s: string) => s === "active" ? "Aktif" : s === "flagged" ? "Ditandai" : s === "submitted" ? "Selesai" : "Idle";
  const cheatLabel: Record<string, string> = {
    TAB_SWITCH: "Pindah Tab", FULLSCREEN_EXIT: "Keluar Fullscreen",
    WINDOW_BLUR: "Window Blur", COPY_PASTE: "Copy/Paste",
    RIGHT_CLICK: "Klik Kanan", DEVTOOLS: "DevTools", CAMERA_OFF: "Kamera Mati",
  };

  const activeN = () => students.value.filter(s => s.status === "active").length;
  const flaggedN = () => students.value.filter(s => s.status === "flagged").length;
  const submittedN = () => students.value.filter(s => s.status === "submitted").length;
  const camOffN = () => students.value.filter(s => !s.cameraEnabled).length;

  return (
    <div class="min-h-screen bg-surface-900 bg-gradient-mesh">
      {/* Header */}
      <header class="glass sticky top-0 z-40">
        <div class="max-w-full mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-md shadow-primary-500/20">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span class="font-bold text-gradient text-lg tracking-tight">Proctor Dashboard</span>
              
              <div class={`ml-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${connected.value ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                <div class={`w-1.5 h-1.5 rounded-full ${connected.value ? 'bg-success animate-pulse' : 'bg-danger'}`} />
                {connected.value ? "Live" : "Offline"}
              </div>
            </div>
            
            <div class="md:hidden">
              <Clock />
            </div>
          </div>
          
          <div class="flex items-center justify-between md:justify-end gap-6">
            <div class="hidden md:block">
              <Clock />
            </div>
            
            <div class="flex items-center gap-4 border-l border-surface-200 pl-4">
              <button onClick$={() => nav("/admin/")} class="text-xs px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors font-medium border border-primary-200">
                ← Admin Panel
              </button>
              
              <div class="flex items-center gap-3 cursor-pointer group" onClick$={() => nav('/profile/')}>
                <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-400 to-secondary-500 flex items-center justify-center text-white ring-2 ring-white shadow-sm transition-transform group-hover:scale-105">
                  <span class="text-sm font-bold">{user.value?.fullName?.charAt(0) || "P"}</span>
                </div>
                <div class="hidden sm:block text-left">
                  <div class="text-sm text-surface-800 font-semibold leading-tight">{user.value?.fullName}</div>
                  <div class="text-xs text-surface-500 leading-tight capitalize">{user.value?.role.toLowerCase()}</div>
                </div>
              </div>
              
              <button
                onClick$={() => { logout(); }}
                class="p-2 rounded-lg text-surface-500 hover:text-danger hover:bg-danger/10 transition-colors"
                title="Keluar"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div class="px-6 py-4 border-b border-surface-800">
        <div class="grid grid-cols-5 gap-3">
          {[
            { label: "Total Online", value: students.value.length, color: "text-surface-100" },
            { label: "🟢 Aktif", value: activeN(), color: "text-success" },
            { label: "🔴 Ditandai", value: flaggedN(), color: "text-danger" },
            { label: "✅ Selesai", value: submittedN(), color: "text-info" },
            { label: "📷 Kamera OFF", value: camOffN(), color: "text-warning" },
          ].map((stat) => (
            <div key={stat.label} class="glass rounded-xl p-4 card-hover">
              <div class={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div class="text-xs text-surface-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div class="px-6 py-6 flex gap-6">
        {/* Student Grid */}
        <div class="flex-1">
          <h2 class="text-lg font-semibold text-surface-200 mb-4">Siswa Online ({students.value.length})</h2>
          {students.value.length === 0 ? (
            <div class="glass rounded-2xl p-12 text-center">
              <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-800 flex items-center justify-center animate-float">
                <svg class="w-8 h-8 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p class="text-surface-400 text-sm">Menunggu siswa memulai ujian...</p>
            </div>
          ) : (
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {students.value.map((st, i) => (
                <div key={st.id} class={`glass rounded-xl p-4 card-hover animate-fade-in ${st.status === "flagged" ? "ring-1 ring-danger/30" : ""}`} style={`animation-delay:${i * 50}ms`}>
                  <div class="flex items-center gap-2 mb-3">
                    <div class="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-xs font-bold text-white">
                      {st.fullName.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </div>
                    <p class="text-sm font-medium text-surface-200 truncate">{st.fullName}</p>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusStyle(st.status)}`}>
                      {statusLabel(st.status)}
                    </span>
                    {st.cheatCount > 0 && <span class="text-xs px-1.5 py-0.5 rounded bg-danger/10 text-danger font-bold">⚠ {st.cheatCount}</span>}
                  </div>
                  {!st.cameraEnabled && <div class="mt-2 text-xs text-warning/80">📷 OFF</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alert Feed */}
        <div class="w-80 shrink-0 hidden lg:block">
          <h3 class="text-sm font-semibold text-surface-300 mb-3 flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-danger animate-pulse" /> Live Alerts
          </h3>
          <div class="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {alerts.value.length === 0 && <div class="glass rounded-xl p-4 text-center"><p class="text-surface-500 text-xs">Belum ada pelanggaran</p></div>}
            {alerts.value.map((a, i) => (
              <div key={i} class="glass rounded-xl p-3 border-l-2 border-danger animate-slide-right">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-bold text-danger">{cheatLabel[a.cheatType] || a.cheatType}</span>
                  <span class="text-[10px] text-surface-500">{new Date(a.timestamp).toLocaleTimeString("id-ID")}</span>
                </div>
                <p class="text-xs text-surface-300">{a.student.fullName}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = { title: "Proctor Dashboard — Examinator" };
