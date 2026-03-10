import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link, useNavigate } from "@builder.io/qwik-city";
import { examsApi, attemptsApi } from "~/lib/api";
import { getUserData, isAuthenticated, logout } from "~/lib/auth";
import { Clock } from "~/components/ui/clock";

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
    } catch (err) {
      logout();
      await nav("/");
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
    <div class="font-sans min-h-screen bg-slate-50 text-slate-800 mesh-gradient">
      {/* ═══ Sticky Glassmorphic Navbar ═══ */}
      <nav class="sticky top-0 z-50 px-6 py-3">
        <div class="max-w-7xl mx-auto glass rounded-2xl px-6 py-2 flex items-center justify-between shadow-sm">
          <div class="flex items-center gap-8">
            <div class="flex items-center gap-2">
              <div class="bg-blue-500 p-2 rounded-xl flex items-center justify-center text-white">
                <span class="material-symbols-outlined text-2xl">rocket_launch</span>
              </div>
              <h2 class="text-slate-900 text-xl font-bold tracking-tight hidden sm:block">Examinator</h2>
            </div>
            <div class="hidden md:flex items-center gap-6">
              <span class="text-blue-500 font-semibold text-sm cursor-pointer border-b-2 border-blue-500 py-4">Dashboard</span>
              <span class="text-slate-500 hover:text-blue-500 transition-colors font-medium text-sm cursor-pointer py-4">Ujian Saya</span>
              <Link href="/student/results/" class="text-slate-500 hover:text-blue-500 transition-colors font-medium text-sm cursor-pointer py-4">Hasil</Link>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            {/* Clock Widget */}
            <div class="hidden lg:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-slate-600">
              <span class="material-symbols-outlined text-sm">schedule</span>
              <span class="text-xs font-bold uppercase tracking-wider"><Clock /></span>
            </div>
            
            <div class="flex items-center gap-2">
              <Link href="/profile/" class="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform truncate max-w-[150px] sm:max-w-none">
                Hai, {user.value?.fullName?.split(' ')[0] || "Siswa"}
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
        
        {/* ═══ Hero Section: Statistik Ujian ═══ */}
        <section class="animate-fade-in">
          <div class="relative overflow-hidden glass rounded-3xl p-8 md:p-12 shadow-xl border border-white/50">
            <div class="absolute -top-24 -right-24 w-64 h-64 bg-yellow-400/20 blur-3xl rounded-full"></div>
            <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full"></div>
            
            <div class="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 class="text-slate-900 text-4xl md:text-5xl font-black leading-tight mb-4">
                  Statistik <span class="text-blue-500">Ujian</span> Anda
                </h1>
                <p class="text-slate-500 text-lg max-w-md">
                  Terus tingkatkan performa akademik Anda. Lihat ringkasan pencapaian terbaik Anda bulan ini.
                </p>
              </div>
              
              <div class="flex flex-wrap gap-6 justify-center md:justify-end">
                <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 w-full sm:w-56 text-center hover:shadow-lg transition-shadow">
                  <span class="material-symbols-outlined text-blue-500 text-4xl mb-4">task_alt</span>
                  <p class="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Ujian Selesai</p>
                  <p class="text-slate-900 text-5xl font-black">{historyExams.length}</p>
                </div>
                
                <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 w-full sm:w-56 text-center hover:shadow-lg transition-shadow">
                  <span class="material-symbols-outlined text-yellow-500 text-4xl mb-4">auto_awesome</span>
                  <p class="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Nilai Rata-rata</p>
                  <p class="text-slate-900 text-5xl font-black">{averageScore}%</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Active/Upcoming Exams Grid ═══ */}
        <section class="animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-2xl font-bold text-slate-900">Ujian Mendatang</h2>
              <p class="text-slate-500">Pilih ujian yang sudah dijadwalkan hari ini.</p>
            </div>
            <span class="flex items-center gap-2 text-blue-500 font-bold hover:underline cursor-pointer">
              Lihat Semua Jadwal <span class="material-symbols-outlined">chevron_right</span>
            </span>
          </div>
          
          {availableExams.length === 0 ? (
            <div class="glass rounded-3xl p-12 border border-slate-200 text-center">
              <span class="material-symbols-outlined text-6xl text-slate-300 mb-4">coffee</span>
              <h3 class="text-xl font-bold text-slate-700 mb-2">Belum ada jadwal ujian</h3>
            </div>
          ) : (
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableExams.map((exam) => {
                const attempt = getAttemptForExam(exam.id);
                const isInProgress = attempt?.status === "IN_PROGRESS";
                
                return (
                  <div key={exam.id} class="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-500/30 transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col">
                    <div class="flex items-start justify-between mb-6">
                      <div class="bg-blue-50 text-blue-500 p-3 rounded-2xl">
                        <span class="material-symbols-outlined text-3xl">calculate</span>
                      </div>
                      {isInProgress ? (
                        <div class="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase flex items-center gap-1.5">
                          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Sedang Berjalan
                        </div>
                      ) : (
                        <div class="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full uppercase">
                           Tersedia
                        </div>
                      )}
                    </div>
                    
                    <h3 class="text-xl font-bold text-slate-900 mb-2 line-clamp-2" title={exam.title}>{exam.title}</h3>
                    <p class="text-slate-500 text-sm mb-6 line-clamp-2 flex-grow">{exam.description || "Tidak ada deskripsi."}</p>
                    
                    <div class="flex items-center gap-4 mb-8">
                      <div class="flex items-center gap-1 text-slate-500 text-xs font-medium">
                        <span class="material-symbols-outlined text-lg">timer</span> {exam.duration} Menit
                      </div>
                      <div class="flex items-center gap-1 text-slate-500 text-xs font-medium">
                        <span class="material-symbols-outlined text-lg">quiz</span> {exam._count?.questions || 0} Soal
                      </div>
                    </div>
                    
                    <button
                        onClick$={async () => await nav(`/student/exam/${exam.id}/`)}
                        class={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                          isInProgress 
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
                            : "bg-blue-500 text-white group-hover:shadow-lg group-hover:shadow-blue-500/30"
                        }`}
                    >
                      {isInProgress ? "Lanjutkan Ujian" : "Mulai Ujian"} 
                      <span class={`material-symbols-outlined ${!isInProgress && 'group-hover:translate-x-1 transition-transform'}`}>
                        {isInProgress ? 'resume' : 'arrow_forward'}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ═══ Quick Tips & History Alternative ═══ */}
        <section class="grid lg:grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
          
          <div class="lg:col-span-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl">
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 -mr-20 -mt-20 rounded-full blur-2xl pointer-events-none"></div>
            <div class="z-10 text-center md:text-left">
              <h3 class="text-2xl font-bold mb-2">Ingin meningkatkan skormu?</h3>
              <p class="text-blue-100 max-w-sm mb-6 text-sm sm:text-base">Pastikan koneksi internet stabil dan webcam berfungsi dengan baik sebelum memulai ujian dengan fitur proctoring.</p>
              <button class="bg-white text-blue-500 px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg cursor-not-allowed">
                Cek Kesiapan Perangkat
              </button>
            </div>
            <div class="z-10 hidden md:block">
              <span class="material-symbols-outlined text-[100px] lg:text-[120px] opacity-30">laptop_mac</span>
            </div>
          </div>

          <div class="glass rounded-3xl p-8 border border-white/50 shadow-sm flex flex-col">
            <h3 class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span class="material-symbols-outlined text-blue-500">event</span> Riwayat Terakhir
            </h3>
            
            <div class="space-y-4 flex-grow">
              {historyExams.length === 0 ? (
                <div class="text-center py-6 text-slate-500 text-sm">Belum ada riwayat ujian.</div>
              ) : (
                historyExams.slice(0, 3).map((exam) => {
                  const attempt = getAttemptForExam(exam.id);
                  const isPassed = attempt?.score !== null && attempt?.score >= exam.passingScore;
                  
                  return (
                    <div key={exam.id} class="flex items-center justify-between p-3 rounded-2xl bg-white/50 border border-slate-100">
                      <div class="flex items-center gap-3">
                        <div class={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-base ${isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                          {exam.subject.charAt(0).toUpperCase()}
                        </div>
                        <div class="min-w-0 pr-2">
                          <p class="text-sm font-bold text-slate-800 truncate">{exam.title}</p>
                          <p class="text-[10px] text-slate-400">{new Date(attempt.startedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <span class={`font-bold text-lg ml-2 ${isPassed ? 'text-emerald-500' : 'text-blue-500'}`}>
                        {attempt?.score !== null ? Math.round(attempt.score) : '-'}/100
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            {historyExams.length > 3 && (
              <Link href="/student/results/" class="w-full mt-4 py-2 block text-center text-blue-500 font-bold text-sm hover:underline transition-colors">
                Lihat Semua Nilai
              </Link>
            )}
          </div>
          
        </section>

      </main>

      <footer class="max-w-7xl mx-auto px-6 py-12 text-center text-slate-400 text-sm">
        <p>© 2026 Examinator CBT Platform. All rights reserved.</p>
      </footer>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Dashboard Siswa — Examinator",
};
