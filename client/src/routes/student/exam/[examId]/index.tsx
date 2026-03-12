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
  
  const { cameraEnabled, micEnabled, capturePhoto, stream } = useCamera(attempt);
  const videoPreviewRef = useSignal<HTMLVideoElement>();
  
  const isOnline = useSignal(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const isFullscreen = useSignal(false);
  
  const isReady = useSignal(false);
  const termsAccepted = useSignal(false);
  
  const loading = useSignal(false);
  const submitting = useSignal(false);
  const cheatCount = useSignal(0);
  const showWarning = useSignal(false);
  const warningMessage = useSignal("");
  const doubtfulAnswers = useSignal<Record<string, boolean>>({});
  const filterType = useSignal<"ALL" | "ANSWERED" | "UNANSWERED" | "DOUBTFUL">("ALL");

  // Bind camera stream to the Readiness Room preview video
  useVisibleTask$(({ track }) => {
    track(() => stream.value);
    if (stream.value && videoPreviewRef.value) {
      videoPreviewRef.value.srcObject = stream.value;
    }
  });

  // System Checks (Online & Fullscreen)
  useVisibleTask$(() => {
    const updateOnlineStatus = () => isOnline.value = navigator.onLine;
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const updateFullscreenStatus = () => isFullscreen.value = !!document.fullscreenElement;
    document.addEventListener('fullscreenchange', updateFullscreenStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      document.removeEventListener('fullscreenchange', updateFullscreenStatus);
    };
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
      timeLeft.value = typeof data.remainingSeconds === "number"
        ? data.remainingSeconds
        : data.attempt.exam?.duration * 60; // Convert to seconds

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

  if (!isReady.value) {
    if (!examData.value) {
      return (
        <div class="min-h-screen bg-[#f8fafd] flex flex-col items-center justify-center font-['Public_Sans',sans-serif]">
          <div class="relative">
            <div class="size-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <div class="absolute inset-0 flex items-center justify-center">
               <span class="material-symbols-outlined text-blue-600 animate-pulse">rocket_launch</span>
            </div>
          </div>
          <p class="mt-6 text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Singkronisasi Data...</p>
        </div>
      );
    }
    return (
      <div class="font-['Public_Sans',sans-serif] min-h-screen bg-[#f8fafd] text-slate-900 select-none flex flex-col">
        {/* iOS 27 Inspired Top Navigation Bar */}
        <header class="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white/70 backdrop-blur-xl border-b border-white/40 sticky top-0 z-50">
          <div class="flex items-center gap-4">
            <div class="size-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 rotate-3">
              <span class="material-symbols-outlined text-2xl font-bold">rocket_launch</span>
            </div>
            <div>
              <h2 class="text-slate-900 text-lg font-bold leading-tight tracking-tight">Examinator</h2>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ready Room v3.0</p>
            </div>
          </div>
          <div class="flex gap-3">
            <Link href="/student/" class="size-11 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center transition-all hover:bg-slate-200 active:scale-95">
              <span class="material-symbols-outlined font-bold text-xl">close</span>
            </Link>
          </div>
        </header>

        <main class="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-7xl mx-auto w-full">
          {/* Header Info */}
          <div class="w-full text-center mb-8 sm:mb-10 animate-fade-in-up">
            <h2 class="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tighter mb-2 italic">Siap untuk <span class="text-blue-600">Ujian?</span></h2>
          <p class="text-slate-500 font-semibold text-sm sm:text-lg max-w-2xl mx-auto px-4">Pastikan koneksi stabil dan lingkungan tenang sebelum memulai sesi.</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full animate-fade-in" style={{ animationDelay: "100ms" }}>
            {/* Left: Device Visualization */}
            <div class="lg:col-span-7 flex flex-col gap-6">
              <div class="bg-white rounded-[3rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                <div class="flex items-center justify-between mb-6">
                   <h3 class="text-xl font-bold text-slate-900 flex items-center gap-3">
                      <span class="material-symbols-outlined text-blue-600 font-bold">videocam</span>
                      Live Monitoring
                   </h3>
                   <div class="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100">
                      <div class="size-2 rounded-full bg-red-600 animate-pulse"></div>
                      <span class="text-[10px] font-bold uppercase tracking-widest">Encrypted Stream</span>
                   </div>
                </div>

                <div class="relative aspect-video bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden group shadow-inner">
                  {stream.value ? (
                    <video autoplay playsInline ref={videoPreviewRef} class="w-full h-full object-cover scale-x-[-1] opacity-90" />
                  ) : (
                    <div class="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950">
                      <span class="material-symbols-outlined text-4xl sm:text-6xl mb-4 opacity-20">videocam_off</span>
                      <p class="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-widest text-center px-4">Kamera sedang dimuat...</p>
                    </div>
                  )}
                  <div class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div class="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white">
                      <p class="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Preview Perangkat</p>
                      <p class="text-base sm:text-lg font-bold tracking-tight">{user.value?.fullName || 'Siswa'}</p>
                  </div>
                </div>

                <div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                   {[
                     { label: 'Camera', ok: cameraEnabled.value, icon: 'photo_camera' },
                     { label: 'Microphone', ok: micEnabled.value, icon: 'mic' },
                     { label: 'Network', ok: isOnline.value, icon: 'wifi' },
                     { label: 'Secure Mode', ok: isFullscreen.value, icon: 'rocket' }
                   ].map((sys, i) => (
                     <div key={i} class="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-3">
                        <div class={`size-10 rounded-2xl flex items-center justify-center ${sys.ok ? 'bg-emerald-100 text-emerald-600 shadow-emerald-500/10' : 'bg-red-50 text-red-400 opacity-50'}`}>
                           <span class="material-symbols-outlined font-bold text-xl">{sys.icon}</span>
                        </div>
                        <p class={`text-[9px] font-bold uppercase tracking-widest ${sys.ok ? 'text-emerald-600' : 'text-slate-400'}`}>
                           {sys.ok ? 'Ready' : 'Wait'}
                        </p>
                     </div>
                   ))}
                </div>
              </div>
            </div>

            {/* Right: Rules & Commitment */}
            <div class="lg:col-span-5 flex flex-col gap-6">
              <div class="bg-blue-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-500/30 flex flex-col h-full overflow-hidden relative group">
                <div class="absolute -top-12 -right-12 text-white/10 group-hover:rotate-12 transition-transform duration-700">
                   <span class="material-symbols-outlined text-[180px]">privacy_tip</span>
                </div>

                <h3 class="text-2xl font-bold mb-8 relative z-10">Pakta Integritas</h3>
                <ul class="space-y-6 flex-1 relative z-10">
                  {[
                    { icon: 'block', text: 'Dilarang keras keluar dari tab ujian atau membuka aplikasi lain.' },
                    { icon: 'camera_front', text: 'Kamera wajib standby dan merekam aktivitas selama ujian.' },
                    { icon: 'groups_3', text: 'Kerjakan secara mandiri tanpa bantuan pihak manapun.' },
                    { icon: 'timer', text: 'Ujian akan tersimpan otomatis saat waktu habis.' }
                  ].map((rule, i) => (
                    <li key={i} class="flex gap-4 items-start">
                       <span class="material-symbols-outlined text-blue-300 font-bold mt-0.5">{rule.icon}</span>
                       <p class="text-sm font-bold text-blue-50 leading-relaxed">{rule.text}</p>
                    </li>
                  ))}
                </ul>

                <div class="mt-10 pt-8 border-t border-white/10 relative z-10">
                  <div class="flex items-start gap-3 mb-8 bg-black/10 p-5 rounded-3xl border border-white/5 shadow-inner">
                    <input 
                      id="terms" 
                      type="checkbox" 
                      checked={termsAccepted.value}
                      onChange$={(e: any) => termsAccepted.value = e.target.checked}
                      class="mt-1 size-6 rounded-[0.5rem] border-white/20 bg-blue-700 text-yellow-400 focus:ring-yellow-400 cursor-pointer" 
                    />
                    <label for="terms" class="text-xs font-bold text-blue-50 leading-relaxed cursor-pointer select-none">
                      Saya bersedia menjaga kejujuran dan siap menerima konsekuensi pembatalan nilai jika melanggar pakta integritas.
                    </label>
                  </div>

                  <button 
                    onClick$={startActualExam}
                    disabled={!termsAccepted.value || loading.value}
                    class={`w-full h-16 rounded-[1.75rem] font-bold text-lg shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 border-b-4 ${
                      termsAccepted.value && !loading.value
                        ? "bg-yellow-400 text-slate-900 border-yellow-600 hover:bg-yellow-500 shadow-yellow-400/25"
                        : "bg-blue-700 text-blue-400 border-blue-800 opacity-50 grayscale"
                    }`}
                  >
                    {loading.value ? (
                      <div class="flex items-center gap-3">
                         <div class="size-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                         <span>Singkronisasi...</span>
                      </div>
                    ) : (
                      <>
                        <span>Mulai Ujian Sekarang</span>
                        <span class="material-symbols-outlined font-bold">bolt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-12 text-center animate-fade-in-up" style={{ animationDelay: "200ms" }}>
             <p class="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] mb-4">Exam Particulars</p>
             <div class="flex flex-wrap justify-center gap-4">
                <div class="px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm text-xs font-bold text-slate-700">SUBJ: {examData.value?.title}</div>
                <div class="px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm text-xs font-bold text-slate-700">DUR: {examData.value?.duration} MIN</div>
                <div class="px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm text-xs font-bold text-slate-700">UID: {examId}</div>
             </div>
          </div>
        </main>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────
  // Render Active Exam Interface (iOS 27 Inspired)
  // ──────────────────────────────────────────────────────
  const currentQ = questions.value[currentQuestion.value];

  return (
    <div class="font-['Public_Sans',sans-serif] min-h-screen bg-[#f8fafd] text-slate-900 font-sans select-none flex flex-col h-screen overflow-hidden">
      {/* Anti-cheat Overlay */}
      {showWarning.value && (
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-red-500/10 backdrop-blur-md animate-fade-in">
           <div class="bg-white border-2 border-red-500 rounded-[3rem] p-10 max-w-md text-center animate-shake shadow-[0_20px_70px_rgba(239,68,68,0.3)]">
              <div class="size-20 mx-auto mb-6 rounded-[1.5rem] bg-red-100 flex items-center justify-center text-red-600 shadow-inner">
                <span class="material-symbols-outlined text-5xl font-bold">warning</span>
              </div>
              <p class="text-red-600 font-bold text-3xl mb-3 tracking-tighter uppercase italic">PELANGGARAN!</p>
              <p class="text-slate-600 font-bold text-lg">{warningMessage.value}</p>
           </div>
        </div>
      )}

      {/* Modern Top Header */}
      <header class="h-16 sm:h-20 shrink-0 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-4 sm:px-8 flex items-center justify-between z-50">
        <div class="flex items-center gap-5">
           <div class="size-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 rotate-3">
              <span class="material-symbols-outlined font-bold text-2xl">rocket_launch</span>
           </div>
           <div class="hidden sm:block">
              <h2 class="text-slate-900 text-lg font-bold leading-none">{attempt.value?.exam?.title}</h2>
              <div class="flex items-center gap-3 mt-1.5">
                 <div class="px-5 py-2.5 bg-blue-600 text-yellow-400 font-bold rounded-2xl flex items-center gap-3 shadow-xl shadow-blue-500/20 border-b-4 border-blue-800 animate-pulse">
                    <span class="material-symbols-outlined text-2xl font-bold">timer</span>
                    <span class="text-2xl font-bold tracking-tighter tabular-nums">{formatTime(timeLeft.value)}</span>
                 </div>
                 {cheatCount.value > 0 && (
                    <div class="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 rounded-lg border border-red-100">
                       <span class="material-symbols-outlined text-[10px] font-bold">report</span>
                       <span class="text-[9px] font-bold uppercase tracking-widest">{cheatCount.value} Pelanggaran</span>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Dynamic iOS-style Timer Widget */}
        <div class={`flex items-center gap-3 sm:gap-6 px-4 sm:px-10 py-1.5 sm:py-2.5 rounded-2xl sm:rounded-[2rem] border-2 shadow-inner transition-all duration-300 ${
          timeLeft.value < 300 
            ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
            : 'bg-slate-100 border-slate-200/50 text-slate-800'
        }`}>
           <div class="flex flex-col items-center">
              <span class="text-sm sm:text-2xl font-bold tabular-nums leading-none">
                 {Math.floor(timeLeft.value / 3600).toString().padStart(2, '0')}
              </span>
           </div>
           <span class="text-sm sm:text-2xl font-bold opacity-20">:</span>
           <div class="flex flex-col items-center">
              <span class="text-sm sm:text-2xl font-bold tabular-nums leading-none">
                 {Math.floor((timeLeft.value % 3600) / 60).toString().padStart(2, '0')}
              </span>
           </div>
           <span class="text-sm sm:text-2xl font-bold opacity-20">:</span>
           <div class="flex flex-col items-center">
              <span class={`text-sm sm:text-2xl font-bold tabular-nums leading-none ${timeLeft.value < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                 {(timeLeft.value % 60).toString().padStart(2, '0')}
              </span>
           </div>
        </div>

        <div class="flex items-center gap-4">
           <button 
             onClick$={submitExam}
             class="h-12 px-8 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-xl shadow-red-500/20 active:scale-95 border-b-4 border-red-800 transition-all uppercase tracking-widest text-xs hidden sm:flex items-center justify-center gap-2"
           >
             Finish
             <span class="material-symbols-outlined font-bold text-sm">logout</span>
           </button>
           <div class="size-10 bg-slate-100 rounded-full border-2 border-blue-600 flex items-center justify-center text-blue-600 overflow-hidden font-bold">
              <img src={`https://ui-avatars.com/api/?name=${user.value?.fullName || 'User'}&background=3b82f6&color=fff&bold=true`} class="size-full object-cover" />
           </div>
        </div>
      </header>

      <main class="flex-1 flex overflow-hidden">
        {/* Sidebar Question Navigator */}
        <aside class="w-80 border-r border-slate-200/50 bg-white flex flex-col shrink-0 hidden lg:flex">
           <div class="p-8 border-b border-slate-100">
              <h3 class="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                 <span class="material-symbols-outlined text-blue-600 font-bold">grid_view</span>
                 Navigator
              </h3>
              
              <div class="space-y-4">
                 <div class="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    <span>Progres Jawaban</span>
                    <span>{Math.round((Object.keys(answers.value).length / (questions.value.length || 1)) * 100)}%</span>
                 </div>
                 <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50 shadow-inner">
                    <div 
                      class="h-full bg-blue-600 rounded-full transition-all duration-700 shadow-lg shadow-blue-500/30"
                      style={{ width: `${(Object.keys(answers.value).length / (questions.value.length || 1)) * 100}%` }}
                    />
                 </div>
              </div>
           </div>

           <div class="p-8 overflow-y-auto flex-1 custom-scrollbar-hidden bg-slate-50/30">
              <div class="grid grid-cols-4 gap-3">
                 {questions.value.map((q, i) => {
                    const isAnswered = !!answers.value[q.id];
                    const isDoubtful = doubtfulAnswers.value[q.id];
                    const isActive = currentQuestion.value === i;
                    
                    let statusClass = "bg-white border-slate-100 text-slate-400";
                    if (isAnswered) statusClass = "bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-600/20";
                    if (isDoubtful) statusClass = "bg-yellow-400 border-yellow-500 text-slate-900 shadow-lg shadow-yellow-400/20";
                    
                    return (
                       <button
                         key={q.id}
                         onClick$={() => currentQuestion.value = i}
                         class={`aspect-square rounded-2xl flex items-center justify-center text-sm font-bold border-2 transition-all active:scale-90 ${statusClass} ${isActive ? 'scale-110 ring-4 ring-blue-500/10 !border-slate-800' : ''}`}
                       >
                          {i + 1}
                       </button>
                    );
                 })}
              </div>
           </div>

           <div class="p-8 border-t border-slate-100 space-y-3">
              <div class="flex items-center gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                 <div class="size-4 bg-blue-600 rounded-md"></div>
                 Sudah Dijawab
              </div>
              <div class="flex items-center gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                 <div class="size-4 bg-yellow-400 rounded-md"></div>
                 Ragu-ragu
              </div>
              <div class="flex items-center gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                 <div class="size-4 bg-white border border-slate-200 rounded-md"></div>
                 Belum Diisi
              </div>
           </div>
        </aside>

        {/* Content Question Area */}
        <section class="flex-1 overflow-y-auto p-6 sm:p-10 lg:p-16 custom-scrollbar-hidden bg-white/40 shadow-inner">
           <div class="max-w-4xl mx-auto space-y-8 sm:space-y-12">
              <div class="flex items-center justify-between">
                 <div class="px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl border border-blue-100 inline-flex items-center gap-3 sm:gap-4 font-bold text-[10px] sm:text-[12px] uppercase tracking-[0.2em] shadow-sm">
                    <span>Soal</span>
                    <span class="size-6 sm:size-7 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">{currentQuestion.value + 1}</span>
                    <span class="text-slate-400">/ {questions.value.length}</span>
                 </div>
                 
                 <button 
                   onClick$={() => doubtfulAnswers.value = { ...doubtfulAnswers.value, [currentQ.id]: !doubtfulAnswers.value[currentQ.id] }}
                   class={`flex items-center gap-3 px-6 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border-2 ${
                     doubtfulAnswers.value[currentQ.id]
                       ? 'bg-yellow-400 border-yellow-500 text-slate-900 shadow-xl shadow-yellow-400/20 scale-105'
                       : 'bg-white border-slate-100 text-slate-400 hover:text-yellow-600 hover:border-yellow-200 hover:bg-yellow-50'
                   }`}
                 >
                    <span class="material-symbols-outlined text-lg">{doubtfulAnswers.value[currentQ.id] ? 'bookmark_added' : 'bookmark'}</span>
                    <span>Ragu-ragu</span>
                 </button>
              </div>

              <div class="space-y-6">
                 <h1 class="text-3xl lg:text-4xl font-bold leading-snug text-slate-900 tracking-tight italic">
                    {currentQ?.text}
                 </h1>
              </div>

              <div class="grid grid-cols-1 gap-5">
                 {currentQ?.options?.map((option: any, idx: number) => {
                    const label = String.fromCharCode(65 + idx);
                    const isSelected = answers.value[currentQ.id] === option.id;
                    
                    return (
                       <button
                         key={option.id}
                         onClick$={() => saveAnswer(currentQ.id, option.id)}
                         class={`w-full p-6 rounded-[2.5rem] border-2 text-left transition-all duration-300 group flex items-start sm:items-center gap-8 ${
                           isSelected
                             ? 'bg-blue-600 border-blue-700 text-white shadow-2xl shadow-blue-500/30 scale-[1.02] -rotate-1'
                             : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50 hover:border-slate-200 shadow-md shadow-slate-200/50'
                         }`}
                       >
                          <div class={`size-14 rounded-[1.25rem] flex items-center justify-center font-bold text-2xl shrink-0 transition-all ${
                            isSelected ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'
                          }`}>
                             {label}
                          </div>
                          <span class={`text-xl font-bold leading-tight pt-1 sm:pt-0 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                             {option.text}
                          </span>
                          {isSelected && (
                             <div class="ml-auto text-white animate-pulse">
                                <span class="material-symbols-outlined text-4xl font-bold">check_circle</span>
                             </div>
                          )}
                       </button>
                    );
                 })}
              </div>

               <div class="pt-10 sm:pt-16 pb-32 sm:pb-20 flex flex-col sm:flex-row items-center gap-4 border-t border-slate-200/50">
                  <button 
                    disabled={currentQuestion.value === 0}
                    onClick$={() => currentQuestion.value > 0 && currentQuestion.value--}
                    class="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 rounded-xl sm:rounded-[1.75rem] border-2 border-slate-100 font-bold text-slate-500 flex items-center justify-center gap-3 transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-20 order-2 sm:order-1"
                  >
                     <span class="material-symbols-outlined font-bold">arrow_back</span>
                     <span>Kembali</span>
                  </button>
                  
                  <div class="flex gap-4 w-full sm:w-auto order-1 sm:order-2">
                     {currentQuestion.value === questions.value.length - 1 ? (
                        <button 
                          onClick$={submitExam}
                          disabled={submitting.value}
                          class="w-full sm:w-auto h-14 sm:h-16 px-10 sm:px-12 rounded-xl sm:rounded-[1.75rem] bg-emerald-500 text-white font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 hover:bg-emerald-600 border-b-4 border-emerald-800 uppercase tracking-[0.1em] sm:tracking-[0.2em] text-sm sm:text-base"
                        >
                           {submitting.value ? 'Singkron...' : 'Submit Ujian'}
                           <span class="material-symbols-outlined font-bold text-sm sm:text-base">send</span>
                        </button>
                     ) : (
                        <button 
                          onClick$={() => currentQuestion.value++}
                          class="w-full sm:w-auto h-14 sm:h-16 px-10 sm:px-12 rounded-xl sm:rounded-[1.75rem] bg-blue-600 text-white font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/20 active:scale-95 hover:bg-blue-700 border-b-4 border-blue-800 text-sm sm:text-base"
                        >
                           <span>Selanjutnya</span>
                           <span class="material-symbols-outlined font-bold">arrow_forward</span>
                        </button>
                     )}
                  </div>
               </div>
           </div>
        </section>
      </main>

      {/* Floating Webcam Monitoring Hub */}
      <div class="fixed bottom-24 sm:bottom-32 -right-4 hover:right-4 sm:hover:right-6 transition-all duration-500 z-50 group">
         <div class="w-32 h-44 sm:w-48 sm:h-64 bg-slate-900 border-2 sm:border-4 border-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden relative ring-4 sm:ring-8 ring-blue-600/5 rotate-[-2deg] group-hover:rotate-0 transition-transform">
            <div class="absolute top-3 left-3 sm:top-5 sm:left-5 z-10 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
               <div class="size-1.5 sm:size-2 bg-red-600 rounded-full animate-pulse"></div>
               <span class="text-[7px] sm:text-[9px] text-white font-bold uppercase tracking-widest">Live</span>
            </div>
            
            <div class="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-1000">
               {stream.value ? (
                 <video autoplay playsInline muted ref={videoPreviewRef} class="w-full h-full object-cover scale-x-[-1] opacity-70 group-hover:opacity-100" />
               ) : (
                 <div class="w-full h-full flex items-center justify-center bg-slate-800">
                    <span class="material-symbols-outlined text-slate-600 text-2xl sm:text-3xl">videocam_off</span>
                 </div>
               )}
            </div>
            <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-blue-900/40 to-transparent"></div>
         </div>
      </div>

      {/* ═══ iOS 27 Inspired Floating Bottom Navigation (Mobile Only) ═══ */}
      <div class="md:hidden fixed bottom-10 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-sm bg-white/70 backdrop-blur-3xl border border-white/40 rounded-[3rem] px-5 py-4 shadow-[0_30px_90px_rgba(0,0,0,0.15)] flex items-center justify-between z-50 animate-fade-in-up ring-1 ring-black/5">
        <button 
          onClick$={() => currentQuestion.value > 0 && currentQuestion.value--}
          disabled={currentQuestion.value === 0}
          class="flex flex-col items-center gap-1.5 group disabled:opacity-20 transition-opacity"
        >
           <div class="size-11 rounded-2xl flex items-center justify-center text-slate-400 group-active:bg-slate-100 transition-all">
              <span class="material-symbols-outlined font-bold text-2xl">chevron_left</span>
           </div>
           <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prev</span>
        </button>

        <div class="relative flex flex-col items-center group">
           <div class="size-16 -mt-10 bg-blue-600 text-white rounded-[1.75rem] flex flex-col items-center justify-center shadow-2xl shadow-blue-500/40 ring-[6px] ring-white transition-all scale-110">
              <span class="text-[9px] font-bold uppercase tracking-tighter opacity-70 leading-none">Soal</span>
              <span class="text-2xl font-bold">{currentQuestion.value + 1}</span>
           </div>
           <span class="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Active</span>
        </div>

        <button 
          onClick$={() => {
            if (currentQuestion.value < questions.value.length - 1) {
              currentQuestion.value++;
            }
          }}
          disabled={currentQuestion.value === questions.value.length - 1}
          class="flex flex-col items-center gap-1.5 group disabled:opacity-20 transition-opacity"
        >
           <div class="size-11 rounded-2xl flex items-center justify-center text-slate-400 group-active:bg-slate-100 transition-all">
              <span class="material-symbols-outlined font-bold text-2xl">chevron_right</span>
           </div>
           <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next</span>
        </button>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Ujian Aktif — Examinator",
};
