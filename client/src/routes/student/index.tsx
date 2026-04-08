<<<<<<< Updated upstream
import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link, useNavigate } from "@builder.io/qwik-city";
import { examsApi, attemptsApi } from "~/lib/api";
import { getUserData, isAuthenticated, logout } from "~/lib/auth";
import { Clock } from "~/components/ui/clock";

// Tata visual modern untuk dashboard siswa

// ─── Dashboard Siswa ────────────────────────────────────

export default component$(() => {
  const user = useSignal<any>(null);
  const exams = useSignal<any[]>([]);
  const attempts = useSignal<any[]>([]);
  const loading = useSignal(true);
  const nav = useNavigate();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    if (!isAuthenticated()) {
      await nav("/");
      return;
    }
    user.value = getUserData();

    try {
      const [examData, attemptData] = await Promise.all([
        examsApi.list(),
        attemptsApi.my(),
      ]);
      exams.value = examData.exams || [];
      attempts.value = attemptData.attempts || [];
    } catch {
      exams.value = [];
      attempts.value = [];
    } finally {
      loading.value = false;
    }
  });

  const getAttemptForExam = (examId: string) => {
    return attempts.value.find((a: any) => a.examId === examId);
  };

  const availableExams = exams.value.filter(exam => {
    const attempt = getAttemptForExam(exam.id);
    return !attempt || attempt.status === "IN_PROGRESS";
  });

  const historyExams = exams.value.filter(exam => {
    const attempt = getAttemptForExam(exam.id);
    return attempt && (attempt.status === "SUBMITTED" || attempt.status === "TIMED_OUT" || attempt.status === "FORCE_SUBMITTED");
  });

  const averageScore = historyExams.length > 0 
    ? Math.round(historyExams.reduce((acc, exam) => acc + (getAttemptForExam(exam.id)?.score || 0), 0) / historyExams.length)
    : 0;

  if (loading.value) {
    return (
      <div class="min-h-screen bg-slate-50 flex items-center justify-center">
        <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div class="font-['Public_Sans',sans-serif] min-h-screen bg-[#f8fafd] text-slate-900 select-none pb-20 sm:pb-12 overflow-x-hidden">
      {/* ═══ Navigasi Utama ═══ */}
      <nav class="sticky top-0 z-50 px-4 sm:px-6 py-2 sm:py-4">
        <div class="max-w-7xl mx-auto bg-white/70 backdrop-blur-xl border border-white/40 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between shadow-2xl shadow-blue-500/5">
          <div class="flex items-center gap-4">
            <div class="bg-blue-600 size-11 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 rotate-3">
              <span class="material-symbols-outlined text-2xl font-bold">rocket_launch</span>
            </div>
            <div>
              <h2 class="text-slate-900 text-lg font-bold leading-tight tracking-tight">Examinator</h2>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 italic">Dashboard Siswa v3.0</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="hidden md:flex items-center gap-1 bg-slate-100/50 px-4 py-2 rounded-2xl border border-slate-200/50 text-slate-500">
               <span class="material-symbols-outlined text-sm font-bold">schedule</span>
               <span class="text-xs font-bold uppercase tracking-widest"><Clock /></span>
            </div>
            
            <Link href="/student/" class="size-11 rounded-2xl bg-blue-600 border-2 border-blue-500 shadow-xl shadow-blue-600/20 overflow-hidden group transition-transform hover:scale-105 active:scale-95">
              <img
                alt={`Avatar ${user.value?.fullName || "Siswa"}`}
                class="w-full h-full object-cover"
                src={`https://ui-avatars.com/api/?name=${user.value?.fullName || 'User'}&background=3b82f6&color=fff&bold=true`}
                width={44}
                height={44}
              />
            </Link>

            <button 
              onClick$={() => { logout(); nav("/"); }}
              class="size-11 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95"
            >
              <span class="material-symbols-outlined font-bold">logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-8 sm:space-y-12">
        
      {/* ═══ Bagian Header ═══ */}
        <header class="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
           <div class="space-y-2 animate-fade-in-up">
              <h1 class="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tighter mb-2 italic">Selamat Datang, <span class="text-blue-600">{user.value?.fullName?.split(' ')[0] || 'Siswa'}</span></h1>
            <p class="text-slate-500 font-semibold text-base sm:text-lg">Pantau progres dan bersiaplah untuk ujian hari ini.</p>
           </div>
           
           <div class="grid grid-cols-2 sm:flex gap-3 sm:gap-4 animate-fade-in-right">
              <div class="bg-white rounded-2xl sm:rounded-[1.75rem] p-3 sm:p-5 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-3 sm:gap-5 flex-1 sm:min-w-[180px]">
                 <div class="size-10 sm:size-14 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner">
                    <span class="material-symbols-outlined text-xl sm:text-3xl font-bold">verified</span>
                 </div>
                 <div>
                    <p class="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Selesai</p>
                    <p class="text-xl sm:text-3xl font-bold text-slate-900">{historyExams.length}</p>
                 </div>
              </div>
              <div class="bg-white rounded-2xl sm:rounded-[1.75rem] p-3 sm:p-5 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-3 sm:gap-5 flex-1 sm:min-w-[180px]">
                 <div class="size-10 sm:size-14 bg-yellow-400/10 text-yellow-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner">
                    <span class="material-symbols-outlined text-xl sm:text-3xl font-bold">auto_awesome</span>
                 </div>
                 <div>
                    <p class="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Rata-rata</p>
                    <p class="text-xl sm:text-3xl font-bold text-slate-900">{averageScore}<span class="text-xs text-slate-300 ml-0.5">%</span></p>
                 </div>
              </div>
           </div>
        </header>

      {/* ═══ Daftar Ujian Aktif ═══ */}
        <section class="space-y-8">
           <div class="flex items-center justify-between">
              <h3 class="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-3">
                 <span class="material-symbols-outlined text-blue-600 font-bold">assignment</span>
                 Ujian Tersedia
              </h3>
              <div class="h-px flex-1 bg-slate-200 mx-6 hidden sm:block"></div>
              <span class="px-5 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100 uppercase tracking-widest">
                 {availableExams.length} Total
              </span>
           </div>

            {availableExams.length === 0 ? (
              <div class="bg-white/50 border-2 border-dashed border-slate-200 rounded-[2rem] sm:rounded-[3rem] p-10 sm:p-16 text-center animate-pulse">
                <div class="size-16 sm:size-20 bg-slate-100 rounded-2xl sm:rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-4 sm:mb-6">
                  <span class="material-symbols-outlined text-4xl sm:text-5xl">coffee</span>
                </div>
                <h4 class="text-lg sm:text-xl font-bold text-slate-700">Santai sejenak!</h4>
                <p class="text-slate-400 font-medium text-sm">Belum ada jadwal ujian baru hari ini.</p>
              </div>
           ) : (
             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {availableExams.map((exam) => {
                 const attempt = getAttemptForExam(exam.id);
                 const isInProgress = attempt?.status === "IN_PROGRESS";
                 return (
                   <div key={exam.id} class="group relative bg-white rounded-[2rem] sm:rounded-[2.5rem] p-1 border-2 border-transparent hover:border-blue-600/20 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col h-full animate-fade-in">
                      <div class="bg-slate-50 rounded-[1.75rem] sm:rounded-[2.25rem] p-6 sm:p-8 flex-1 flex flex-col group-hover:bg-white transition-colors duration-500">
                        <div class="flex items-center justify-between mb-6 sm:mb-8">
                           <div class={`size-12 sm:size-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg ${isInProgress ? 'bg-amber-500 shadow-amber-500/20 rotate-3' : 'bg-blue-600 shadow-blue-500/20'}`}>
                             <span class="material-symbols-outlined text-3xl font-bold">calculate</span>
                           </div>
                           <div class={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${isInProgress ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                             {isInProgress ? 'Sedang Berjalan' : 'Tersedia'}
                           </div>
                        </div>

                        <h3 class="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">{exam.title}</h3>
                        <p class="text-slate-500 font-medium text-sm line-clamp-2 mb-8">{exam.description || "Mari tunjukkan kemampuan matematikamu di ujian kali ini."}</p>

                        <div class="grid grid-cols-2 gap-4 mt-auto">
                           <div class="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
                              <span class="material-symbols-outlined text-blue-500 font-bold">timer</span>
                              <div>
                                 <p class="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Waktu</p>
                                 <p class="text-sm font-bold text-slate-900">{exam.duration}m</p>
                              </div>
                           </div>
                           <div class="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
                              <span class="material-symbols-outlined text-blue-500 font-bold">quiz</span>
                              <div>
                                 <p class="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Soal</p>
                                 <p class="text-sm font-bold text-slate-900">{exam._count?.questions || 0} No</p>
                              </div>
                           </div>
                        </div>
                      </div>

                      <div class="p-4">
                        <button 
                          onClick$={() => nav(`/student/exam/${exam.id}/`)}
                          class={`w-full h-16 rounded-[1.75rem] font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] border-b-4 ${isInProgress ? 'bg-amber-500 text-white border-amber-700 shadow-lg shadow-amber-500/20 hover:bg-amber-600' : 'bg-blue-600 text-white border-blue-800 shadow-lg shadow-blue-500/20 hover:bg-blue-700'}`}
                        >
                          {isInProgress ? 'Lanjutkan Ujian' : 'Mulai Sekarang'}
                          <span class="material-symbols-outlined font-bold">{isInProgress ? 'resume' : 'arrow_forward'}</span>
                        </button>
                      </div>
                   </div>
                 );
               })}
             </div>
           )}
        </section>

      {/* ═══ Kartu Aksi Bawah ═══ */}
         <section class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 pt-4 sm:pt-8">
            <div class="relative group cursor-pointer overflow-hidden rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-br from-blue-600 to-blue-800 p-8 sm:p-12 text-white shadow-2xl shadow-blue-500/30">
               <div class="absolute -top-12 -right-12 text-white/10 group-hover:rotate-12 transition-transform duration-700">
                  <span class="material-symbols-outlined text-[120px] sm:text-[180px]">science</span>
               </div>
               <div class="relative z-10 space-y-4 sm:space-y-6">
                  <div class="size-12 sm:size-16 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-[1.25rem] flex items-center justify-center shadow-inner">
                     <span class="material-symbols-outlined text-2xl sm:text-3xl font-bold">biotech</span>
                  </div>
                  <div>
                     <h4 class="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Simulasi Sistem</h4>
                     <p class="text-blue-100/80 font-medium text-sm sm:text-base max-w-sm">Kenali antarmuka ujian dan pastikan perangkatmu siap tanpa risiko nilai.</p>
                  </div>
                  <Link href="/student/simulation/" class="inline-flex items-center gap-2 bg-yellow-400 text-slate-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm hover:bg-yellow-500 transition-all border-b-4 border-yellow-600 active:translate-y-1">
                     Uji Coba Sekarang
                     <span class="material-symbols-outlined font-bold text-sm sm:text-base">rocket</span>
                  </Link>
               </div>
            </div>

            <div class="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 border border-slate-100 shadow-xl flex flex-col">
              <div class="flex items-center justify-between mb-8">
                 <h4 class="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <span class="material-symbols-outlined text-blue-600 font-bold">history</span>
                    Riwayat Nilai
                 </h4>
                 <Link href="/student/results/" class="text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline decoration-2 underline-offset-8">Semua</Link>
              </div>
              
              <div class="space-y-4 flex-1">
                 {historyExams.length === 0 ? (
                   <p class="text-slate-400 text-center py-10 font-medium italic">Belum ada data nilai</p>
                 ) : (
                   historyExams.slice(0, 3).map((exam) => {
                     const attempt = getAttemptForExam(exam.id);
                     const isForced = attempt.status === "FORCE_SUBMITTED";
                    const scoreText = typeof attempt.score === "number" ? String(Math.round(attempt.score)) : "--";
                     return (
                       <div key={exam.id} class="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 group hover:bg-white hover:border-blue-100 transition-all">
                          <div class="flex items-center gap-4">
                             <div class="size-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                                <span class="material-symbols-outlined font-bold">menu_book</span>
                             </div>
                             <div>
                                <p class="text-sm font-bold text-slate-800 line-clamp-1">{exam.title}</p>
                                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(attempt.startedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                                {isForced && (
                                 <span class="inline-flex items-center mt-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[9px] font-bold uppercase tracking-wider text-rose-700">Force Submit</span>
                                )}
                             </div>
                          </div>
                          <div class="text-right">
                             <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Skor</p>
                              <p class="text-2xl font-bold text-blue-600">{scoreText}<span class="text-xs text-slate-300 ml-0.5">{scoreText === "--" ? "" : "%"}</span></p>
                          </div>
                       </div>
                     );
                   })
                 )}
              </div>

              <div class="mt-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center justify-between">
                 <div class="flex items-center gap-3">
                    <div class="size-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                       <span class="material-symbols-outlined font-bold">devices</span>
                    </div>
                    <p class="text-xs font-bold text-slate-700">Kesiapan Perangkat</p>
                 </div>
                 <Link href="/student/test-device/" class="px-5 py-2.5 bg-white text-blue-600 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-blue-100 shadow-sm hover:shadow-md active:scale-95 transition-all">Check Now</Link>
              </div>
           </div>
        </section>
      </main>

      {/* ═══ iOS 27 Inspired Floating Bottom Tab (Mobile Only) ═══ */}
      <div class="md:hidden fixed bottom-10 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-sm bg-white/70 backdrop-blur-3xl border border-white/40 rounded-[3rem] px-5 py-4 shadow-[0_30px_90px_rgba(0,0,0,0.15)] flex items-center justify-between z-50 animate-fade-in-up ring-1 ring-black/5">
        <div class="relative flex flex-col items-center gap-1.5 group">
           <div class="size-16 -mt-10 bg-blue-600 text-white rounded-[1.75rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 ring-[6px] ring-white transition-all duration-500 group-active:scale-95 group-hover:-rotate-6">
              <span class="material-symbols-outlined font-bold text-3xl">grid_view</span>
           </div>
           <span class="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Home</span>
        </div>
        <Link href="/student/results/" class="flex flex-col items-center gap-1.5 group">
           <div class="size-11 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all duration-300">
              <span class="material-symbols-outlined font-bold text-2xl">analytics</span>
           </div>
           <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Portfolio</span>
        </Link>
        <Link href="/student/test-device/" class="flex flex-col items-center gap-1.5 group">
           <div class="size-11 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-amber-500 group-hover:bg-amber-50 transition-all duration-300">
              <span class="material-symbols-outlined font-bold text-2xl">on_device_training</span>
           </div>
           <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-amber-500 transition-colors">Device</span>
        </Link>
      </div>

      <footer class="max-w-7xl mx-auto px-6 py-12 text-center">
         <p class="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Examinator CBT Platform • 2026 Edition</p>
      </footer>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Dashboard Siswa — Examinator",
};
=======
import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useNavigate } from "@builder.io/qwik-city";
import { examsApi, attemptsApi } from "~/lib/api";
import { getUserData, isAuthenticated, logout } from "~/lib/auth";
import { Clock } from "~/components/ui/clock";
import { Greeting } from "~/components/ui/greeting";

// ─── Student Dashboard ──────────────────────────────────

export default component$(() => {
  const user = useSignal<any>(null);
  const exams = useSignal<any[]>([]);
  const attempts = useSignal<any[]>([]);
  const loading = useSignal(true);
  const nav = useNavigate();
  const activeTab = useSignal<"available" | "history">("available");
  const searchQuery = useSignal("");

  useVisibleTask$(async () => {
    if (!isAuthenticated()) {
      await nav("/");
      return;
    }
    user.value = getUserData();

    try {
      const [examData, attemptData] = await Promise.all([
        examsApi.list(),
        attemptsApi.my(),
      ]);
      exams.value = examData.exams || [];
      attempts.value = attemptData.attempts || [];
    } catch {
      // handle error silently
    } finally {
      loading.value = false;
    }
  });

  const getAttemptForExam = (examId: string) => {
    return attempts.value.find((a: any) => a.examId === examId);
  };

  const availableExams = exams.value.filter(exam => {
    const attempt = getAttemptForExam(exam.id);
    return !attempt || (attempt.status !== "SUBMITTED" && attempt.status !== "TIMED_OUT");
  });

  const historyExams = exams.value.filter(exam => {
    const attempt = getAttemptForExam(exam.id);
    return attempt && (attempt.status === "SUBMITTED" || attempt.status === "TIMED_OUT");
  });

  const filteredHistory = historyExams.filter(exam => 
    exam.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    exam.subject.toLowerCase().includes(searchQuery.value.toLowerCase())
  );

  return (
    <div class="min-h-screen bg-surface-900 bg-gradient-mesh">
      {/* Header */}
      <header class="glass sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-md shadow-primary-500/20">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="font-bold text-gradient text-lg tracking-tight">Examinator</span>
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
              <div class="flex items-center gap-3 cursor-pointer group" onClick$={() => nav('/profile/')}>
                <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-400 to-secondary-500 flex items-center justify-center text-white ring-2 ring-white shadow-sm transition-transform group-hover:scale-105">
                  <span class="text-sm font-bold">{user.value?.fullName?.charAt(0) || "U"}</span>
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

      {/* Content */}
      <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Section */}
        <div class="mb-10 animate-fade-in flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl p-6 shadow-sm border border-surface-200">
          <div class="text-center sm:text-left">
            <h1 class="text-2xl font-bold text-surface-800 mb-1">
              <Greeting name={user.value?.fullName} />
            </h1>
            <p class="text-surface-500">
              {user.value?.kelas && <span class="text-primary-600 font-medium bg-primary-50 px-2 py-0.5 rounded-md text-xs mr-2">{user.value.kelas}</span>}
              Lihat dan mulai ujian yang tersedia
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div class="flex items-center gap-2 mb-8 border-b border-surface-200">
          <button
            onClick$={() => activeTab.value = "available"}
            class={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab.value === "available"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300"
            }`}
          >
            Ujian Tersedia ({availableExams.length})
          </button>
          <button
            onClick$={() => activeTab.value = "history"}
            class={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab.value === "history"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300"
            }`}
          >
            Riwayat Ujian ({historyExams.length})
          </button>
        </div>

        {/* Loading */}
        {loading.value && (
          <div class="flex items-center justify-center py-20">
            <div class="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Available Exams */}
        {!loading.value && activeTab.value === "available" && (
          <>
            {availableExams.length === 0 ? (
              <div class="text-center py-20 bg-white rounded-2xl border border-surface-200 shadow-sm">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-100 flex items-center justify-center text-3xl">
                  📝
                </div>
                <h3 class="text-lg font-bold text-surface-800 mb-1">Tidak ada ujian</h3>
                <p class="text-surface-500 text-sm">Belum ada ujian yang tersedia untuk Anda saat ini.</p>
              </div>
            ) : (
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableExams.map((exam: any, idx: number) => {
                  const attempt = getAttemptForExam(exam.id);
                  const isInProgress = attempt?.status === "IN_PROGRESS";

                  return (
                    <div
                      key={exam.id}
                      class="bg-white rounded-2xl p-6 shadow-sm border border-surface-200 hover:shadow-md hover:border-primary-300 transition-all duration-300 animate-fade-in flex flex-col"
                      style={`animation-delay: ${idx * 50}ms`}
                    >
                      <div class="flex items-center justify-between mb-4">
                        <span class="text-xs font-bold tracking-wider px-3 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100 uppercase">
                          {exam.subject}
                        </span>
                        {isInProgress && (
                          <span class="text-xs font-bold px-3 py-1 rounded-full bg-warning/10 text-warning-700 border border-warning/20 flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-warning-500 animate-pulse"></span>
                            Sedang Berjalan
                          </span>
                        )}
                      </div>

                      <h3 class="text-xl font-bold text-surface-900 mb-2 line-clamp-2">{exam.title}</h3>
                      {exam.description && <p class="text-sm text-surface-500 mb-6 line-clamp-2 flex-grow">{exam.description}</p>}

                      <div class="flex items-center justify-between text-sm text-surface-600 bg-surface-50 p-3 rounded-xl border border-surface-100 mb-6">
                        <div class="flex flex-col">
                          <span class="text-xs text-surface-400 mb-0.5">Durasi</span>
                          <span class="font-semibold">{exam.duration} mnt</span>
                        </div>
                        <div class="w-px h-8 bg-surface-200"></div>
                        <div class="flex flex-col">
                          <span class="text-xs text-surface-400 mb-0.5">Soal</span>
                          <span class="font-semibold">{exam._count?.questions || 0}</span>
                        </div>
                        <div class="w-px h-8 bg-surface-200"></div>
                        <div class="flex flex-col">
                          <span class="text-xs text-surface-400 mb-0.5">KKM</span>
                          <span class="font-semibold text-primary-600">{exam.passingScore}</span>
                        </div>
                      </div>

                      <button
                        onClick$={async () => await nav(`/student/exam/${exam.id}/`)}
                        class={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm ${
                          isInProgress
                            ? 'bg-warning-50 text-warning-700 border border-warning-300 hover:bg-warning-100'
                            : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.98]'
                        }`}
                      >
                        {isInProgress ? "Lanjutkan Mengerjakan" : "Mulai Mengerjakan"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* History / Datatable */}
        {!loading.value && activeTab.value === "history" && (
          <div class="animate-fade-in bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
            <div class="p-6 border-b border-surface-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 class="text-lg font-bold text-surface-800">Riwayat Ujian</h2>
              <div class="relative w-full sm:w-64">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-4 w-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Cari ujian..."
                  class="block w-full pl-10 pr-3 py-2 border border-surface-300 rounded-lg leading-5 bg-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
                  value={searchQuery.value}
                  onInput$={(e) => searchQuery.value = (e.target as HTMLInputElement).value}
                />
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-surface-200">
                <thead class="bg-surface-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Mata Pelajaran</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Judul Ujian</th>
                    <th scope="col" class="px-6 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider">KKM</th>
                    <th scope="col" class="px-6 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider">Nilai</th>
                    <th scope="col" class="px-6 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-surface-200 text-sm">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} class="px-6 py-8 text-center text-surface-500">
                        {searchQuery.value ? "Tidak ada riwayat ujian yang cocok dengan pencarian." : "Belum ada riwayat ujian yang diselesaikan."}
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((exam) => {
                      const attempt = getAttemptForExam(exam.id);
                      const isPassed = attempt?.score !== null && attempt?.score >= exam.passingScore;
                      
                      return (
                        <tr key={exam.id} class="hover:bg-surface-50 transition-colors">
                          <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {exam.subject}
                            </span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap font-medium text-surface-900">
                            {exam.title}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-center text-surface-500">
                            {exam.passingScore}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-center">
                            <span class={`font-bold ${isPassed ? 'text-success' : 'text-danger'}`}>
                              {attempt?.score !== null ? Math.round(attempt.score) : '-'}
                            </span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-center">
                            {isPassed ? (
                              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                                Lulus
                              </span>
                            ) : (
                              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                Remidi
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination Placeholder (Mock for UI purpose, full integration depends on backend paginating or client side slicing) */}
            {filteredHistory.length > 0 && (
              <div class="px-6 py-3 border-t border-surface-200 flex items-center justify-between bg-surface-50">
                <span class="text-sm text-surface-500">Menampilkan <span class="font-medium text-surface-900">{filteredHistory.length}</span> riwayat</span>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Dashboard Siswa — Examinator",
};
>>>>>>> Stashed changes
