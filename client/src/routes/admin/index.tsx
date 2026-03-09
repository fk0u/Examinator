import { component$, useSignal, useVisibleTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useNavigate } from "@builder.io/qwik-city";
import { examsApi, usersApi, cheatLogsApi } from "~/lib/api";
import { getUserData, isAuthenticated, logout } from "~/lib/auth";

export default component$(() => {
  const nav = useNavigate();
  const user = useSignal<any>(null);
  const exams = useSignal<any[]>([]);
  const users = useSignal<any[]>([]);
  const stats = useSignal<any>(null);
  const loading = useSignal(true);
  const activeTab = useSignal<"overview" | "exams" | "users">("overview");

  // Create exam form
  const showCreateExam = useSignal(false);
  const newExam = useSignal({ title: "", subject: "", duration: 60, description: "", passingScore: 70 });

  useVisibleTask$(async () => {
    if (!isAuthenticated()) { await nav("/"); return; }
    user.value = getUserData();
    if (user.value?.role !== "ADMIN") { await nav("/"); return; }

    try {
      const [examData, userData, statsData] = await Promise.all([
        examsApi.list(), usersApi.list(), cheatLogsApi.stats(),
      ]);
      exams.value = examData.exams || [];
      users.value = userData.users || [];
      stats.value = statsData.stats;
    } catch { /* silently */ }
    loading.value = false;
  });

  const createExam = $(async () => {
    try {
      const data = await examsApi.create(newExam.value);
      exams.value = [data.exam, ...exams.value];
      showCreateExam.value = false;
      newExam.value = { title: "", subject: "", duration: 60, description: "", passingScore: 70 };
    } catch (e: any) { alert("Gagal: " + e.message); }
  });

  const toggleExam = $(async (id: string, active: boolean) => {
    try {
      await examsApi.update(id, { active: !active });
      exams.value = exams.value.map(e => e.id === id ? { ...e, active: !active } : e);
    } catch { /* silently */ }
  });

  const deleteExam = $(async (id: string) => {
    if (!confirm("Hapus ujian ini?")) return;
    try {
      await examsApi.delete(id);
      exams.value = exams.value.filter(e => e.id !== id);
    } catch { /* silently */ }
  });

  return (
    <div class="min-h-screen bg-surface-900 bg-gradient-mesh">
      {/* Header */}
      <header class="glass border-b border-surface-700/50 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span class="font-bold text-gradient text-sm">Admin Panel</span>
          </div>
          <div class="flex items-center gap-4">
            <button onClick$={() => nav("/proctor/")} class="text-xs px-3 py-1.5 rounded-lg bg-surface-800 text-surface-300 hover:bg-surface-700 transition-colors">
              Proctor View →
            </button>
            <span class="text-sm text-surface-400">{user.value?.fullName}</span>
            <button onClick$={() => logout()} class="text-sm text-surface-400 hover:text-danger transition-colors">Keluar</button>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div class="flex gap-1 mb-6 p-1 bg-surface-800/50 rounded-xl w-fit">
          {(["overview", "exams", "users"] as const).map(tab => (
            <button key={tab} onClick$={() => { activeTab.value = tab; }}
              class={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab.value === tab ? "bg-gradient-primary text-white shadow-lg" : "text-surface-400 hover:text-surface-200"}`}>
              {tab === "overview" ? "📊 Overview" : tab === "exams" ? "📝 Ujian" : "👥 Users"}
            </button>
          ))}
        </div>

        {loading.value ? (
          <div class="flex justify-center py-20"><div class="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab.value === "overview" && (
              <div class="animate-fade-in">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Total Ujian", value: exams.value.length, icon: "📝", color: "text-primary-400" },
                    { label: "Ujian Aktif", value: exams.value.filter(e => e.active).length, icon: "🟢", color: "text-success" },
                    { label: "Total User", value: users.value.length, icon: "👥", color: "text-info" },
                    { label: "Total Pelanggaran", value: stats.value?.totalLogs || 0, icon: "⚠️", color: "text-danger" },
                  ].map(s => (
                    <div key={s.label} class="glass rounded-xl p-5 card-hover">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-2xl">{s.icon}</span>
                        <span class={`text-2xl font-bold ${s.color}`}>{s.value}</span>
                      </div>
                      <p class="text-xs text-surface-400">{s.label}</p>
                    </div>
                  ))}
                </div>
                {stats.value?.byType?.length > 0 && (
                  <div class="glass rounded-xl p-5">
                    <h3 class="text-sm font-semibold text-surface-200 mb-4">Pelanggaran per Tipe</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {stats.value.byType.map((t: any) => (
                        <div key={t.type} class="bg-surface-800/50 rounded-lg p-3 flex items-center justify-between">
                          <span class="text-xs text-surface-400">{t.type.replace("_", " ")}</span>
                          <span class="text-sm font-bold text-danger">{t.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Exams Tab */}
            {activeTab.value === "exams" && (
              <div class="animate-fade-in">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-lg font-semibold text-surface-200">Kelola Ujian</h2>
                  <button onClick$={() => { showCreateExam.value = !showCreateExam.value; }}
                    class="px-4 py-2 rounded-xl bg-gradient-primary text-white text-sm font-medium hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary-500/20">
                    + Buat Ujian
                  </button>
                </div>

                {showCreateExam.value && (
                  <div class="glass rounded-xl p-5 mb-4 animate-fade-in">
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-xs text-surface-400 mb-1">Judul Ujian</label>
                        <input class="w-full px-3 py-2 bg-surface-800/50 border border-surface-600/50 rounded-lg text-sm text-surface-100 focus:outline-none focus:border-primary-500"
                          value={newExam.value.title} onInput$={(e) => { newExam.value = { ...newExam.value, title: (e.target as HTMLInputElement).value }; }} />
                      </div>
                      <div>
                        <label class="block text-xs text-surface-400 mb-1">Mata Pelajaran</label>
                        <input class="w-full px-3 py-2 bg-surface-800/50 border border-surface-600/50 rounded-lg text-sm text-surface-100 focus:outline-none focus:border-primary-500"
                          value={newExam.value.subject} onInput$={(e) => { newExam.value = { ...newExam.value, subject: (e.target as HTMLInputElement).value }; }} />
                      </div>
                      <div>
                        <label class="block text-xs text-surface-400 mb-1">Durasi (menit)</label>
                        <input type="number" class="w-full px-3 py-2 bg-surface-800/50 border border-surface-600/50 rounded-lg text-sm text-surface-100 focus:outline-none focus:border-primary-500"
                          value={newExam.value.duration} onInput$={(e) => { newExam.value = { ...newExam.value, duration: parseInt((e.target as HTMLInputElement).value) }; }} />
                      </div>
                      <div>
                        <label class="block text-xs text-surface-400 mb-1">KKM</label>
                        <input type="number" class="w-full px-3 py-2 bg-surface-800/50 border border-surface-600/50 rounded-lg text-sm text-surface-100 focus:outline-none focus:border-primary-500"
                          value={newExam.value.passingScore} onInput$={(e) => { newExam.value = { ...newExam.value, passingScore: parseInt((e.target as HTMLInputElement).value) }; }} />
                      </div>
                    </div>
                    <div class="mt-4 flex justify-end gap-2">
                      <button onClick$={() => { showCreateExam.value = false; }} class="px-4 py-2 rounded-lg bg-surface-700 text-surface-300 text-sm hover:bg-surface-600 transition-colors">Batal</button>
                      <button onClick$={createExam} class="px-4 py-2 rounded-lg bg-gradient-primary text-white text-sm font-medium">Simpan</button>
                    </div>
                  </div>
                )}

                <div class="space-y-2">
                  {exams.value.map(exam => (
                    <div key={exam.id} class="glass rounded-xl p-4 flex items-center justify-between card-hover">
                      <div class="flex items-center gap-4 flex-1 min-w-0">
                        <div>
                          <h3 class="text-sm font-medium text-surface-200">{exam.title}</h3>
                          <p class="text-xs text-surface-500">{exam.subject} • {exam.duration} menit • {exam._count?.questions || 0} soal</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <button onClick$={() => toggleExam(exam.id, exam.active)}
                          class={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${exam.active ? "bg-success/10 text-success border border-success/20" : "bg-surface-700 text-surface-400"}`}>
                          {exam.active ? "Aktif" : "Nonaktif"}
                        </button>
                        <button onClick$={() => deleteExam(exam.id)} class="px-2 py-1 rounded-lg text-xs text-danger hover:bg-danger/10 transition-colors">
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab.value === "users" && (
              <div class="animate-fade-in">
                <h2 class="text-lg font-semibold text-surface-200 mb-4">Kelola Pengguna ({users.value.length})</h2>
                <div class="glass rounded-xl overflow-hidden">
                  <table class="w-full">
                    <thead class="bg-surface-800/50">
                      <tr>
                        <th class="text-left text-xs font-medium text-surface-400 px-4 py-3">Nama</th>
                        <th class="text-left text-xs font-medium text-surface-400 px-4 py-3">Username</th>
                        <th class="text-left text-xs font-medium text-surface-400 px-4 py-3">Role</th>
                        <th class="text-left text-xs font-medium text-surface-400 px-4 py-3">Kelas</th>
                        <th class="text-left text-xs font-medium text-surface-400 px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-surface-800">
                      {users.value.map(u => (
                        <tr key={u.id} class="hover:bg-surface-800/30 transition-colors">
                          <td class="px-4 py-3 text-sm text-surface-200">{u.fullName}</td>
                          <td class="px-4 py-3 text-sm text-surface-400 font-mono">{u.username}</td>
                          <td class="px-4 py-3"><span class={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "ADMIN" ? "bg-primary-500/10 text-primary-400" : u.role === "OPERATOR" ? "bg-info/10 text-info" : "bg-surface-700 text-surface-300"}`}>{u.role}</span></td>
                          <td class="px-4 py-3 text-sm text-surface-400">{u.kelas || "-"}</td>
                          <td class="px-4 py-3"><span class={`text-xs ${u.active ? "text-success" : "text-surface-500"}`}>{u.active ? "Aktif" : "Nonaktif"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
});

export const head: DocumentHead = { title: "Admin Panel — Examinator" };
