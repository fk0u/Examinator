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
