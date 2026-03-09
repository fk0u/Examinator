import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useNavigate } from "@builder.io/qwik-city";
import { examsApi, attemptsApi } from "~/lib/api";
import { getUserData, isAuthenticated, logout } from "~/lib/auth";

// ─── Student Dashboard ──────────────────────────────────

export default component$(() => {
  const user = useSignal<any>(null);
  const exams = useSignal<any[]>([]);
  const attempts = useSignal<any[]>([]);
  const loading = useSignal(true);
  const nav = useNavigate();

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

  return (
    <div class="min-h-screen bg-surface-900 bg-gradient-mesh">
      {/* Header */}
      <header class="glass border-b border-surface-700/50 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="font-bold text-gradient">Examinator</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-surface-400">
              Halo, <span class="text-surface-200 font-medium">{user.value?.fullName}</span>
            </span>
            <button
              onClick$={() => { logout(); }}
              class="text-sm text-surface-400 hover:text-danger transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Section */}
        <div class="mb-8 animate-fade-in">
          <h1 class="text-2xl font-bold text-surface-100 mb-1">Dashboard Siswa</h1>
          <p class="text-surface-400">
            {user.value?.kelas && <span class="text-primary-400">{user.value.kelas}</span>}
            {" — "} Lihat dan mulai ujian yang tersedia
          </p>
        </div>

        {/* Loading */}
        {loading.value && (
          <div class="flex items-center justify-center py-20">
            <div class="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Exams Grid */}
        {!loading.value && (
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.value.map((exam: any, idx: number) => {
              const attempt = getAttemptForExam(exam.id);
              const isCompleted = attempt?.status === "SUBMITTED" || attempt?.status === "TIMED_OUT";
              const isInProgress = attempt?.status === "IN_PROGRESS";

              return (
                <div
                  key={exam.id}
                  class="glass rounded-2xl p-5 card-hover animate-fade-in"
                  style={`animation-delay: ${idx * 100}ms`}
                >
                  {/* Subject Badge */}
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
                      {exam.subject}
                    </span>
                    {isCompleted && (
                      <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/20">
                        ✓ Selesai
                      </span>
                    )}
                    {isInProgress && (
                      <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-warning/10 text-warning border border-warning/20 animate-pulse-glow">
                        ● Berjalan
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 class="text-lg font-semibold text-surface-100 mb-2">{exam.title}</h3>

                  {/* Description */}
                  {exam.description && (
                    <p class="text-sm text-surface-400 mb-4 line-clamp-2">{exam.description}</p>
                  )}

                  {/* Meta */}
                  <div class="flex items-center gap-4 text-xs text-surface-500 mb-4">
                    <span class="flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {exam.duration} menit
                    </span>
                    <span class="flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {exam._count?.questions || 0} soal
                    </span>
                    <span class="flex items-center gap-1">
                      KKM: {exam.passingScore}
                    </span>
                  </div>

                  {/* Score (if completed) */}
                  {isCompleted && attempt?.score !== null && (
                    <div class={`mb-4 p-3 rounded-xl ${attempt.score >= exam.passingScore ? 'bg-success/10 border border-success/20' : 'bg-danger/10 border border-danger/20'}`}>
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-surface-300">Nilai:</span>
                        <span class={`text-lg font-bold ${attempt.score >= exam.passingScore ? 'text-success' : 'text-danger'}`}>
                          {Math.round(attempt.score)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {!isCompleted && (
                    <button
                      onClick$={async () => {
                        await nav(`/student/exam/${exam.id}/`);
                      }}
                      class={`w-full py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                        isInProgress
                          ? 'bg-warning/10 text-warning border border-warning/30 hover:bg-warning/20'
                          : 'bg-gradient-primary text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      {isInProgress ? "Lanjutkan Ujian" : "Mulai Ujian"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading.value && exams.value.length === 0 && (
          <div class="text-center py-20">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-800 flex items-center justify-center">
              <svg class="w-8 h-8 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-surface-300 mb-1">Belum ada ujian</h3>
            <p class="text-surface-500 text-sm">Ujian yang tersedia akan muncul di sini</p>
          </div>
        )}
      </main>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Dashboard Siswa — Examinator",
};
