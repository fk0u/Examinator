import { component$, useComputed$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link, useLocation, useNavigate } from "@builder.io/qwik-city";
import { examsApi, attemptsApi } from "~/lib/api";
import { getUserData, isAuthenticated } from "~/lib/auth";
import { StatusBanner } from "~/components/ui/status-banner";
import { getAttemptStatusMeta, type AttemptStatus } from "~/lib/attempt-status";

// ─── Hasil & Riwayat Siswa ─────────────────────────────

export default component$(() => {
   const loc = useLocation();
  const user = useSignal<any>(null);
  const exams = useSignal<any[]>([]);
  const attempts = useSignal<any[]>([]);
   const flash = useSignal<{ type: "success" | "info"; message: string } | null>(null);
   const statusFilter = useSignal<"ALL" | "SUBMITTED" | "TIMED_OUT" | "FORCE_SUBMITTED">("ALL");
   const periodFilter = useSignal<"ALL" | "7" | "30" | "90">("ALL");
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

         const qsStatus = loc.url.searchParams.get("status");
         const qsPeriod = loc.url.searchParams.get("period");
         if (qsStatus === "SUBMITTED" || qsStatus === "TIMED_OUT" || qsStatus === "FORCE_SUBMITTED" || qsStatus === "ALL") {
            statusFilter.value = qsStatus;
         }
         if (qsPeriod === "7" || qsPeriod === "30" || qsPeriod === "90" || qsPeriod === "ALL") {
            periodFilter.value = qsPeriod;
         }

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
    } catch (err) {
      console.error(err);
      // Optional: handle error state
    } finally {
      loading.value = false;
    }
  });

   // eslint-disable-next-line qwik/no-use-visible-task
   useVisibleTask$(({ track }) => {
      track(() => statusFilter.value);
      track(() => periodFilter.value);

      const params = new URLSearchParams(window.location.search);
      params.set("status", statusFilter.value);
      params.set("period", periodFilter.value);
      const next = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(window.history.state, "", next);
   });

  const getExamForAttempt = (examId: string) => {
    return exams.value.find((e: any) => e.id === examId) || {};
  };

  const historyAttempts = attempts.value.filter(
      (a) => a.status === "SUBMITTED" || a.status === "TIMED_OUT" || a.status === "FORCE_SUBMITTED"
  ).sort((a, b) => new Date(b.endedAt || b.createdAt).getTime() - new Date(a.endedAt || a.createdAt).getTime());

   const filteredHistoryAttempts = useComputed$(() => {
      const now = Date.now();
      let filtered = [...historyAttempts];

      if (statusFilter.value !== "ALL") {
         filtered = filtered.filter((a) => a.status === statusFilter.value);
      }

      if (periodFilter.value !== "ALL") {
         const days = Number(periodFilter.value);
         const minDate = now - days * 24 * 60 * 60 * 1000;
         filtered = filtered.filter((a) => {
            const ts = new Date(a.endedAt || a.startedAt || a.createdAt).getTime();
            return Number.isFinite(ts) && ts >= minDate;
         });
      }

      return filtered;
   });

   const scoredAttempts = historyAttempts.filter((a) => typeof a.score === "number");

   const averageScore = scoredAttempts.length > 0
    ? Math.round(
            scoredAttempts.reduce((acc, attempt) => acc + (attempt.score as number), 0) /
               scoredAttempts.length
      )
    : 0;

  const passedExamsCount = historyAttempts.filter((a) => {
    const exam = getExamForAttempt(a.examId);
      return typeof a.score === "number" && typeof exam.passingScore === "number" && a.score >= exam.passingScore;
  }).length;

   const latestAttempt = filteredHistoryAttempts.value[0];
   const latestExam = latestAttempt ? getExamForAttempt(latestAttempt.examId) : null;
   const latestStatusMeta = latestAttempt ? getAttemptStatusMeta((latestAttempt.status || "SUBMITTED") as AttemptStatus) : null;
   const latestIsPassed = Boolean(
      latestAttempt
      && typeof latestAttempt.score === "number"
      && typeof latestExam?.passingScore === "number"
      && latestAttempt.score >= latestExam.passingScore
   );


  if (loading.value) {
    return (
      <div class="min-h-screen bg-[#f8fafd] flex flex-col items-center justify-center font-['Public_Sans',sans-serif]">
        <div class="relative">
          <div class="size-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <div class="absolute inset-0 flex items-center justify-center">
             <span class="material-symbols-outlined text-blue-600 animate-pulse">rocket_launch</span>
          </div>
        </div>
        <p class="mt-6 text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Sinkronisasi Data...</p>
      </div>
    );
  }

  return (
    <div class="font-['Public_Sans',sans-serif] min-h-screen bg-[#f8fafd] text-slate-900 pb-32">
      {/* ═══ Navigasi Atas ═══ */}
      <header class="sticky top-0 z-50 px-4 sm:px-6 py-3 sm:py-4 bg-white/70 backdrop-blur-xl border-b border-white/40 mb-6 sm:mb-8">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-5">
            <div class="size-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 rotate-3">
              <span class="material-symbols-outlined text-2xl font-bold">rocket_launch</span>
            </div>
            <div>
              <h1 class="text-xl font-bold text-slate-900 leading-tight">Examinator</h1>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 italic">Portofolio Analitik Siswa</p>
            </div>
          </div>

          <div class="hidden md:flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner">
             <Link href="/student/" class="px-5 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all">Beranda</Link>
             <button class="px-5 py-2 text-xs font-bold uppercase tracking-widest bg-white text-blue-600 rounded-xl shadow-sm border border-slate-100">Hasil & Riwayat</button>
          </div>

          <div class="flex items-center gap-4">
            <div class="hidden lg:flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm text-slate-600">
               <span class="material-symbols-outlined text-lg">calendar_today</span>
               <span class="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">
                  {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
               </span>
            </div>
            <Link href="/student/" class="size-11 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center transition-all hover:bg-slate-200 active:scale-95">
               <span class="material-symbols-outlined font-bold text-xl">close</span>
            </Link>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-6 space-y-12">
            {flash.value && <StatusBanner type={flash.value.type} message={flash.value.message} />}
        <header class="animate-fade-in-up">
            <h1 class="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tighter mb-2 italic">Hasil & <span class="text-blue-600">Progres</span></h1>
              <p class="text-slate-500 font-semibold text-base sm:text-lg">Catatan pencapaian akademik dan riwayat evaluasimu.</p>
        </header>

            {latestAttempt && (
               <section class="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 p-5 sm:p-7 shadow-lg shadow-slate-200/30 animate-fade-in [animation-delay:50ms]">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div>
                        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Attempt Terakhir</p>
                        <h3 class="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{latestExam?.title || "Ujian"}</h3>
                        <p class="text-sm text-slate-500 font-semibold mt-1">
                           {new Date(latestAttempt.startedAt).toLocaleString("id-ID")}
                        </p>
                     </div>
                     <div class="flex items-center gap-5">
                        <div class="text-right">
                           <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Skor</p>
                           <p class={`text-3xl font-bold ${latestIsPassed ? "text-emerald-600" : "text-blue-600"}`}>
                              {typeof latestAttempt.score === "number" ? Math.round(latestAttempt.score) : "--"}
                           </p>
                        </div>
                        <span class={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider ${latestStatusMeta?.badgeClass || "bg-slate-50 text-slate-700 border border-slate-200"}`}>
                           {latestStatusMeta?.label || (latestIsPassed ? "Lulus" : "Belum Lulus")}
                        </span>
                        <a href={`#attempt-card-${latestAttempt.id}`} class="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 hover:border-blue-200 hover:text-blue-700 transition-all">
                          Lihat Detail
                        </a>
                     </div>
                  </div>
               </section>
            )}

      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in [animation-delay:100ms]">
           <div class="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:border-blue-200 transition-all duration-500">
              <div class="absolute -top-6 -right-6 text-blue-500/5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                 <span class="material-symbols-outlined text-[100px] sm:text-[140px]">task</span>
              </div>
              <div class="size-14 sm:size-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 sm:mb-8 shadow-inner border border-blue-100 group-hover:scale-110 transition-transform duration-500">
                 <span class="material-symbols-outlined text-2xl sm:text-3xl font-bold">assignment</span>
              </div>
              <p class="text-slate-400 text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.2em] mb-2 sm:mb-3">Total Penugasan</p>
              <h3 class="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tighter">{historyAttempts.length}<span class="text-[12px] sm:text-lg text-slate-300 ml-3 font-bold uppercase tracking-widest">Ujian</span></h3>
           </div>
           
           <div class="bg-blue-600 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl shadow-blue-600/30 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 ring-1 ring-white/20">
              <div class="absolute -top-6 -right-6 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                 <span class="material-symbols-outlined text-[100px] sm:text-[140px]">military_tech</span>
              </div>
              <div class="size-14 sm:size-16 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-6 sm:mb-8 shadow-inner border border-white/10 backdrop-blur-md group-hover:bg-white/20 transition-colors">
                 <span class="material-symbols-outlined text-2xl sm:text-3xl font-bold">avg_pace</span>
              </div>
              <p class="text-blue-200 text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.2em] mb-2 sm:mb-3">Rata-rata Skor</p>
              <h3 class="text-3xl sm:text-5xl font-bold text-white tracking-tighter">{averageScore}<span class="text-[12px] sm:text-lg text-blue-300 ml-3 font-bold uppercase tracking-widest text-white/40">Rata2</span></h3>
           </div>

           <div class="bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 border border-white/5 sm:col-span-2 lg:col-span-1">
              <div class="absolute -top-6 -right-6 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                 <span class="material-symbols-outlined text-[100px] sm:text-[140px]">verified</span>
              </div>
              <div class="size-14 sm:size-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 sm:mb-8 shadow-inner border border-emerald-500/20 backdrop-blur-sm group-hover:bg-emerald-500/30 transition-colors">
                 <span class="material-symbols-outlined text-2xl sm:text-3xl font-bold">check_circle</span>
              </div>
              <p class="text-slate-400 text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.2em] mb-2 sm:mb-3">Status Kelulusan</p>
              <h3 class="text-3xl sm:text-5xl font-bold text-white tracking-tighter">{passedExamsCount}<span class="text-[12px] sm:text-lg text-emerald-500/50 ml-3 font-bold uppercase tracking-widest italic">Lulus</span></h3>
           </div>
        </section>

      {/* ═══ Linimasa Riwayat ═══ */}
      <section class="animate-fade-in [animation-delay:200ms]">
           <div class="flex items-center justify-between mb-8">
              <h3 class="text-2xl font-bold text-slate-900 italic">Jurnal <span class="text-blue-600">Akademik</span></h3>
              <div class="flex gap-2 items-center">
                 <select
                   value={statusFilter.value}
                   onChange$={(e: any) => statusFilter.value = e.target.value}
                            title="Filter status hasil ujian"
                   class="h-10 rounded-xl bg-white border border-slate-200 px-3 text-xs font-bold text-slate-600"
                 >
                   <option value="ALL">Semua Status</option>
                   <option value="SUBMITTED">Selesai</option>
                   <option value="TIMED_OUT">Waktu Habis</option>
                   <option value="FORCE_SUBMITTED">Force Submit</option>
                 </select>
                 <select
                   value={periodFilter.value}
                   onChange$={(e: any) => periodFilter.value = e.target.value}
                            title="Filter periode hasil ujian"
                   class="h-10 rounded-xl bg-white border border-slate-200 px-3 text-xs font-bold text-slate-600"
                 >
                   <option value="ALL">Semua Periode</option>
                   <option value="7">7 Hari</option>
                   <option value="30">30 Hari</option>
                   <option value="90">90 Hari</option>
                 </select>
              </div>
           </div>

                <div class="mb-6 flex flex-wrap gap-2">
                   {[
                      { label: "Semua", status: "ALL" as const },
                      { label: "Selesai", status: "SUBMITTED" as const },
                      { label: "Force Submit", status: "FORCE_SUBMITTED" as const },
                      { label: "7 Hari", period: "7" as const },
                      { label: "30 Hari", period: "30" as const },
                   ].map((chip, i) => {
                      const active = (chip.status && statusFilter.value === chip.status) || (chip.period && periodFilter.value === chip.period);
                      return (
                         <button
                            key={i}
                            type="button"
                            onClick$={() => {
                               if (chip.status) statusFilter.value = chip.status;
                               if (chip.period) periodFilter.value = chip.period;
                            }}
                            class={`h-9 px-4 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all ${active ? "bg-blue-600 text-white border-blue-700" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700"}`}
                         >
                            {chip.label}
                         </button>
                      );
                   })}
                </div>

           {filteredHistoryAttempts.value.length === 0 ? (
              <div class="bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-slate-100 flex flex-col items-center">
                 <div class="size-24 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                    <span class="material-symbols-outlined text-5xl font-bold">article</span>
                 </div>
                 <h4 class="text-2xl font-bold text-slate-900 mb-2">Belum Ada Riwayat</h4>
                 <p class="text-slate-400 font-bold max-w-sm">Jurnal akademikmu masih kosong. Selesaikan ujian pertamamu sekarang.</p>
                 <Link href="/student/" class="mt-8 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Kembali ke Beranda</Link>
              </div>
           ) : (
              <div class="grid grid-cols-1 gap-8">
                 {filteredHistoryAttempts.value.map((attempt) => {
                    const exam = getExamForAttempt(attempt.examId);
                    const isPassed = attempt.score !== null && exam.passingScore !== undefined && attempt.score >= exam.passingScore;
                    const statusMeta = getAttemptStatusMeta((attempt.status || "SUBMITTED") as AttemptStatus);
                    
                    return (
                         <div id={`attempt-card-${attempt.id}`} key={attempt.id} class="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10 group hover:border-blue-400/30 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-[4rem] -mr-10 -mt-10 group-hover:bg-blue-100/50 transition-colors duration-500"></div>
                            
                            <div class={`size-20 sm:size-24 rounded-[2rem] flex items-center justify-center text-3xl sm:text-4xl font-bold shrink-0 shadow-lg italic relative z-10 transition-transform duration-500 group-hover:scale-110 ${
                               isPassed 
                                 ? 'bg-emerald-50 text-emerald-600 shadow-emerald-500/10' 
                                 : 'bg-blue-50 text-blue-600 shadow-blue-500/10'
                            }`}>
                               {exam.subject?.charAt(0).toUpperCase() || 'E'}
                            </div>

                           <div class="flex-1 space-y-2 relative z-10">
                              <div class="flex flex-wrap items-center gap-4 mb-2">
                                 <span class={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] ${statusMeta.badgeClass}`}>
                                    {statusMeta.label}
                                 </span>
                                 <span class="text-[11px] font-bold text-slate-300 uppercase tracking-widest italic flex items-center gap-2">
                                    <span class="size-1.5 bg-slate-200 rounded-full"></span>
                                    {exam.code || 'EXM-2024'}
                                 </span>
                              </div>
                              <h4 class="text-2xl sm:text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight tracking-tight">{exam.title || "Evaluasi Akademik"}</h4>
                              
                              {/* Progress bar visual aid */}
                              <div class="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                                                <progress
                                                   value={attempt.score || 0}
                                                   max={100}
                                                   class={`h-full w-full [&::-webkit-progress-bar]:bg-transparent ${isPassed ? '[&::-webkit-progress-value]:bg-emerald-500 [&::-moz-progress-bar]:bg-emerald-500' : '[&::-webkit-progress-value]:bg-blue-500 [&::-moz-progress-bar]:bg-blue-500'}`}
                                                />
                              </div>

                              <div class="flex items-center gap-8 mt-4 text-[12px] font-bold text-slate-400 italic">
                                 <div class="flex items-center gap-2.5">
                                    <span class="material-symbols-outlined text-[18px] text-blue-500">calendar_month</span>
                                    {new Date(attempt.startedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                 </div>
                                 <div class="flex items-center gap-2.5">
                                    <span class="material-symbols-outlined text-[18px] text-blue-500">schedule</span>
                                    {attempt.endedAt && attempt.startedAt ? Math.round((new Date(attempt.endedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000) : '--'} Menit
                                 </div>
                              </div>
                           </div>

                            <div class="flex items-center justify-between sm:justify-end gap-10 sm:pl-10 sm:border-l sm:border-slate-100 w-full sm:w-auto pt-6 sm:pt-0 border-t sm:border-t-0 relative z-10">
                               <div class="text-left sm:text-right">
                                  <p class="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] mb-2">Nilai Akhir</p>
                                  <div class="flex items-baseline justify-start sm:justify-end gap-2">
                                     <span class={`text-4xl sm:text-6xl font-bold tracking-tighter ${isPassed ? 'text-emerald-600' : 'text-blue-600'}`}>{attempt.score !== null ? Math.round(attempt.score) : '--'}</span>
                                     <span class="text-sm font-bold text-slate-300 opacity-60">/ 100</span>
                                  </div>
                               </div>
                               <button class="size-14 sm:size-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-blue-500/20 active:scale-95">
                                  <span class="material-symbols-outlined font-bold text-2xl group-hover:rotate-45 transition-transform duration-500">arrow_outward</span>
                               </button>
                            </div>
                        </div>
                    );
                  })}
              </div>
           )}
        </section>
      </main>

      {/* ═══ Navigasi Bawah (Mobile) ═══ */}
      <div class="md:hidden fixed bottom-10 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-sm bg-white/70 backdrop-blur-3xl border border-white/40 rounded-[3rem] px-5 py-4 shadow-[0_30px_90px_rgba(0,0,0,0.15)] flex items-center justify-between z-50 animate-fade-in-up ring-1 ring-black/5">
        <Link href="/student/" class="flex flex-col items-center gap-1.5 group">
           <div class="size-11 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all duration-300">
              <span class="material-symbols-outlined font-bold text-2xl">grid_view</span>
           </div>
           <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Beranda</span>
        </Link>
        <div class="relative flex flex-col items-center gap-1.5 group">
           <div class="size-16 -mt-10 bg-blue-600 text-white rounded-[1.75rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 ring-[6px] ring-white transition-all duration-500 group-active:scale-95 group-hover:rotate-6">
              <span class="material-symbols-outlined font-bold text-3xl">analytics</span>
           </div>
           <span class="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Portofolio</span>
        </div>
        <Link href="/student/test-device/" class="flex flex-col items-center gap-1.5 group">
           <div class="size-11 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-amber-500 group-hover:bg-amber-50 transition-all duration-300">
              <span class="material-symbols-outlined font-bold text-2xl">on_device_training</span>
           </div>
           <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-amber-500 transition-colors">Perangkat</span>
        </Link>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Hasil & Riwayat Ujian — Examinator",
};
