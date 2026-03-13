import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link, useLocation, useNavigate } from "@builder.io/qwik-city";
import { examsApi, attemptsApi } from "~/lib/api";
import { getUserData, isAuthenticated, logout } from "~/lib/auth";
import { Clock } from "~/components/ui/clock";
import { StatusBanner } from "~/components/ui/status-banner";
import { getAttemptStatusMeta, type AttemptStatus } from "~/lib/attempt-status";

// Tata visual modern untuk dashboard siswa

// ─── Dashboard Siswa ────────────────────────────────────

export default component$(() => {
  const DEVICE_READINESS_MAX_AGE_MS = 24 * 60 * 60 * 1000;
  const loc = useLocation();
  const user = useSignal<any>(null);
  const exams = useSignal<any[]>([]);
  const attempts = useSignal<any[]>([]);
  const flash = useSignal<{ type: "success" | "info"; message: string } | null>(null);
  const deviceReadiness = useSignal<{
    isReady: boolean;
    score: number;
    checksPassed: number;
    totalChecks: number;
    networkOk: boolean;
    latency: number | null;
    updatedAt: string;
  } | null>(null);
  const readinessStale = useSignal(false);
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

      const flashResult = loc.url.searchParams.get("flashResult");
      if (flashResult === "submitted") {
        const score = loc.url.searchParams.get("score") || "-";
        const passed = loc.url.searchParams.get("passed") === "1";
        flash.value = {
          type: "success",
          message: `Ujian berhasil dikumpulkan. Nilai ${score} (${passed ? "Lulus" : "Belum Lulus"}).`,
        };
      }

      if (flashResult === "force") {
        flash.value = {
          type: "info",
          message: "Sesi ujian dihentikan otomatis oleh sistem keamanan.",
        };
      }

      if (flash.value) {
        setTimeout(() => {
          flash.value = null;
        }, 3800);
      }

      try {
        const storedReadiness = localStorage.getItem("examinator_device_readiness");
        if (storedReadiness) {
          const parsed = JSON.parse(storedReadiness);
          deviceReadiness.value = parsed;

          const updatedAtTs = new Date(parsed?.updatedAt || "").getTime();
          readinessStale.value = !Number.isFinite(updatedAtTs) || (Date.now() - updatedAtTs > DEVICE_READINESS_MAX_AGE_MS);
        }
      } catch {
        deviceReadiness.value = null;
        readinessStale.value = false;
      }
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

  const getExamStatus = (examId: string) => {
    const attempt = getAttemptForExam(examId);
    if (!attempt) return "NOT_STARTED";
    return attempt.status;
  };

  const getStatusPriority = (status: string) => {
    if (status === "IN_PROGRESS") return 0;
    if (status === "NOT_STARTED") return 1;
    if (status === "SUBMITTED") return 2;
    if (status === "TIMED_OUT") return 3;
    if (status === "FORCE_SUBMITTED") return 4;
    return 5;
  };

  const examStatusList = exams.value
    .map((exam) => {
      const attempt = getAttemptForExam(exam.id);
      const status = getExamStatus(exam.id);
      return { exam, attempt, status, statusMeta: getAttemptStatusMeta(status as AttemptStatus) };
    })
    .sort((a, b) => getStatusPriority(a.status) - getStatusPriority(b.status));

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
        {flash.value && (
          <StatusBanner type={flash.value.type} message={flash.value.message} />
        )}
        {deviceReadiness.value && readinessStale.value && (
          <StatusBanner
            type="info"
            message="Status perangkat terakhir sudah lebih dari 24 jam. Jalankan diagnostik ulang sebelum mulai ujian."
          />
        )}
        
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
        <section class="space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-3">
              <span class="material-symbols-outlined text-blue-600 font-bold">rule</span>
              Status Ujian Saya
            </h3>
            <div class="h-px flex-1 bg-slate-200 mx-6 hidden sm:block"></div>
            <span class="px-5 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200 uppercase tracking-widest">
              Alur Sistematis
            </span>
          </div>

          {examStatusList.length === 0 ? (
            <div class="bg-white border border-slate-100 rounded-[2rem] p-8 text-center text-slate-400 font-medium">
              Belum ada ujian yang terdaftar.
            </div>
          ) : (
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {examStatusList.map(({ exam, attempt, status, statusMeta }) => (
                <div key={exam.id} class="bg-white rounded-[2rem] border border-slate-100 p-5 sm:p-6 shadow-lg shadow-slate-200/40 flex items-center justify-between gap-4">
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{exam.subject || "Ujian"}</p>
                    <h4 class="text-lg font-bold text-slate-900 truncate">{exam.title}</h4>
                    <div class={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusMeta.badgeClass}`}>
                      <span class="material-symbols-outlined text-sm">{statusMeta.icon}</span>
                      {statusMeta.label}
                    </div>
                    {attempt?.submittedAt && (
                      <p class="mt-2 text-[11px] text-slate-500 font-semibold">
                        Selesai: {new Date(attempt.submittedAt).toLocaleString("id-ID")}
                      </p>
                    )}
                  </div>

                  <div class="shrink-0 flex flex-col gap-2 w-[150px]">
                    {status === "IN_PROGRESS" || status === "NOT_STARTED" ? (
                      <button
                        onClick$={() => nav(status === "IN_PROGRESS" ? `/student/exam/${exam.id}/resume/` : `/student/exam/${exam.id}/`)}
                        class={`h-11 rounded-xl font-bold text-sm border-b-4 transition-all active:scale-95 ${status === "IN_PROGRESS" ? "bg-amber-500 text-white border-amber-700 hover:bg-amber-600" : "bg-blue-600 text-white border-blue-800 hover:bg-blue-700"}`}
                      >
                        {status === "IN_PROGRESS" ? "Lanjutkan" : "Mulai"}
                      </button>
                    ) : (
                      <button
                        onClick$={() => nav("/student/results/")}
                        class="h-11 rounded-xl font-bold text-sm border-b-4 transition-all active:scale-95 bg-emerald-600 text-white border-emerald-800 hover:bg-emerald-700"
                      >
                        Lihat Hasil
                      </button>
                    )}
                    <button
                      onClick$={() => nav("/student/test-device/?reason=preflight")}
                      class="h-10 rounded-xl font-bold text-[11px] uppercase tracking-wider border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 transition-all active:scale-95"
                    >
                      Cek Perangkat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

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
                          onClick$={() => nav(isInProgress ? `/student/exam/${exam.id}/resume/` : `/student/exam/${exam.id}/`)}
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
                    <div>
                      <p class="text-xs font-bold text-slate-700">Kesiapan Perangkat</p>
                      <p class="text-[10px] font-semibold text-slate-500 mt-0.5">
                        {deviceReadiness.value
                          ? `${readinessStale.value ? "Data Lama" : (deviceReadiness.value.isReady ? "Siap" : "Belum Siap")} • ${deviceReadiness.value.checksPassed}/${deviceReadiness.value.totalChecks} • Skor ${deviceReadiness.value.score}%`
                          : "Belum ada hasil diagnostik tersimpan"}
                      </p>
                      {deviceReadiness.value?.updatedAt && (
                        <p class="text-[10px] font-semibold text-slate-400 mt-0.5">
                          Update: {new Date(deviceReadiness.value.updatedAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                 </div>
                 <Link
                   href={`/student/test-device/?reason=${deviceReadiness.value && deviceReadiness.value.networkOk === false ? "network" : "preflight"}`}
                   class="px-5 py-2.5 bg-white text-blue-600 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-blue-100 shadow-sm hover:shadow-md active:scale-95 transition-all"
                 >
                   {readinessStale.value ? "Refresh Check" : "Check Now"}
                 </Link>
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
          <Link href="/student/test-device/?reason=preflight" class="flex flex-col items-center gap-1.5 group">
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
