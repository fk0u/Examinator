import { component$, useSignal, useVisibleTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useNavigate } from "@builder.io/qwik-city";
import { examsApi, usersApi, cheatLogsApi } from "~/lib/api";
import { getUserData, isAuthenticated, logout } from "~/lib/auth";
import { exportToCSV } from "~/lib/export";
import { Clock } from "~/components/ui/clock";
import { Greeting } from "~/components/ui/greeting";

export default component$(() => {
  const nav = useNavigate();
  const user = useSignal<any>(null);
  const exams = useSignal<any[]>([]);
  const users = useSignal<any[]>([]);
  const stats = useSignal<any>(null);
  const loading = useSignal(true);
  const activeTab = useSignal<"overview" | "exams" | "users">("overview");
  const searchQuery = useSignal("");

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

  const handleExportUsers = $(() => {
    if (!users.value.length) return;
    const exportData = users.value.map(u => ({
      ID: u.id,
      "Nama Lengkap": u.fullName,
      Username: u.username,
      Role: u.role,
      "Kelas/Jurusan": u.kelas || "-",
      "Status Aktif": u.active ? "Aktif" : "Nonaktif"
    }));
    exportToCSV("examinator_users.csv", exportData);
  });

  const handleExportExams = $(() => {
    if (!exams.value.length) return;
    const exportData = exams.value.map(e => ({
      ID: e.id,
      "Judul Ujian": e.title,
      "Mata Pelajaran": e.subject,
      "Durasi (Menit)": e.duration,
      "Jumlah Soal": e._count?.questions || 0,
      "Nilai KKM": e.passingScore,
      "Status": e.active ? "Aktif" : "Nonaktif",
      "Dibuat Pada": new Date(e.createdAt).toLocaleString("id-ID")
    }));
    exportToCSV("examinator_exams.csv", exportData);
  });

  return (
    <div class="min-h-screen bg-surface-900 bg-gradient-mesh">
      {/* Header */}
      <header class="glass sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-md shadow-primary-500/20">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span class="font-bold text-gradient text-lg tracking-tight">Admin Panel</span>
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
              <button onClick$={() => nav("/proctor/")} class="text-xs px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors font-medium border border-primary-200">
                Proctor View →
              </button>
              
              <div class="flex items-center gap-3 cursor-pointer group" onClick$={() => nav('/profile/')}>
                <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-400 to-secondary-500 flex items-center justify-center text-white ring-2 ring-white shadow-sm transition-transform group-hover:scale-105">
                  <span class="text-sm font-bold">{user.value?.fullName?.charAt(0) || "A"}</span>
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

      <main class="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div class="flex gap-1 mb-8 p-1 bg-surface-100 rounded-xl w-fit border border-surface-200 shadow-sm">
          {(["overview", "exams", "users"] as const).map(tab => (
            <button key={tab} 
              onClick$={() => { 
                activeTab.value = tab; 
                searchQuery.value = ""; 
              }}
              class={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab.value === tab ? "bg-white text-primary-600 shadow-sm border border-surface-200" : "text-surface-500 hover:text-surface-800"}`}>
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
                <div class="mb-8 flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl p-6 shadow-sm border border-surface-200">
                  <div class="text-center sm:text-left">
                    <h1 class="text-2xl font-bold text-surface-800 mb-1">
                      <Greeting name={user.value?.fullName} />
                    </h1>
                    <p class="text-surface-500">
                      Ringkasan statistik sistem Examinator hari ini.
                    </p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Total Ujian", value: exams.value.length, icon: "📝", color: "text-primary-600", bg: "bg-primary-50" },
                    { label: "Ujian Aktif", value: exams.value.filter(e => e.active).length, icon: "🟢", color: "text-success", bg: "bg-green-50" },
                    { label: "Total User", value: users.value.length, icon: "👥", color: "text-info", bg: "bg-blue-50" },
                    { label: "Total Pelanggaran", value: stats.value?.totalLogs || 0, icon: "⚠️", color: "text-danger", bg: "bg-red-50" },
                  ].map(s => (
                    <div key={s.label} class="bg-white rounded-xl p-5 card-hover shadow-sm border border-surface-200 flex items-center gap-4">
                      <div class={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${s.bg}`}>
                        {s.icon}
                      </div>
                      <div>
                        <div class={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        <p class="text-xs font-medium text-surface-500">{s.label}</p>
                      </div>
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
              <div class="animate-fade-in bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
                <div class="p-6 border-b border-surface-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 class="text-lg font-bold text-surface-800">Kelola Ujian</h2>
                  
                  <div class="flex flex-col sm:flex-row items-center gap-3">
                    {/* Search Input */}
                    <div class="relative w-full sm:w-64">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-4 w-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Cari ujian..."
                        class="block w-full pl-10 pr-3 py-2 border border-surface-300 rounded-lg leading-5 bg-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all text-surface-900"
                        value={searchQuery.value}
                        onInput$={(e) => searchQuery.value = (e.target as HTMLInputElement).value}
                      />
                    </div>
                
                    <div class="flex items-center gap-2 w-full sm:w-auto">
                      <button onClick$={handleExportExams} class="flex-1 sm:flex-none justify-center px-4 py-2 rounded-lg bg-surface-100 text-surface-600 border border-surface-200 text-sm hover:bg-surface-200 transition-colors flex items-center gap-2 font-medium">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export CSV
                      </button>
                      <button onClick$={() => { showCreateExam.value = !showCreateExam.value; }}
                        class="flex-1 sm:flex-none justify-center px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 active:scale-[0.98] transition-all shadow-sm">
                        + Buat Ujian
                      </button>
                    </div>
                  </div>
                </div>

                {showCreateExam.value && (
                  <div class="p-6 bg-surface-50 border-b border-surface-200 animate-slide-down">
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label class="block text-xs font-medium text-surface-500 mb-1">Judul Ujian</label>
                        <input class="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm text-surface-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          value={newExam.value.title} onInput$={(e) => { newExam.value = { ...newExam.value, title: (e.target as HTMLInputElement).value }; }} />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-surface-500 mb-1">Mata Pelajaran</label>
                        <input class="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm text-surface-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          value={newExam.value.subject} onInput$={(e) => { newExam.value = { ...newExam.value, subject: (e.target as HTMLInputElement).value }; }} />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-surface-500 mb-1">Durasi (menit)</label>
                        <input type="number" class="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm text-surface-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          value={newExam.value.duration} onInput$={(e) => { newExam.value = { ...newExam.value, duration: parseInt((e.target as HTMLInputElement).value) }; }} />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-surface-500 mb-1">KKM</label>
                        <input type="number" class="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm text-surface-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                          value={newExam.value.passingScore} onInput$={(e) => { newExam.value = { ...newExam.value, passingScore: parseInt((e.target as HTMLInputElement).value) }; }} />
                      </div>
                    </div>
                    <div class="mt-4 flex justify-end gap-2">
                      <button onClick$={() => { showCreateExam.value = false; }} class="px-4 py-2 rounded-lg text-surface-500 font-medium text-sm hover:bg-surface-200 transition-colors border border-transparent hover:border-surface-300">Batal</button>
                      <button onClick$={createExam} class="px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium shadow-sm transition-colors">Simpan Ujian Baru</button>
                    </div>
                  </div>
                )}

                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-surface-200">
                    <thead class="bg-surface-50">
                      <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Info Ujian</th>
                        <th scope="col" class="px-6 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider">Durasi</th>
                        <th scope="col" class="px-6 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider">Soal & KKM</th>
                        <th scope="col" class="px-6 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                        <th scope="col" class="px-6 py-3 text-right text-xs font-semibold text-surface-500 uppercase tracking-wider w-32">Aksi</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-surface-200 text-sm">
                      {exams.value.filter(e => 
                        e.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                        e.subject.toLowerCase().includes(searchQuery.value.toLowerCase())
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={5} class="px-6 py-8 text-center text-surface-500">
                            {searchQuery.value ? "Tidak ada ujian yang sesuai pencarian." : "Belum ada ujian. Silakan buat baru."}
                          </td>
                        </tr>
                      ) : (
                        exams.value.filter(e => 
                          e.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          e.subject.toLowerCase().includes(searchQuery.value.toLowerCase())
                        ).map(exam => (
                          <tr key={exam.id} class="hover:bg-surface-50 transition-colors">
                            <td class="px-6 py-4">
                              <p class="font-bold text-surface-900 mb-0.5">{exam.title}</p>
                              <p class="text-xs text-surface-500 bg-surface-100 inline-block px-2 py-0.5 rounded border border-surface-200">{exam.subject}</p>
                            </td>
                            <td class="px-6 py-4 text-center text-surface-600 font-medium">
                              {exam.duration} mnt
                            </td>
                            <td class="px-6 py-4 text-center">
                              <div class="flex flex-col items-center gap-1">
                                <span class="text-xs text-surface-600 bg-surface-100 px-2 py-0.5 rounded border border-surface-200">{exam._count?.questions || 0} Soal</span>
                                <span class="text-xs text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200 font-medium">KKM: {exam.passingScore}</span>
                              </div>
                            </td>
                            <td class="px-6 py-4 text-center">
                              <button onClick$={() => toggleExam(exam.id, exam.active)}
                                class={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors w-24 border ${exam.active ? "bg-success/10 text-success-700 border-success/30 hover:bg-success/20" : "bg-surface-100 text-surface-500 border-surface-300 hover:bg-surface-200"}`}>
                                {exam.active ? "● Aktif" : "○ Nonaktif"}
                              </button>
                            </td>
                            <td class="px-6 py-4 text-right">
                              <button onClick$={() => deleteExam(exam.id)} class="p-2 rounded-lg text-surface-400 hover:text-danger hover:bg-danger/10 transition-colors" title="Hapus Ujian">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab.value === "users" && (
              <div class="animate-fade-in bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
                <div class="p-6 border-b border-surface-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 class="text-lg font-bold text-surface-800">Kelola Pengguna ({users.value.length})</h2>
                  
                  <div class="flex flex-col sm:flex-row items-center gap-3">
                    {/* Search Input */}
                    <div class="relative w-full sm:w-64">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-4 w-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Cari pengguna..."
                        class="block w-full pl-10 pr-3 py-2 border border-surface-300 rounded-lg leading-5 bg-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all text-surface-900"
                        value={searchQuery.value}
                        onInput$={(e) => searchQuery.value = (e.target as HTMLInputElement).value}
                      />
                    </div>
                
                    <button onClick$={handleExportUsers} class="w-full sm:w-auto px-4 py-2 rounded-lg bg-surface-100 text-surface-600 border border-surface-200 text-sm hover:bg-surface-200 transition-colors flex items-center justify-center gap-2 font-medium">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export CSV
                    </button>
                  </div>
                </div>
                
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-surface-200">
                    <thead class="bg-surface-50">
                      <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Nama Lengkap</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Info Akun</th>
                        <th scope="col" class="px-6 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider">Kelas</th>
                        <th scope="col" class="px-6 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-surface-200 text-sm">
                      {users.value.filter(u => 
                        u.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                        u.username.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                        u.role.toLowerCase().includes(searchQuery.value.toLowerCase())
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={4} class="px-6 py-8 text-center text-surface-500">
                            {searchQuery.value ? "Tidak ada pengguna yang sesuai pencarian." : "Belum ada data pengguna."}
                          </td>
                        </tr>
                      ) : (
                        users.value.filter(u => 
                          u.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          u.username.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          u.role.toLowerCase().includes(searchQuery.value.toLowerCase())
                        ).map(u => (
                          <tr key={u.id} class="hover:bg-surface-50 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-surface-200 to-surface-300 flex items-center justify-center text-surface-600 font-bold text-xs ring-2 ring-white shadow-sm">
                                  {u.fullName.charAt(0) || "U"}
                                </div>
                                <span class="font-bold text-surface-900">{u.fullName}</span>
                              </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="flex flex-col gap-1">
                                <span class="text-xs text-surface-500 font-mono bg-surface-100 px-2 py-0.5 rounded border border-surface-200 w-fit">{u.username}</span>
                                <span class={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full w-fit ${u.role === "ADMIN" ? "bg-primary-100 text-primary-700 border border-primary-200" : u.role === "OPERATOR" ? "bg-info/20 text-info-700 border border-info/30" : "bg-surface-200 text-surface-700 border border-surface-300"}`}>
                                  {u.role}
                                </span>
                              </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center text-surface-600">
                              {u.kelas || <span class="text-surface-400">-</span>}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                              <span class={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${u.active ? "bg-success/10 text-success-700 border border-success/30" : "bg-surface-100 text-surface-500 border border-surface-200"}`}>
                                {u.active ? "Aktif" : "Nonaktif"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
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
