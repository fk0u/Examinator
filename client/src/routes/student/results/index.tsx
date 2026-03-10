import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link, useNavigate } from "@builder.io/qwik-city";
import { examsApi, attemptsApi } from "~/lib/api";
import { getUserData, isAuthenticated, logout } from "~/lib/auth";
import { Clock } from "~/components/ui/clock";

// ─── Student Results & History ─────────────────────────

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
    } catch (err) {
      console.error(err);
      // Optional: handle error state
    } finally {
      loading.value = false;
    }
  });

  const getExamForAttempt = (examId: string) => {
    return exams.value.find((e: any) => e.id === examId) || {};
  };

  const historyAttempts = attempts.value.filter(
    (a) => a.status === "SUBMITTED" || a.status === "TIMED_OUT"
  ).sort((a, b) => new Date(b.endedAt || b.createdAt).getTime() - new Date(a.endedAt || a.createdAt).getTime());

  const averageScore = historyAttempts.length > 0
    ? Math.round(
        historyAttempts.reduce((acc, attempt) => acc + (attempt.score || 0), 0) /
          historyAttempts.length
      )
    : 0;

  const passedExamsCount = historyAttempts.filter((a) => {
    const exam = getExamForAttempt(a.examId);
    return a.score !== null && exam.passingScore && a.score >= exam.passingScore;
  }).length;


  if (loading.value) {
    return (
      <div class="min-h-screen bg-slate-50 flex items-center justify-center">
        <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div class="font-sans min-h-screen bg-slate-50 text-slate-800 mesh-gradient pb-12">
      {/* ═══ Sticky Glassmorphic Navbar ═══ */}
      <nav class="sticky top-0 z-50 px-6 py-3">
        <div class="max-w-7xl mx-auto glass rounded-2xl px-6 py-2 flex items-center justify-between shadow-sm">
          <div class="flex items-center gap-8">
            <Link href="/student/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div class="bg-blue-500 p-2 rounded-xl flex items-center justify-center text-white">
                <span class="material-symbols-outlined text-2xl">rocket_launch</span>
              </div>
              <h2 class="text-slate-900 text-xl font-bold tracking-tight hidden sm:block">
                Examinator
              </h2>
            </Link>
            <div class="hidden md:flex items-center gap-6">
              <Link href="/student/" class="text-slate-500 hover:text-blue-500 transition-colors font-medium text-sm cursor-pointer py-4">
                Dashboard
              </Link>
              <Link href="/student/" class="text-slate-500 hover:text-blue-500 transition-colors font-medium text-sm cursor-pointer py-4">
                Ujian Saya
              </Link>
              <span class="text-blue-500 font-semibold text-sm cursor-pointer border-b-2 border-blue-500 py-4">
                Hasil
              </span>
            </div>
          </div>

          <div class="flex items-center gap-4">
            {/* Clock Widget */}
            <div class="hidden lg:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-slate-600">
              <span class="material-symbols-outlined text-sm">schedule</span>
              <span class="text-xs font-bold uppercase tracking-wider">
                <Clock />
              </span>
            </div>

            <div class="flex items-center gap-2">
              <Link
                href="/profile/"
                class="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform truncate max-w-[150px] sm:max-w-none"
              >
                Hai, {user.value?.fullName?.split(" ")[0] || "Siswa"}
              </Link>
              <button
                onClick$={() => {
                  logout();
                  nav("/");
                }}
                class="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors relative"
                title="Keluar"
              >
                <span class="material-symbols-outlined">logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto px-6 py-8 space-y-10">
        <header class="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
          <div>
            <h1 class="text-3xl md:text-4xl font-black text-slate-900 mb-2">
              Hasil & Riwayat <span class="text-blue-500">Ujian</span>
            </h1>
            <p class="text-slate-500">
              Lihat performa dan evaluasi hasil belajarmu dari waktu ke waktu.
            </p>
          </div>
        </header>

        {/* ═══ Stats Overview Grid ═══ */}
        <section class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in [animation-delay:100ms]">
          <div class="glass rounded-3xl p-6 border border-white/50 shadow-sm flex items-center gap-6 hover:-translate-y-1 transition-transform">
             <div class="w-16 h-16 rounded-2xl bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
               <span class="material-symbols-outlined text-3xl">task</span>
             </div>
             <div>
               <p class="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Ujian</p>
               <p class="text-3xl font-black text-slate-900">{historyAttempts.length}</p>
             </div>
          </div>
          
          <div class="glass rounded-3xl p-6 border border-white/50 shadow-sm flex items-center gap-6 hover:-translate-y-1 transition-transform">
             <div class="w-16 h-16 rounded-2xl bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
               <span class="material-symbols-outlined text-3xl">military_tech</span>
             </div>
             <div>
               <p class="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Rata-Rata Nilai</p>
               <p class="text-3xl font-black text-slate-900">{averageScore}<span class="text-xl text-slate-400 font-medium">/100</span></p>
             </div>
          </div>

          <div class="glass rounded-3xl p-6 border border-white/50 shadow-sm flex items-center gap-6 hover:-translate-y-1 transition-transform">
             <div class="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-500 flex items-center justify-center shrink-0">
               <span class="material-symbols-outlined text-3xl">verified</span>
             </div>
             <div>
               <p class="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Ujian Lulus</p>
               <p class="text-3xl font-black text-slate-900">{passedExamsCount}<span class="text-xl text-slate-400 font-medium">/{historyAttempts.length}</span></p>
             </div>
          </div>
        </section>

        {/* ═══ History List ═══ */}
        <section class="animate-fade-in [animation-delay:200ms]">
          <div class="glass rounded-3xl overflow-hidden border border-white/50 shadow-sm">
            <div class="p-6 md:p-8 border-b border-slate-100/50 bg-white/30 backdrop-blur-md">
              <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span class="material-symbols-outlined text-blue-500">history</span>
                Riwayat Lengkap
              </h2>
            </div>
            
            <div class="p-6 md:p-8">
              {historyAttempts.length === 0 ? (
                <div class="text-center py-12">
                  <span class="material-symbols-outlined text-6xl text-slate-300 mb-4 block">receipt_long</span>
                  <h3 class="text-lg font-bold text-slate-700 mb-1">Belum ada riwayat hasil</h3>
                  <p class="text-slate-500">Hasil ujianmu akan muncul di sini setelah kamu menyelesaikan ujian.</p>
                </div>
              ) : (
                <div class="space-y-4">
                  {historyAttempts.map((attempt) => {
                    const exam = getExamForAttempt(attempt.examId);
                    const isPassed = attempt.score !== null && exam.passingScore !== undefined && attempt.score >= exam.passingScore;
                    const durationInMinutes = attempt.endedAt && attempt.startedAt 
                      ? Math.max(1, Math.round((new Date(attempt.endedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000))
                      : '-';

                    return (
                      <div key={attempt.id} class="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-white/60 border border-slate-100 hover:border-blue-200 transition-colors gap-4">
                        
                        <div class="flex items-center gap-4">
                          <div class={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-bold text-xl ${isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                            {exam.subject?.charAt(0).toUpperCase() || 'E'}
                          </div>
                          <div>
                            <h3 class="font-bold text-slate-900 text-lg line-clamp-1">{exam.title || "Ujian Tidak Diketahui"}</h3>
                            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                              <span class="flex items-center gap-1">
                                <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                                {new Date(attempt.startedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                              <span class="flex items-center gap-1">
                                <span class="material-symbols-outlined text-[16px]">timer</span>
                                {durationInMinutes} Menit
                              </span>
                            </div>
                          </div>
                        </div>

                        <div class="flex items-center justify-between md:justify-end gap-6 md:min-w-[200px] border-t md:border-t-0 border-slate-200/50 pt-4 md:pt-0">
                          <div class="flex flex-col items-start md:items-end">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</span>
                            {isPassed ? (
                              <span class="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">LULUS</span>
                            ) : (
                              <span class="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">TIDAK LULUS</span>
                            )}
                          </div>
                          
                          <div class="text-right">
                             <span class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Nilai</span>
                             <div class="text-3xl font-black text-slate-900 -mt-2">
                               {attempt.score !== null ? Math.round(attempt.score) : <span class="text-slate-300">-</span>}
                             </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Hasil & Riwayat Ujian — Examinator",
};
