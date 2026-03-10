import { component$, useSignal, useVisibleTask$, $, useOnDocument } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useNavigate, useLocation, Link } from "@builder.io/qwik-city";
import { attemptsApi, cheatLogsApi, examsApi } from "~/lib/api";
import { getUserData, isAuthenticated } from "~/lib/auth";
import { getWsClient } from "~/lib/ws";
import { useCamera } from "~/hooks/use-camera";

export default component$(() => {
  const loc = useLocation();
  const nav = useNavigate();
  const examId = loc.params.examId;

  const user = useSignal<any>(null);
  const examData = useSignal<any>(null);
  const attempt = useSignal<any>(null);
  const questions = useSignal<any[]>([]);
  const currentQuestion = useSignal(0);
  const answers = useSignal<Record<string, string>>({});
  const timeLeft = useSignal(0);
  
  const { cameraEnabled, capturePhoto, stream } = useCamera(attempt);
  const videoPreviewRef = useSignal<HTMLVideoElement>();
  
  const isReady = useSignal(false);
  const termsAccepted = useSignal(false);
  
  const loading = useSignal(false);
  const submitting = useSignal(false);
  const cheatCount = useSignal(0);
  const showWarning = useSignal(false);
  const warningMessage = useSignal("");

  // Bind camera stream to the Readiness Room preview video
  useVisibleTask$(({ track }) => {
    track(() => stream.value);
    if (stream.value && videoPreviewRef.value) {
      videoPreviewRef.value.srcObject = stream.value;
    }
  });

  // ── Load Exam Info for Readiness Room ────────────────
  useVisibleTask$(async () => {
    if (!isAuthenticated()) {
      await nav("/");
      return;
    }
    user.value = getUserData();

    try {
      const data = await examsApi.get(examId);
      examData.value = data.exam;
    } catch (e: any) {
      console.error("Failed to fetch exam:", e);
      alert("Gagal memuat info ujian.");
      nav("/student/");
    }
  });

  // ── Start attempt ────────────────────────────────────
  const startActualExam = $(async () => {
    if (!termsAccepted.value) return;
    loading.value = true;
    
    try {
      const data = await attemptsApi.start(examId, cameraEnabled.value);
      attempt.value = data.attempt;
      questions.value = data.attempt.exam?.questions || [];
      timeLeft.value = data.attempt.exam?.duration * 60; // Convert to seconds

      // Connect WebSocket
      const ws = getWsClient();
      ws.connect();
      ws.send("student:join", {
        userId: user.value.id,
        fullName: user.value.fullName,
        attemptId: data.attempt.id,
        examId,
        cameraEnabled: cameraEnabled.value,
      });

      // Handle force-submit from proctor
      ws.on("force:submit", async () => {
        await submitExam();
      });

      // Start timer
      const timer = setInterval(() => {
        timeLeft.value--;
        if (timeLeft.value <= 0) {
          clearInterval(timer);
          submitExam();
        }
      }, 1000);

      // Request fullscreen
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Fullscreen may not be available immediately
      }

      isReady.value = true;
      loading.value = false;
    } catch (e: any) {
      console.error("Failed to start exam:", e);
      alert("Gagal memulai ujian: " + e.message);
      loading.value = false;
    }
  });

  // ── Cheat Detection ──────────────────────────────────
  useOnDocument(
    "visibilitychange",
    $(() => {
      if (document.hidden && attempt.value && isReady.value) {
        logCheat("TAB_SWITCH", "Siswa berpindah tab");
      }
    })
  );

  useOnDocument(
    "fullscreenchange",
    $(() => {
      if (!document.fullscreenElement && attempt.value && isReady.value) {
        logCheat("FULLSCREEN_EXIT", "Siswa keluar dari fullscreen");
        try {
          document.documentElement.requestFullscreen();
        } catch {
          // ignore
        }
      }
    })
  );

  // ── Log cheat event ─────────────────────────────────
  const logCheat = $(async (type: string, description: string) => {
    cheatCount.value++;
    showWarning.value = true;
    warningMessage.value = `⚠️ Peringatan: ${description}. Pelanggaran ke-${cheatCount.value}`;

    setTimeout(() => {
      showWarning.value = false;
    }, 3000);

    try {
      await cheatLogsApi.log({
        attemptId: attempt.value.id,
        cheatType: type,
        description,
      });
      const ws = getWsClient();
      ws.send("cheat:detected", { cheatType: type, description });
      capturePhoto(type, description);
    } catch {
      // silently fail
    }
  });

  // ── Save answer ─────────────────────────────────────
  const saveAnswer = $(async (questionId: string, optionId: string) => {
    answers.value = { ...answers.value, [questionId]: optionId };
    try {
      await attemptsApi.answer(attempt.value.id, { questionId, optionId });
    } catch {
      // silently fail
    }
  });

  // ── Submit exam ─────────────────────────────────────
  const submitExam = $(async () => {
    if (submitting.value) return;
    submitting.value = true;
    try {
      const ws = getWsClient();
      ws.send("student:submit", {});
      const result = await attemptsApi.submit(attempt.value.id);

      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      ws.disconnect();

      alert(`Ujian selesai!\nNilai: ${Math.round(result.result.score)}\nStatus: ${result.result.passed ? 'LULUS ✓' : 'BELUM LULUS ✗'}`);
      await nav("/student/");
    } catch (e: any) {
      submitting.value = false;
      alert("Gagal mengirim ujian: " + e.message);
    }
  });

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ──────────────────────────────────────────────────────
  // Render Pre-Exam Readiness Room
  // ──────────────────────────────────────────────────────
  if (!isReady.value) {
    if (!examData.value) {
      return (
        <div class="min-h-screen bg-slate-50 flex items-center justify-center">
          <div class="text-center">
            <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p class="text-slate-500 font-medium">Memuat Info Ujian...</p>
          </div>
        </div>
      );
    }

    return (
      <div class="font-sans bg-slate-50 text-slate-900 mesh-gradient min-h-screen">
        <div class="relative flex min-h-screen w-full flex-col overflow-x-hidden">
          {/* Top Navigation Bar */}
          <nav class="sticky top-0 z-50 px-6 py-3">
            <div class="max-w-7xl mx-auto glass rounded-2xl px-6 py-2 flex items-center justify-between shadow-sm">
              <div class="flex items-center gap-3">
                <div class="flex items-center justify-center size-10 bg-blue-500 rounded-xl text-white">
                  <span class="material-symbols-outlined">assignment_turned_in</span>
                </div>
                <h2 class="text-slate-900 text-xl font-bold tracking-tight">Examinator</h2>
              </div>
              <div class="flex gap-3">
                <Link href="/student/" class="flex items-center justify-center rounded-xl h-10 w-10 bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200">
                  <span class="material-symbols-outlined">close</span>
                </Link>
              </div>
            </div>
          </nav>

          <main class="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-7xl mx-auto w-full">
            {/* Hero Section */}
            <div class="w-full text-center mb-10 animate-fade-in">
              <h1 class="text-slate-900 text-4xl font-black leading-tight tracking-tight mb-2">Pre-Exam Readiness</h1>
              <p class="text-slate-600 text-lg">Pastikan semua sistem berfungsi dengan baik sebelum memulai ujian.</p>
            </div>

            {/* Main Layout Grid */}
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full animate-fade-in" style={{ animationDelay: "100ms" }}>
              {/* Left: Camera Preview & System Check */}
              <div class="lg:col-span-7 flex flex-col gap-6">
                <div class="glass rounded-xl p-6 shadow-sm">
                  <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-blue-500">videocam</span>
                    Webcam Preview
                  </h3>
                  <div class="relative aspect-video bg-slate-200 rounded-xl overflow-hidden group border border-slate-300">
                    {stream.value ? (
                      <video autoplay playsInline ref={videoPreviewRef} class="w-full h-full object-cover scale-x-[-1]" />
                    ) : (
                      <div class="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <span class="material-symbols-outlined text-5xl mb-2">no_photography</span>
                        <p class="text-sm font-medium">Kamera Sedang Dimuat / Tidak Tersedia</p>
                      </div>
                    )}
                    <div class="absolute inset-0 border-2 border-blue-500/30 rounded-xl pointer-events-none"></div>
                    <div class="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs flex items-center gap-2">
                      <span class={`size-2 rounded-full animate-pulse ${stream.value ? 'bg-emerald-500' : 'bg-red-500'}`}></span> 
                      {stream.value ? 'Live Preview' : 'No Connection'}
                    </div>
                  </div>
                  <p class="mt-4 text-sm text-slate-500 italic">Pastikan wajah terlihat jelas dan berada di tengah frame.</p>
                </div>

                <div class="glass rounded-xl p-6 shadow-sm border-l-4 border-l-yellow-500">
                  <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-blue-500">analytics</span>
                    System Check Panel
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-slate-100">
                      <div class="flex items-center gap-3">
                        <span class={`material-symbols-outlined ${stream.value ? 'text-emerald-500' : 'text-red-500'}`}>
                          {stream.value ? 'check_circle' : 'error'}
                        </span>
                        <span class="font-medium text-slate-800">Camera Active</span>
                      </div>
                      <span class={`text-[10px] sm:text-xs font-bold uppercase ${stream.value ? 'text-emerald-600' : 'text-red-500'}`}>
                        {stream.value ? 'Ready' : 'Block'}
                      </span>
                    </div>
                    <div class="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-slate-100">
                      <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-emerald-500">check_circle</span>
                        <span class="font-medium text-slate-800">Connection</span>
                      </div>
                      <span class="text-xs font-bold text-emerald-600 uppercase">Stable</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Rules & CTA */}
              <div class="lg:col-span-5 flex flex-col gap-6">
                <div class="glass rounded-xl p-8 shadow-sm h-full flex flex-col">
                  <h3 class="text-xl font-bold mb-6 text-slate-900 border-b border-slate-200 pb-4">Tata Tertib Ujian</h3>
                  <ul class="space-y-6 flex-1">
                    <li class="flex gap-4">
                      <div class="flex-shrink-0 size-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <span class="material-symbols-outlined text-yellow-600 text-lg">tab_unselected</span>
                      </div>
                      <div>
                        <h4 class="font-bold text-slate-800">Dilarang berpindah tab</h4>
                        <p class="text-sm text-slate-500">Sistem mendeteksi jika Anda membuka tab atau aplikasi lain secara otomatis.</p>
                      </div>
                    </li>
                    <li class="flex gap-4">
                      <div class="flex-shrink-0 size-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <span class="material-symbols-outlined text-yellow-600 text-lg">videocam</span>
                      </div>
                      <div>
                        <h4 class="font-bold text-slate-800">Kamera Merekam Aktif</h4>
                        <p class="text-sm text-slate-500">Aktifitas direkam periodik untuk keperluan integritas dan validasi.</p>
                      </div>
                    </li>
                    <li class="flex gap-4">
                      <div class="flex-shrink-0 size-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <span class="material-symbols-outlined text-yellow-600 text-lg">person_pin</span>
                      </div>
                      <div>
                        <h4 class="font-bold text-slate-800">Tetap di Area Layar</h4>
                        <p class="text-sm text-slate-500">Pastikan Anda tidak meninggalkan area tangkapan pengawasan kamera.</p>
                      </div>
                    </li>
                  </ul>
                  
                  <div class="mt-8 pt-6 border-t border-slate-200">
                    <div class="flex items-start gap-3 mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <input 
                        id="terms" 
                        type="checkbox" 
                        checked={termsAccepted.value}
                        onChange$={(e: any) => termsAccepted.value = e.target.checked}
                        class="mt-1 rounded border-blue-500 text-blue-600 focus:ring-blue-500 h-5 w-5 cursor-pointer" 
                      />
                      <label class="text-sm text-slate-600 leading-relaxed cursor-pointer font-medium" for="terms">
                        Saya telah membaca semua aturan dan menyetujui perekaman sistem demi kelancaran ujian.
                      </label>
                    </div>
                    <button 
                      onClick$={startActualExam}
                      disabled={!termsAccepted.value || loading.value}
                      class={`w-full flex items-center justify-center gap-2 rounded-xl h-14 font-bold text-lg transition-all shadow-lg ${
                        termsAccepted.value 
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 hover:-translate-y-1" 
                          : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                      }`}
                    >
                      <span>{loading.value ? "Menyiapkan Ujian..." : "Saya Mengerti & Mulai Ujian"}</span>
                      {!loading.value && <span class="material-symbols-outlined">arrow_forward</span>}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Simple Info */}
            <div class="mt-12 flex flex-col items-center gap-2 text-slate-500 font-medium">
              <p class="text-sm">Ujian: {examData.value?.subject}</p>
              <p class="text-xs">Ujian ID: {examData.value?.id} | Durasi: {examData.value?.duration} Menit</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────
  // Render Active Exam Interface
  // ──────────────────────────────────────────────────────
  return (
    <div class="min-h-screen bg-slate-50 mesh-gradient text-slate-800 select-none flex flex-col pt-8 sm:pt-12" onContextMenu$={(e) => e.preventDefault()}>
      
      {/* Cheat Warning Overlay */}
      {showWarning.value && (
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-red-500/10 backdrop-blur-sm animate-fade-in">
          <div class="bg-white border-2 border-red-500 rounded-2xl p-8 max-w-md text-center animate-shake shadow-2xl shadow-red-500/20">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-4xl">
              <span class="material-symbols-outlined">warning</span>
            </div>
            <p class="text-red-600 font-black text-2xl mb-2">Pelanggaran Terdeteksi!</p>
            <p class="text-slate-600 font-medium text-lg">{warningMessage.value}</p>
          </div>
        </div>
      )}

      {/* Top Fixed Bar */}
      <div class="fixed top-0 left-0 right-0 glass border-b border-slate-200 px-6 py-4 flex items-center justify-between z-50">
        <div class="flex items-center gap-4">
          <div class="bg-blue-100 text-blue-600 p-2.5 rounded-xl hidden sm:flex">
            <span class="material-symbols-outlined">menu_book</span>
          </div>
          <div>
            <h1 class="text-base sm:text-lg font-bold text-slate-900 truncate max-w-[150px] sm:max-w-sm">
              {attempt.value?.exam?.title}
            </h1>
            <div class="flex gap-2 mt-1">
              {!cameraEnabled.value && (
                <span class="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-md font-bold uppercase tracking-wider">
                  Kamera OFF
                </span>
              )}
              {cheatCount.value > 0 && (
                <span class="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded-md font-bold uppercase tracking-wider">
                  {cheatCount.value} Pelanggaran
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Timer Focus */}
        <div class={`flex items-center gap-3 px-6 py-2.5 rounded-xl font-mono text-xl font-black tracking-widest shadow-sm border ${
          timeLeft.value <= 300
            ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
            : 'bg-white text-slate-800 border-slate-200'
        }`}>
          <span class="material-symbols-outlined">timer</span>
          {formatTime(timeLeft.value)}
        </div>

        <div class="items-center gap-3 hidden sm:flex">
          <div class="text-right">
            <p class="text-sm font-bold text-slate-900">{user.value?.fullName}</p>
            <p class="text-xs text-slate-500">{user.value?.kelas}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar under Top Bar */}
      <div class="fixed top-[73px] sm:top-[81px] left-0 right-0 h-1.5 bg-slate-200 z-40">
        <div
          class="h-full bg-blue-500 transition-all duration-300 rounded-r-full"
          style={`width: ${((currentQuestion.value + 1) / questions.value.length) * 100}%`}
        />
      </div>

      {/* Main Content Area */}
      <div class="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-32 overflow-y-auto mt-12">
        <div class="glass rounded-3xl p-8 sm:p-12 shadow-xl border border-white/60 relative overflow-hidden animate-fade-in" key={currentQuestion.value}>
          {/* Decorative Corner */}
          <div class="absolute -top-12 -right-12 text-blue-50 opacity-50 select-none pointer-events-none">
            <span class="material-symbols-outlined text-[150px]">help_outline</span>
          </div>

          <div class="relative z-10">
            {/* Question Header */}
            <div class="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 mb-8 w-fit shadow-inner">
              <span class="text-blue-600 font-bold uppercase tracking-widest text-xs">Soal No</span>
              <span class="bg-blue-600 text-white rounded-md px-2 py-0.5 font-bold text-sm">
                {currentQuestion.value + 1}
              </span>
              <span class="text-slate-400 font-medium text-sm">dari {questions.value.length}</span>
            </div>

            {/* Question Text */}
            <h2 class="text-2xl sm:text-3xl font-medium text-slate-900 mb-10 leading-relaxed max-w-4xl">
              {questions.value[currentQuestion.value]?.text}
            </h2>

            {/* Options */}
            <div class="space-y-4">
              {questions.value[currentQuestion.value]?.options?.map((option: any, idx: number) => {
                const isSelected = answers.value[questions.value[currentQuestion.value]?.id] === option.id;
                const letters = ["A", "B", "C", "D", "E"];

                return (
                  <button
                    key={option.id}
                    onClick$={() => saveAnswer(questions.value[currentQuestion.value].id, option.id)}
                    class={`w-full p-5 sm:p-6 rounded-2xl text-left transition-all duration-200 flex items-start sm:items-center gap-4 sm:gap-6 group border-2 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-lg shadow-blue-500/10 scale-[1.01]'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span class={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold transition-all shadow-sm ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-blue-500/30'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 border border-slate-200'
                    }`}>
                      {letters[idx]}
                    </span>
                    <span class="pt-1.5 sm:pt-0 font-medium text-base sm:text-lg leading-snug break-words">
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer Fixed at Bottom */}
      <div class="fixed bottom-0 left-0 right-0 glass border-t border-slate-200 px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4 z-50 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.05)]">
        
        {/* Nav buttons Layout */}
        <div class="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          <div class="flex items-center gap-2 mr-2 border-r border-slate-200 pr-4">
            {questions.value.map((_: any, idx: number) => {
              const answered = !!answers.value[questions.value[idx]?.id];
              return (
                <button
                  key={idx}
                  onClick$={() => { currentQuestion.value = idx; }}
                  class={`w-10 h-10 rounded-xl text-sm font-bold transition-all flex items-center justify-center border-2 shrink-0 ${
                    idx === currentQuestion.value
                      ? 'bg-blue-600 text-white border-blue-600 scale-110 shadow-lg shadow-blue-500/30'
                      : answered
                        ? 'bg-white text-emerald-600 border-emerald-500'
                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div class="flex gap-4 w-full sm:w-auto shrink-0 mt-2 sm:mt-0 justify-between sm:justify-end">
          {currentQuestion.value > 0 ? (
            <button
              onClick$={() => { currentQuestion.value--; }}
              class="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined">arrow_back</span>
              <span class="hidden sm:inline">Sebelumnya</span>
            </button>
          ) : (
            <div class="w-[140px] hidden sm:block"></div>
          )}

          {currentQuestion.value === questions.value.length - 1 ? (
            <button
              onClick$={submitExam}
              disabled={submitting.value}
              class="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-wider transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 hover:-translate-y-1"
            >
              {submitting.value ? "Mengirim..." : "Selesai & Kirim"}
              <span class="material-symbols-outlined">send</span>
            </button>
          ) : (
            <button
              onClick$={() => { currentQuestion.value++; }}
              class="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 hover:-translate-y-1"
            >
              <span class="hidden sm:inline">Selanjutnya</span>
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Ujian Aktif — Examinator",
};
