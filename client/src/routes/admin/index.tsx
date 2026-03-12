import { component$, useSignal, useVisibleTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useNavigate } from "@builder.io/qwik-city";
import { examsApi, usersApi, cheatLogsApi } from "~/lib/api";
import { getUserData, isAuthenticated, logout } from "~/lib/auth";
import { exportToCSV } from "~/lib/export";
import { Clock } from "~/components/ui/clock";
import { Greeting } from "~/components/ui/greeting";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import { initTheme } from "~/lib/theme";

export default component$(() => {
  const nav = useNavigate();
  const user = useSignal<any>(null);
  const exams = useSignal<any[]>([]);
  const users = useSignal<any[]>([]);
  const stats = useSignal<any>(null);
  const loading = useSignal(true);
  const activeTab = useSignal<"overview" | "exams" | "users">("overview");
  const searchQuery = useSignal("");

  const showCreateExam = useSignal(false);
  const newExam = useSignal({ title: "", subject: "", duration: 60, description: "", passingScore: 70 });

  useVisibleTask$(async () => {
    initTheme();
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
      ID: u.id, "Nama Lengkap": u.fullName, Username: u.username,
      Role: u.role, "Kelas/Jurusan": u.kelas || "-", "Status Aktif": u.active ? "Aktif" : "Nonaktif"
    }));
    exportToCSV("examinator_users.csv", exportData);
  });

  const handleExportExams = $(() => {
    if (!exams.value.length) return;
    const exportData = exams.value.map(e => ({
      ID: e.id, "Judul Ujian": e.title, "Mata Pelajaran": e.subject,
      "Durasi (Menit)": e.duration, "Jumlah Soal": e._count?.questions || 0,
      "Nilai KKM": e.passingScore, "Status": e.active ? "Aktif" : "Nonaktif",
      "Dibuat Pada": new Date(e.createdAt).toLocaleString("id-ID")
    }));
    exportToCSV("examinator_exams.csv", exportData);
  });

  const filteredExams = () => exams.value.filter(e =>
    e.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    e.subject.toLowerCase().includes(searchQuery.value.toLowerCase())
  );

  const filteredUsers = () => users.value.filter(u =>
    u.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.value.toLowerCase())
  );

  return (
    <div class="min-h-screen bg-[#fdfdfd] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-x-hidden selection:bg-blue-500/20 selection:text-blue-700 transition-colors duration-300">

      {/* ── BACKGROUND BLOBS — identical to landing page ── */}
      <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden dark:opacity-40">
        <div class="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full opacity-20 mix-blend-multiply filter blur-[100px] bg-[radial-gradient(circle,rgba(59,130,246,0.25)_0%,transparent_70%)]" />
        <div class="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-15 mix-blend-multiply filter blur-[120px] bg-[radial-gradient(circle,rgba(99,102,241,0.2)_0%,transparent_70%)]" />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HEADER — matches landing page nav exactly
      ══════════════════════════════════════════════════════════════ */}
      <header class="sticky top-0 z-50 w-full bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div class="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-3.5 flex items-center justify-between gap-4">

          {/* Logo — same as landing */}
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span class="text-white font-[900] text-lg leading-none">E</span>
            </div>
            <span class="text-xl font-[900] tracking-tight text-slate-900 dark:text-white">Examinator</span>
            <span class="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest">
              Admin
            </span>
          </div>

          {/* Right side actions */}
          <div class="flex items-center gap-3">
            <div class="hidden md:block">
              <Clock />
            </div>

            <button
              onClick$={() => nav("/proctor/")}
              class="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/50 transition-all"
            >
              Tampilan Pengawas
              <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>

            {/* User pill */}
            <button
              class="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-all shadow-sm group"
              onClick$={() => nav("/profile/")}
            >
              <div class="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-[800] text-sm shadow-sm">
                {user.value?.fullName?.charAt(0) || "A"}
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

      {/* ══════════════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════════════ */}
      <main class="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-8 pb-20">

        {/* ── TABS ── */}
        <div class="flex gap-1 mb-8 p-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/80 rounded-2xl w-fit shadow-sm">
          {(["overview", "exams", "users"] as const).map(tab => (
            <button
              key={tab}
              onClick$={() => { activeTab.value = tab; searchQuery.value = ""; }}
              class={`px-5 py-2 rounded-xl text-sm font-[700] transition-all ${
                activeTab.value === tab
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-600"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {tab === "overview" ? "Ringkasan" : tab === "exams" ? "Ujian" : "Pengguna"}
            </button>
          ))}
        </div>

        {/* ── LOADING ── */}
        {loading.value ? (
          <div class="flex flex-col items-center justify-center py-24 gap-4">
            <div class="w-10 h-10 rounded-full border-[3px] border-slate-100 border-t-blue-600 animate-spin" />
            <p class="text-slate-400 text-sm font-semibold">Memuat data...</p>
          </div>
        ) : (
          <>
            {/* ══════ OVERVIEW ══════ */}
            {activeTab.value === "overview" && (
              <div>
                {/* Welcome hero card */}
                <div class="relative overflow-hidden mb-6 rounded-3xl shadow-[0_8px_32px_-8px_rgba(37,99,235,0.3)] bg-[linear-gradient(135deg,#1d4ed8_0%,#4f46e5_55%,#7c3aed_100%)]">
                  {/* Decorative orbs */}
                  <div class="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20 pointer-events-none bg-[radial-gradient(circle,rgba(255,255,255,0.5)_0%,transparent_70%)]" />
                  <div class="absolute -bottom-20 -left-8 w-52 h-52 rounded-full opacity-15 pointer-events-none bg-[radial-gradient(circle,rgba(255,255,255,0.3)_0%,transparent_70%)]" />
                  {/* Grid texture */}
                  <div class="absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[length:32px_32px]" />

                  <div class="relative z-10 p-7 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    {/* Left: greeting text */}
                    <div>
                      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/25 mb-4 bg-white/10">
                        <span class="relative flex h-1.5 w-1.5">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                        </span>
                        <span class="text-[10px] font-bold text-white tracking-widest uppercase">Dashboard Aktif</span>
                      </div>
                      <h1 class="text-2xl sm:text-3xl font-[900] tracking-tight text-white mb-2">
                        <Greeting name={user.value?.fullName} />
                      </h1>
                      <p class="font-medium text-sm sm:text-base text-blue-100/90">
                        Ringkasan statistik sistem Examinator hari ini.
                      </p>
                    </div>

                    {/* Right: mini stat pills
                    <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      {[
                        { label: "Ujian", value: exams.value.length, icon: "description" },
                        { label: "Aktif", value: exams.value.filter((e: any) => e.active).length, icon: "check_circle" },
                        { label: "User", value: users.value.length, icon: "group" },
                      ].map((q: any) => (
                        <div key={q.label}
                          class="flex flex-col items-center px-4 py-3 rounded-2xl border border-white/20 min-w-[68px] text-center"
                          style="background: rgba(255,255,255,0.12)">
                          <span class="material-symbols-outlined text-[18px] mb-1" style="color: rgba(255,255,255,0.65)">{q.icon}</span>
                          <span class="text-[1.6rem] font-[900] text-white leading-none">{q.value}</span>
                          <span class="text-[9px] font-bold uppercase tracking-wider mt-1" style="color: rgba(191,219,254,0.85)">{q.label}</span>
                        </div>
                      ))}
                    </div> */}
                  </div>
                </div>

                {/* Stat cards */}
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Total Ujian",       value: exams.value.length,                        icon: "description",   from: "from-blue-500",    to: "to-indigo-600",   bg: "bg-blue-50",    border: "border-blue-100",   text: "text-blue-600"    },
                    { label: "Ujian Aktif",        value: exams.value.filter(e => e.active).length,  icon: "check_circle",  from: "from-emerald-500", to: "to-teal-600",     bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600" },
                    { label: "Total User",         value: users.value.length,                        icon: "group",         from: "from-violet-500",  to: "to-purple-600",   bg: "bg-violet-50",  border: "border-violet-100",  text: "text-violet-600"  },
                    { label: "Total Pelanggaran",  value: stats.value?.totalLogs || 0,               icon: "warning",       from: "from-rose-500",    to: "to-red-600",      bg: "bg-rose-50",    border: "border-rose-100",   text: "text-rose-600"    },
                  ].map(s => (
                    <div key={s.label} class={`bg-white dark:bg-slate-800/80 rounded-2xl border ${s.border} dark:border-slate-700/50 p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300`}>
                      <div class={`w-11 h-11 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center mb-4`}>
                        <span class={`material-symbols-outlined text-xl ${s.text}`}>{s.icon}</span>
                      </div>
                      <div class="text-3xl font-[900] tracking-tight text-slate-900 dark:text-white mb-0.5">{s.value}</div>
                      <div class={`text-[10px] font-bold ${s.text} uppercase tracking-widest`}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Violations breakdown */}
                {stats.value?.byType?.length > 0 && (
                  <div class="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] p-6">
                    <div class="flex items-center gap-3 mb-5">
                      <div class="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center">
                        <span class="material-symbols-outlined text-base text-rose-500">policy</span>
                      </div>
                      <h3 class="font-[800] tracking-tight text-slate-900 dark:text-white">Pelanggaran per Tipe</h3>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {stats.value.byType.map((t: any) => (
                        <div key={t.type} class="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50 flex items-center justify-between hover:border-rose-200 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 transition-all">
                          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.type.replace("_", " ")}</span>
                          <span class="text-xl font-[900] text-rose-500">{t.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════ EXAMS ══════ */}
            {activeTab.value === "exams" && (
              <div class="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.07)] overflow-hidden">
                <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 class="text-lg font-[900] tracking-tight text-slate-900 dark:text-white">Kelola Ujian</h2>
                    <p class="text-xs text-slate-400 font-medium mt-0.5">{exams.value.length} ujian terdaftar</p>
                  </div>
                  <div class="flex flex-wrap items-center gap-2">
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </span>
                      <input type="text" placeholder="Cari ujian..."
                        class="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all w-52"
                        value={searchQuery.value}
                        onInput$={(e) => searchQuery.value = (e.target as HTMLInputElement).value}
                      />
                    </div>
                    <button onClick$={handleExportExams}
                      class="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-all">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Ekspor
                    </button>
                    <button onClick$={() => { showCreateExam.value = !showCreateExam.value; }}
                      class="group flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-[700] hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5 active:scale-[0.98]">
                      <span class="material-symbols-outlined text-[16px]">add</span>
                      Buat Ujian
                    </button>
                  </div>
                </div>

                {/* Inline create form */}
                {showCreateExam.value && (
                  <div class="px-6 py-5 bg-blue-50/40 dark:bg-blue-950/20 border-b border-blue-100/60 dark:border-blue-900/30">
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: "Judul Ujian", key: "title", type: "text" },
                        { label: "Mata Pelajaran", key: "subject", type: "text" },
                        { label: "Durasi (menit)", key: "duration", type: "number" },
                        { label: "KKM", key: "passingScore", type: "number" },
                      ].map(f => (
                        <div key={f.key}>
                          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{f.label}</label>
                          <input type={f.type}
                            class="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all"
                            placeholder={f.label}
                            title={f.label}
                            value={(newExam.value as any)[f.key]}
                            onInput$={(e) => {
                              const val = (e.target as HTMLInputElement).value;
                              newExam.value = { ...newExam.value, [f.key]: f.type === "number" ? parseInt(val) : val };
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div class="mt-4 flex justify-end gap-2">
                      <button onClick$={() => { showCreateExam.value = false; }}
                        class="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        Batal
                      </button>
                      <button onClick$={createExam}
                        class="px-6 py-2 rounded-xl bg-blue-600 text-white text-sm font-[700] hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20">
                        Simpan Ujian
                      </button>
                    </div>
                  </div>
                )}

                {/* Exams table */}
                <div class="overflow-x-auto">
                  <table class="min-w-full">
                    <thead>
                      <tr class="border-b border-slate-100 dark:border-slate-700/50">
                        <th class="px-6 py-3.5 text-left text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Info Ujian</th>
                        <th class="px-6 py-3.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Durasi</th>
                        <th class="px-6 py-3.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Soal & KKM</th>
                        <th class="px-6 py-3.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                        <th class="px-6 py-3.5 w-14" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExams().length === 0 ? (
                        <tr><td colSpan={5} class="px-6 py-16 text-center">
                          <span class="material-symbols-outlined text-5xl text-slate-200 block mb-3">description</span>
                          <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">{searchQuery.value ? "Tidak ada ujian yang sesuai pencarian." : "Belum ada ujian. Silakan buat baru."}</p>
                        </td></tr>
                      ) : filteredExams().map(exam => (
                        <tr key={exam.id} class="border-b border-slate-50 dark:border-slate-700/30 hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors group">
                          <td class="px-6 py-4">
                            <p class="font-[700] text-slate-900 dark:text-white text-sm mb-1">{exam.title}</p>
                            <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{exam.subject}</span>
                          </td>
                          <td class="px-6 py-4 text-center">
                            <span class="text-sm font-[700] text-slate-700 dark:text-slate-200">{exam.duration}</span>
                            <span class="text-xs text-slate-400 ml-1">mnt</span>
                          </td>
                          <td class="px-6 py-4 text-center">
                            <div class="flex flex-col items-center gap-1">
                              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-semibold text-slate-600 dark:text-slate-300">{exam._count?.questions || 0} Soal</span>
                              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-600">KKM {exam.passingScore}</span>
                            </div>
                          </td>
                          <td class="px-6 py-4 text-center">
                            <button onClick$={() => toggleExam(exam.id, exam.active)}
                              class={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-[700] transition-all border ${
                                exam.active
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200"
                              }`}>
                              <span class={`w-1.5 h-1.5 rounded-full ${exam.active ? "bg-emerald-500" : "bg-slate-300"}`} />
                              {exam.active ? "Aktif" : "Nonaktif"}
                            </button>
                          </td>
                          <td class="px-6 py-4 text-center">
                            <button onClick$={() => deleteExam(exam.id)}
                              class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 mx-auto"
                              title="Hapus Ujian">
                              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ══════ USERS ══════ */}
            {activeTab.value === "users" && (
              <div class="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.07)] overflow-hidden">
                <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 class="text-lg font-[900] tracking-tight text-slate-900 dark:text-white">Kelola Pengguna</h2>
                    <p class="text-xs text-slate-400 font-medium mt-0.5">{users.value.length} pengguna terdaftar</p>
                  </div>
                  <div class="flex flex-wrap items-center gap-2">
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </span>
                      <input type="text" placeholder="Cari pengguna..."
                        class="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all w-52"
                        value={searchQuery.value}
                        onInput$={(e) => searchQuery.value = (e.target as HTMLInputElement).value}
                      />
                    </div>
                    <button onClick$={handleExportUsers}
                      class="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-all">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Ekspor CSV
                    </button>
                  </div>
                </div>

                <div class="overflow-x-auto">
                  <table class="min-w-full">
                    <thead>
                      <tr class="border-b border-slate-100 dark:border-slate-700/50">
                        <th class="px-6 py-3.5 text-left text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nama Lengkap</th>
                        <th class="px-6 py-3.5 text-left text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Info Akun</th>
                        <th class="px-6 py-3.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kelas</th>
                        <th class="px-6 py-3.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers().length === 0 ? (
                        <tr><td colSpan={4} class="px-6 py-16 text-center">
                          <span class="material-symbols-outlined text-5xl text-slate-200 block mb-3">group</span>
                          <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">{searchQuery.value ? "Tidak ada pengguna yang sesuai." : "Belum ada data pengguna."}</p>
                        </td></tr>
                      ) : filteredUsers().map(u => (
                        <tr key={u.id} class="border-b border-slate-50 dark:border-slate-700/30 hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                          <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-[800] text-xs shadow-sm flex-shrink-0">
                                {u.fullName.charAt(0) || "U"}
                              </div>
                              <span class="font-[700] text-slate-900 dark:text-white text-sm">{u.fullName}</span>
                            </div>
                          </td>
                          <td class="px-6 py-4">
                            <div class="flex flex-col gap-1.5">
                              <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 w-fit">{u.username}</span>
                              <span class={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit border ${
                                u.role === "ADMIN"    ? "bg-blue-50 text-blue-600 border-blue-100" :
                                u.role === "OPERATOR" ? "bg-violet-50 text-violet-600 border-violet-100" :
                                                        "bg-slate-100 text-slate-500 border-slate-200"
                              }`}>{u.role}</span>
                            </div>
                          </td>
                          <td class="px-6 py-4 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {u.kelas || <span class="text-slate-300">—</span>}
                          </td>
                          <td class="px-6 py-4 text-center">
                            <span class={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-[700] border ${
                              u.active
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : "bg-slate-100 text-slate-400 border-slate-200"
                            }`}>
                              <span class={`w-1.5 h-1.5 rounded-full ${u.active ? "bg-emerald-500" : "bg-slate-300"}`} />
                              {u.active ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>
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
