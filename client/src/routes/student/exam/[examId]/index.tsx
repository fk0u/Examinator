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
  
  const { cameraEnabled, micEnabled, capturePhoto, stream, requestPermission } = useCamera(attempt);
  const videoPreviewRef = useSignal<HTMLVideoElement>();
  
  const isOnline = useSignal(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const isFullscreen = useSignal(false);
  
  const isReady = useSignal(false);
  const termsAccepted = useSignal(false);
  const accessToken = useSignal("");
  
  const loading = useSignal(false);
  const submitting = useSignal(false);
  const cheatCount = useSignal(0);
  const showWarning = useSignal(false);
  const warningMessage = useSignal("");
  const doubtfulAnswers = useSignal<Record<string, boolean>>({});
  const maxCheatViolations = useSignal(5);

  // Kaitkan stream kamera ke elemen pratinjau video
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    // eslint-disable-next-line qwik/valid-lexical-scope
    track(() => stream.value);
    // eslint-disable-next-line qwik/valid-lexical-scope
    track(() => videoPreviewRef.value);
    // eslint-disable-next-line qwik/valid-lexical-scope
    if (stream.value && videoPreviewRef.value) {
      // eslint-disable-next-line qwik/valid-lexical-scope
      videoPreviewRef.value.srcObject = stream.value;
    }
  });

  // Pemeriksaan sistem (Online & Layar Penuh)
  // eslint-disable-next-line qwik/no-use-visible-task
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

  // ── Muat informasi ujian untuk ruang persiapan ───────
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    if (!isAuthenticated()) {
      await nav("/");
      return;
    }
    user.value = getUserData();

    requestPermission();

    try {
      const data = await examsApi.get(examId);
      examData.value = data.exam;
      maxCheatViolations.value = data.exam?.maxCheatViolations ?? 5;
    } catch (e: any) {
      console.error("Gagal mengambil data ujian:", e);
      alert("Gagal memuat info ujian.");
      nav("/student/");
    }
  });

  // ── Mulai percobaan ujian ────────────────────────────
  const startActualExam = $(async () => {
    if (!termsAccepted.value) return;
    if (examData.value?.requiresToken && !accessToken.value.trim()) {
      alert("Token ujian wajib diisi.");
      return;
    }
    loading.value = true;
    
    try {
      const data = await attemptsApi.start(examId, cameraEnabled.value, accessToken.value.trim() || undefined);
      attempt.value = data.attempt;
      const examPayload = data.exam || data.attempt?.exam;
      questions.value = examPayload?.questions || [];
      maxCheatViolations.value = examPayload?.maxCheatViolations ?? maxCheatViolations.value;
      timeLeft.value = typeof data.remainingSeconds === "number"
        ? data.remainingSeconds
        : examPayload?.duration * 60; // Ubah ke detik

      // Hubungkan WebSocket
      const ws = getWsClient();
      ws.connect();
      ws.send("student:join", {
        userId: user.value.id,
        fullName: user.value.fullName,
        attemptId: data.attempt.id,
        examId,
        cameraEnabled: cameraEnabled.value,
      });

      // Tangani perintah kirim paksa dari pengawas
      ws.on("force:submit", async () => {
        alert("Sesi ujian dihentikan oleh pengawas. Jawaban Anda telah dikumpulkan.");
        await submitExam();
      });

      // Mulai hitung mundur
      const timer = setInterval(() => {
        timeLeft.value--;
        if (timeLeft.value <= 0) {
          clearInterval(timer);
          submitExam();
        }
      }, 1000);

      // Minta mode layar penuh
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Mode layar penuh mungkin belum tersedia saat itu juga
      }

      isReady.value = true;
      loading.value = false;
    } catch (e: any) {
      console.error("Gagal memulai ujian:", e);
      alert("Gagal memulai ujian: " + e.message);
      loading.value = false;
    }
  });

  // ── Deteksi pelanggaran ──────────────────────────────
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

  // ── Catat kejadian pelanggaran ──────────────────────
  const logCheat = $(async (type: string, description: string) => {
    cheatCount.value++;
    showWarning.value = true;
    warningMessage.value = `⚠️ Peringatan: ${description}. Pelanggaran ke-${cheatCount.value} dari batas ${maxCheatViolations.value}.`;

    setTimeout(() => {
      showWarning.value = false;
    }, 3000);

    try {
      const logResult = await cheatLogsApi.log({
        attemptId: attempt.value.id,
        cheatType: type,
        description,
      });

      if (logResult?.guardrail?.cheatCount) {
        cheatCount.value = Math.max(cheatCount.value, logResult.guardrail.cheatCount);
      }

      const ws = getWsClient();
      ws.send("cheat:detected", {
        cheatType: type,
        description,
        forceSubmitted: Boolean(logResult?.guardrail?.forceSubmitted),
        forceReason: logResult?.guardrail?.reason || null,
      });

      if (logResult?.guardrail?.forceSubmitted) {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
        ws.disconnect();
        alert("Sesi dihentikan otomatis karena batas pelanggaran tercapai. Jawaban Anda telah dikumpulkan.");
        await nav("/student/");
        return;
      }

      capturePhoto(type, description);
    } catch {
      // Abaikan jika gagal, agar ujian tetap berjalan
    }
  });

  // ── Simpan jawaban ──────────────────────────────────
  const saveAnswer = $(async (questionId: string, optionId: string) => {
    answers.value = { ...answers.value, [questionId]: optionId };
    try {
      await attemptsApi.answer(attempt.value.id, { questionId, optionId });
    } catch {
      // Abaikan jika gagal, jawaban lokal tetap tersimpan
    }
  });

  // ── Kirim ujian ─────────────────────────────────────
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
          <p class="mt-6 text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Sinkronisasi Data...</p>
        </div>
      );
    }
    return (
      <div class="font-['Public_Sans',sans-serif] min-h-screen bg-[#f8fafd] text-slate-900 select-none flex flex-col">
        {/* Bilah atas ruang persiapan */}
        <header class="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white/70 backdrop-blur-xl border-b border-white/40 sticky top-0 z-50">
          <div class="flex items-center gap-4">
            <div class="size-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 rotate-3">
              <span class="material-symbols-outlined text-2xl font-bold">rocket_launch</span>
            </div>
            <div>
              <h2 class="text-slate-900 text-lg font-bold leading-tight tracking-tight">Examinator</h2>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ruang Persiapan v3.0</p>
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

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full animate-fade-in [animation-delay:100ms]">
            {/* Kiri: Visualisasi perangkat */}
            <div class="lg:col-span-7 flex flex-col gap-6">
              <div class="bg-white rounded-[3rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                <div class="flex items-center justify-between mb-6">
                   <h3 class="text-xl font-bold text-slate-900 flex items-center gap-3">
                      <span class="material-symbols-outlined text-blue-600 font-bold">videocam</span>
                      Pemantauan Langsung
                   </h3>
                   <div class="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100">
                      <div class="size-2 rounded-full bg-red-600 animate-pulse"></div>
                      <span class="text-[10px] font-bold uppercase tracking-widest">Stream Terenkripsi</span>
                   </div>
                </div>

                <div class="relative aspect-video bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden group shadow-inner">
                  {stream.value ? (
                    <video autoplay playsInline muted ref={videoPreviewRef} class="w-full h-full object-cover scale-x-[-1] opacity-90" />
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
                     { label: 'Kamera', ok: cameraEnabled.value, icon: 'photo_camera' },
                     { label: 'Mikrofon', ok: micEnabled.value, icon: 'mic' },
                     { label: 'Jaringan', ok: isOnline.value, icon: 'wifi' },
                     { label: 'Mode Aman', ok: isFullscreen.value, icon: 'rocket' }
                   ].map((sys, i) => (
                     <div key={i} class="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-3">
                        <div class={`size-10 rounded-2xl flex items-center justify-center ${sys.ok ? 'bg-emerald-100 text-emerald-600 shadow-emerald-500/10' : 'bg-red-50 text-red-400 opacity-50'}`}>
                           <span class="material-symbols-outlined font-bold text-xl">{sys.icon}</span>
                        </div>
                        <p class={`text-[9px] font-bold uppercase tracking-widest ${sys.ok ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {sys.ok ? 'Siap' : 'Tunggu'}
                        </p>
                        <p class="text-[10px] font-bold text-slate-500">{sys.label}</p>
                     </div>
                   ))}
                </div>
              </div>
            </div>

                {/* Kanan: Aturan & komitmen */}
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
                  <li class="flex gap-4 items-start">
                    <span class="material-symbols-outlined text-blue-300 font-bold mt-0.5">gpp_maybe</span>
                    <p class="text-sm font-bold text-blue-50 leading-relaxed">Ujian dihentikan otomatis bila pelanggaran mencapai {maxCheatViolations.value} kali.</p>
                  </li>
                </ul>

                <div class="mt-10 pt-8 border-t border-white/10 relative z-10">
                  {examData.value?.requiresToken && (
                    <div class="mb-5 bg-black/10 p-5 rounded-3xl border border-white/5 shadow-inner">
                      <label for="exam-token" class="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-2">Token Ujian</label>
                      <input
                        id="exam-token"
                        type="text"
                        value={accessToken.value}
                        onInput$={(e: any) => accessToken.value = e.target.value}
                        placeholder="Masukkan token dari pengawas"
                        class="w-full h-12 px-4 rounded-2xl bg-blue-700/50 border border-white/15 text-white placeholder:text-blue-200/70 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-300"
                      />
                      <p class="mt-2 text-[10px] font-semibold text-blue-200/90">Ujian ini diproteksi token. Pastikan token sesuai sebelum memulai.</p>
                    </div>
                  )}

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
                    disabled={
                      !termsAccepted.value
                      || loading.value
                      || Boolean(examData.value?.requiresToken && !accessToken.value.trim())
                    }
                    class={`w-full h-16 rounded-[1.75rem] font-bold text-lg shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 border-b-4 ${
                      termsAccepted.value && !loading.value && (!examData.value?.requiresToken || !!accessToken.value.trim())
                        ? "bg-yellow-400 text-slate-900 border-yellow-600 hover:bg-yellow-500 shadow-yellow-400/25"
                        : "bg-blue-700 text-blue-400 border-blue-800 opacity-50 grayscale"
                    }`}
                  >
                    {loading.value ? (
                      <div class="flex items-center gap-3">
                         <div class="size-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                         <span>Sinkronisasi...</span>
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

          <div class="mt-12 text-center animate-fade-in-up [animation-delay:200ms]">
             <p class="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] mb-4">Informasi Ujian</p>
             <div class="flex flex-wrap justify-center gap-4">
               <div class="px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm text-xs font-bold text-slate-700">Mata Ujian: {examData.value?.title}</div>
               <div class="px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm text-xs font-bold text-slate-700">Durasi: {examData.value?.duration} Menit</div>
               <div class="px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm text-xs font-bold text-slate-700">Proteksi: {examData.value?.requiresToken ? "Token" : "Tanpa Token"}</div>
               <div class="px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm text-xs font-bold text-slate-700">Kode Ujian: {examId}</div>
             </div>
          </div>
        </main>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────
  // Tampilan antarmuka ujian aktif
  // ──────────────────────────────────────────────────────
  const currentQ = questions.value[currentQuestion.value];
  const answeredCount = Object.keys(answers.value).length;
  const completionPercent = Math.round((answeredCount / (questions.value.length || 1)) * 100);
  const hoursLeft = Math.floor(timeLeft.value / 3600).toString().padStart(2, "0");
  const minutesLeft = Math.floor((timeLeft.value % 3600) / 60).toString().padStart(2, "0");
  const secondsLeft = Math.max(timeLeft.value % 60, 0).toString().padStart(2, "0");
  const isLowTime = timeLeft.value <= 300;
  const isCriticalTime = timeLeft.value <= 60;

  return (
    <div class="font-['Public_Sans',sans-serif] min-h-screen bg-slate-100 text-slate-800 flex flex-col h-screen overflow-hidden relative">
      <div class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.10),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.08),_transparent_42%)]" />

      {/* Anti-cheat Overlay */}
      {showWarning.value && (
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-red-950/40 backdrop-blur-sm animate-fade-in px-4">
           <div class="bg-white border border-red-100 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl shadow-red-500/20">
              <div class="size-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                <span class="material-symbols-outlined text-4xl font-bold">warning</span>
              </div>
              <p class="text-red-700 font-extrabold text-2xl mb-2 tracking-tight">Pelanggaran Terdeteksi</p>
              <p class="text-slate-600 font-semibold leading-relaxed">{warningMessage.value}</p>
           </div>
        </div>
      )}

      <header class="shrink-0 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div class="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-8 h-[74px] flex items-center justify-between gap-3">
          <div class="min-w-0 flex items-center gap-3">
             <div class="size-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
                <span class="material-symbols-outlined text-[22px] font-bold">school</span>
             </div>
             <div class="min-w-0">
                <p class="text-[10px] tracking-[0.18em] uppercase font-extrabold text-slate-400">Sesi Ujian</p>
                <h2 class="truncate text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  {attempt.value?.exam?.title}
                </h2>
             </div>
          </div>

          <div class={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-2xl border shadow-inner font-bold tabular-nums ${
            isCriticalTime
              ? "bg-red-50 border-red-200 text-red-600 animate-pulse"
              : isLowTime
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-slate-100 border-slate-200 text-slate-800"
          }`}>
            <span class="material-symbols-outlined text-[16px] sm:text-[18px]">timer</span>
            <span class="text-base sm:text-lg">{hoursLeft}</span>
            <span class="opacity-40">:</span>
            <span class="text-base sm:text-lg">{minutesLeft}</span>
            <span class="opacity-40">:</span>
            <span class={`text-base sm:text-lg ${isCriticalTime ? "text-red-600" : "text-blue-600"}`}>{secondsLeft}</span>
          </div>

          <div class="flex items-center gap-2 sm:gap-3">
            {cheatCount.value > 0 && (
              <div class="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-50 border border-red-100 text-red-600">
                 <span class="material-symbols-outlined text-[14px]">report</span>
                 <span class="text-[11px] font-bold">{cheatCount.value} pelanggaran</span>
              </div>
            )}
            <div class="hidden sm:flex items-center gap-2">
              <img
                src={`https://ui-avatars.com/api/?name=${user.value?.fullName || 'User'}&background=2563eb&color=fff&bold=true`}
                class="size-9 rounded-xl object-cover border border-slate-200"
                alt={`Avatar ${user.value?.fullName || "Siswa"}`}
                width={36}
                height={36}
              />
              <span class="max-w-[140px] truncate text-xs font-bold text-slate-600">{user.value?.fullName || "Siswa"}</span>
            </div>
            <button
              onClick$={submitExam}
              class="h-10 px-3 sm:px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-red-600/20 active:scale-95"
            >
              <span>Selesai</span>
              <span class="material-symbols-outlined text-[17px]">done_all</span>
            </button>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-hidden">
        <div class="h-full max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-8 py-3 sm:py-4 lg:py-5">
          <div class="h-full grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-5">
            <section class="xl:col-span-8 2xl:col-span-9 min-h-0 flex flex-col gap-4">
              <div class="rounded-3xl border border-slate-200/80 bg-white shadow-sm px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="size-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg font-extrabold shadow-md">
                    {currentQuestion.value + 1}
                  </div>
                  <div>
                    <p class="text-[11px] uppercase tracking-[0.14em] font-extrabold text-slate-400">Nomor Soal</p>
                    <p class="text-sm sm:text-base font-bold text-slate-800">Soal {currentQuestion.value + 1} dari {questions.value.length}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 sm:gap-4">
                  <div class="text-right">
                    <p class="text-[11px] uppercase tracking-[0.14em] font-extrabold text-slate-400">Kemajuan</p>
                    <p class="text-sm font-bold text-blue-600">{completionPercent}% selesai</p>
                  </div>
                  <div class="w-28 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <progress
                      value={completionPercent}
                      max={100}
                      class="h-full w-full [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-blue-600 [&::-moz-progress-bar]:bg-blue-600"
                    />
                  </div>
                  <button
                    onClick$={() => doubtfulAnswers.value = { ...doubtfulAnswers.value, [currentQ.id]: !doubtfulAnswers.value[currentQ.id] }}
                    class={`h-10 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                      doubtfulAnswers.value[currentQ.id]
                        ? "bg-amber-100 text-amber-700 border-amber-300"
                        : "bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-700"
                    }`}
                  >
                    {doubtfulAnswers.value[currentQ.id] ? "Sudah Ditandai Ragu" : "Tandai Ragu"}
                  </button>
                </div>
              </div>

              <article class="min-h-0 flex-1 rounded-3xl border border-slate-200/80 bg-white shadow-sm flex flex-col overflow-hidden">
                <div class="px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-4 border-b border-slate-100">
                  <h1 class="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 leading-snug">
                    {currentQ?.text}
                  </h1>
                </div>

                <div class="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 space-y-3 sm:space-y-4 custom-scrollbar">
                  {currentQ?.options?.map((option: any, idx: number) => {
                    const label = String.fromCharCode(65 + idx);
                    const isSelected = answers.value[currentQ.id] === option.id;

                    return (
                      <button
                        key={option.id}
                        onClick$={() => saveAnswer(currentQ.id, option.id)}
                        class={`w-full rounded-2xl border-2 px-4 sm:px-5 py-4 text-left transition-all duration-200 flex items-start sm:items-center gap-4 sm:gap-5 ${
                          isSelected
                            ? "bg-blue-50 border-blue-500 shadow-md shadow-blue-500/10"
                            : "bg-slate-50/50 border-slate-200 hover:border-blue-300 hover:bg-white"
                        }`}
                      >
                        <div class={`size-9 sm:size-11 rounded-xl flex items-center justify-center text-sm sm:text-base font-extrabold shrink-0 ${
                          isSelected ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600"
                        }`}>
                          {label}
                        </div>
                        <span class={`flex-1 text-sm sm:text-base lg:text-lg leading-relaxed font-semibold ${isSelected ? "text-blue-900" : "text-slate-700"}`}>
                          {option.text}
                        </span>
                        {isSelected && (
                          <span class="material-symbols-outlined text-blue-600 text-[22px] sm:text-[26px]">check_circle</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div class="border-t border-slate-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 bg-white/70 backdrop-blur-md">
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <button
                      disabled={currentQuestion.value === 0}
                      onClick$={() => currentQuestion.value > 0 && currentQuestion.value--}
                      class="h-11 px-4 sm:px-5 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold flex items-center gap-2 hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:active:scale-100"
                    >
                      <span class="material-symbols-outlined text-[18px]">arrow_back</span>
                      <span>Sebelumnya</span>
                    </button>

                    {currentQuestion.value === questions.value.length - 1 ? (
                      <button
                        onClick$={submitExam}
                        disabled={submitting.value}
                        class="h-11 px-5 sm:px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-70"
                      >
                        <span>{submitting.value ? "Memproses..." : "Akhiri dan Kumpulkan"}</span>
                        <span class="material-symbols-outlined text-[18px]">send</span>
                      </button>
                    ) : (
                      <button
                        onClick$={() => currentQuestion.value++}
                        class="h-11 px-5 sm:px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
                      >
                        <span>Berikutnya</span>
                        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            </section>

            <aside class="xl:col-span-4 2xl:col-span-3 min-h-0 flex flex-col gap-4">
              <div class="rounded-3xl border border-slate-200/80 bg-white shadow-sm p-4 sm:p-5">
                <h3 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mb-4">Navigasi Soal</h3>
                <div class="grid grid-cols-3 gap-2 text-[11px] font-bold text-slate-500 mb-4">
                  <div class="flex items-center gap-2"><span class="size-3 rounded-sm bg-blue-600" />Dijawab</div>
                  <div class="flex items-center gap-2"><span class="size-3 rounded-sm bg-amber-400" />Ragu</div>
                  <div class="flex items-center gap-2"><span class="size-3 rounded-sm bg-white border border-slate-300" />Kosong</div>
                </div>
                <div class="grid grid-cols-5 sm:grid-cols-6 xl:grid-cols-5 gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                  {questions.value.map((q, i) => {
                    const isAnswered = !!answers.value[q.id];
                    const isDoubtful = doubtfulAnswers.value[q.id];
                    const isActive = currentQuestion.value === i;

                    let statusClass = "bg-white border-slate-200 text-slate-600 hover:border-blue-400";
                    if (isAnswered) statusClass = "bg-blue-600 border-blue-600 text-white";
                    if (isDoubtful) statusClass = "bg-amber-400 border-amber-400 text-slate-900";

                    return (
                      <button
                        key={q.id}
                        onClick$={() => currentQuestion.value = i}
                        class={`aspect-square rounded-xl text-sm font-bold border-2 transition-all active:scale-95 ${statusClass} ${isActive ? "ring-2 ring-offset-2 ring-blue-500 !border-slate-900" : ""}`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div class="rounded-3xl border border-slate-200/80 bg-white shadow-sm p-4 sm:p-5">
                <div class="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/40">
                  <div class="absolute top-2 left-2 z-10 px-2 py-1 rounded-lg bg-black/60 text-white text-[10px] font-bold tracking-widest flex items-center gap-1.5">
                    <span class="size-1.5 rounded-full bg-red-500 animate-pulse" /> LANGSUNG
                  </div>
                  {stream.value ? (
                    <video autoplay playsInline muted ref={videoPreviewRef} class="w-full h-full object-cover scale-x-[-1]" />
                  ) : (
                    <div class="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1.5">
                      <span class="material-symbols-outlined text-3xl">videocam_off</span>
                      <span class="text-xs font-semibold">Kamera belum aktif</span>
                    </div>
                  )}
                </div>
                <div class="mt-4 space-y-3">
                  <div class="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Kemajuan Jawaban</span>
                    <span class="text-blue-600">{completionPercent}%</span>
                  </div>
                  <div class="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <progress
                      value={completionPercent}
                      max={100}
                      class="h-full w-full [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-blue-600 [&::-moz-progress-bar]:bg-blue-600"
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-[11px]">
                    <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p class="text-slate-400 font-bold uppercase">Dijawab</p>
                      <p class="text-slate-800 font-extrabold text-base">{answeredCount}</p>
                    </div>
                    <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p class="text-slate-400 font-bold uppercase">Sisa</p>
                      <p class="text-slate-800 font-extrabold text-base">{Math.max(questions.value.length - answeredCount, 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Ujian Aktif — Examinator",
};
