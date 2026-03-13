import { component$, useSignal, $, useVisibleTask$, useComputed$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";
import { useCamera } from "~/hooks/use-camera";
import { AntiCheatWarning } from "~/components/ui/anti-cheat-warning";

// Data contoh untuk simulasi
const MOCK_QUESTIONS = [
  { id: "q1", text: "Apa kepanjangan dari CBT dalam konteks ujian?", options: ["Computer Based Test", "Common Basic Training", "Central Business Tool", "Creative Binary Type"], correct: 0 },
  { id: "q2", text: "Manakah yang merupakan fitur anti-cheating di platform ini?", options: ["Kamera proctoring", "Deteksi pindah tab", "Mode Fullscreen wajib", "Semua benar"], correct: 3 },
  { id: "q3", text: "Apa yang terjadi jika Anda keluar dari mode fullscreen saat ujian?", options: ["Ujian otomatis selesai", "Mendapat peringatan pelanggaran", "Nilai langsung nol", "Tidak terjadi apa-apa"], correct: 1 },
  { id: "q4", text: "Berapa lama waktu ideal untuk mengecek perangkat sebelum ujian?", options: ["1 menit", "5-10 menit", "1 jam", "Tidak perlu cek"], correct: 1 },
  { id: "q5", text: "Siapa yang dapat melihat hasil rekaman kamera saat ujian?", options: ["Siswa lain", "Orang tua", "Pengawas/Proktor", "Publik"], correct: 2 },
];

export default component$(() => {
  const isStarted = useSignal(false);
  const isFinished = useSignal(false);
  const currentQuestionIndex = useSignal(0);
  const answers = useSignal<Record<string, number>>({});
  const timeLeft = useSignal(300); // 5 menit
  const cheatCount = useSignal(0);
  const showWarning = useSignal(false);
  const warningMessage = useSignal("");
  const prepError = useSignal("");
  
  const dummyAttempt = useSignal({ id: null });
  const { cameraEnabled, micEnabled, audioLevel, capturePhoto, stream, requestPermission, isRequesting, error: cameraError } = useCamera(dummyAttempt);
  const videoRef = useSignal<HTMLVideoElement>();
  
  const isFullscreen = useSignal(false);
  const isOnline = useSignal(true);
  const doubtfulAnswers = useSignal<Record<string, boolean>>({});
  const agreedToTerms = useSignal(false);

  const prepChecks = useComputed$(() => {
    const cameraOk = cameraEnabled.value;
    const micOk = micEnabled.value;
    const networkOk = isOnline.value;
    const audioOk = audioLevel.value > 8;
    const termsOk = agreedToTerms.value;
    const passed = [cameraOk, micOk, networkOk, audioOk, termsOk].filter(Boolean).length;

    return {
      cameraOk,
      micOk,
      networkOk,
      audioOk,
      termsOk,
      passed,
      total: 5,
      isReady: passed === 5,
    };
  });

  // ─── Verifikasi & pelacakan ───
  useVisibleTask$(async () => {
    try {
      await requestPermission();
      prepError.value = "";
    } catch {
      prepError.value = "Izin perangkat belum diberikan. Aktifkan kamera dan mikrofon untuk simulasi.";
    }
  });

  useVisibleTask$(({ track }) => {
    track(() => stream.value);
    if (stream.value && videoRef.value) {
      videoRef.value.srcObject = stream.value;
    }
  });

  useVisibleTask$(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && isStarted.value && !isFinished.value) {
        cheatCount.value++;
        showWarning.value = true;
        warningMessage.value = "Terdeteksi meninggalkan halaman ujian! Aktivitas ini telah dicatat.";
        capturePhoto("TAB_SWITCH", "Meninggalkan tab ujian dalam mode simulasi");
        setTimeout(() => showWarning.value = false, 3000);
      }
    };

    const handleFullscreen = () => {
      isFullscreen.value = !!document.fullscreenElement;
      if (!document.fullscreenElement && isStarted.value && !isFinished.value) {
        cheatCount.value++;
        showWarning.value = true;
        warningMessage.value = "Mode Fullscreen dinonaktifkan! Harap tetap dalam mode layar penuh.";
        capturePhoto("FULLSCREEN_EXIT", "Keluar dari mode layar penuh dalam simulasi");
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', handleFullscreen);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', handleFullscreen);
    };
  });

  useVisibleTask$(({ track }) => {
    const started = track(() => isStarted.value);
    const finished = track(() => isFinished.value);

    let timer: any;
    if (started && !finished) {
      timer = setInterval(() => {
        if (timeLeft.value > 0) timeLeft.value--;
        else isFinished.value = true;
      }, 1000);
    }
    return () => clearInterval(timer);
  });

  // ─── Aksi ───
  const startSimulation = $(() => {
    if (!prepChecks.value.isReady) {
      showWarning.value = true;
      warningMessage.value = "Lengkapi checklist kesiapan sebelum memulai simulasi.";
      setTimeout(() => showWarning.value = false, 2200);
      return;
    }
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.error(e));
    }
    isStarted.value = true;
  });

  const nextQuestion = $(() => {
    if (currentQuestionIndex.value < MOCK_QUESTIONS.length - 1) {
      currentQuestionIndex.value++;
    } else {
      isFinished.value = true;
      if (document.fullscreenElement) document.exitFullscreen();
    }
  });

  const score = useComputed$(() => {
    let correctCount = 0;
    MOCK_QUESTIONS.forEach((q, idx) => {
      if (answers.value[q.id] === q.correct) correctCount++;
    });
    return Math.round((correctCount / MOCK_QUESTIONS.length) * 100);
  });

  // ──────────────────────────────────────────────────────
  // 1. Kondisi hasil
  // ──────────────────────────────────────────────────────
  if (isFinished.value) {
    return (
      <div class="min-h-screen bg-[#f8fafd] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div class="absolute inset-0 bg-gradient-mesh opacity-30"></div>
        
        <div class="bg-white border border-white/40 shadow-2xl rounded-[3rem] p-12 max-w-2xl w-full text-center space-y-8 animate-scale-up relative z-10">
          <div class="size-24 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl rotate-3">
            <span class="material-symbols-outlined text-5xl font-bold">verified</span>
          </div>
          
          <div class="space-y-2">
            <h2 class="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tighter mb-2 italic">Simulasi <span class="text-blue-600">Selesai</span></h2>
          <p class="text-slate-500 font-semibold text-sm sm:text-lg max-w-2xl mx-auto px-4">Ini adalah ruang simulasi. Semua fitur bekerja persis seperti ujian asli.</p>
          </div>
          
          <div class="grid grid-cols-2 gap-6">
            <div class="bg-blue-50/50 border border-blue-100 p-8 rounded-[2rem] shadow-inner">
              <p class="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Skor Akhir</p>
              <p class="text-5xl font-bold text-blue-600">{score.value}<span class="text-xl ml-1">%</span></p>
            </div>
            <div class="bg-red-50/30 border border-red-100 p-8 rounded-[2rem] shadow-inner">
              <p class="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">Pelanggaran</p>
              <p class={`text-5xl font-bold ${cheatCount.value === 0 ? 'text-emerald-500' : 'text-red-600'}`}>{cheatCount.value}</p>
            </div>
          </div>

          <div class="bg-slate-50 rounded-2xl p-4 text-xs text-slate-500 font-medium flex items-center gap-3 justify-center">
            <span class="material-symbols-outlined text-blue-600">info</span>
            Hasil ini hanya simulasi dan tidak tercatat di database akademik.
          </div>

          <div class="flex flex-col sm:flex-row gap-4 pt-4">
             <button 
               onClick$={() => window.location.reload()} 
               class="flex-1 py-5 bg-yellow-400 text-slate-900 font-bold rounded-2xl hover:bg-yellow-500 transition-all shadow-xl shadow-yellow-500/20 border-b-4 border-yellow-600 active:scale-95"
             >
               Ulangi Simulasi
             </button>
             <Link 
               href="/student/" 
               class="flex-1 py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 border-b-4 border-blue-800 active:scale-95 flex items-center justify-center gap-2"
             >
               Ke Beranda
               <span class="material-symbols-outlined font-bold">home</span>
             </Link>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────
  // 2. Ruang persiapan (sebelum mulai)
  // ──────────────────────────────────────────────────────
  if (!isStarted.value) {
    return (
      <div class="min-h-screen bg-[#f8fafd] text-slate-900 font-sans flex flex-col">
        {/* Bilah navigasi atas */}
        <header class="flex items-center justify-between border-b border-slate-200 px-4 sm:px-10 py-3 sm:py-4 bg-white/50 backdrop-blur-md sticky top-0 z-50">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center size-10 bg-blue-600 rounded-xl text-white">
              <span class="material-symbols-outlined">assignment_turned_in</span>
            </div>
            <h2 class="text-slate-900 text-xl font-bold leading-tight tracking-tight">Examinator</h2>
          </div>
          <div class="flex gap-3">
            <button class="flex items-center justify-center rounded-xl h-10 w-10 bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200">
              <span class="material-symbols-outlined">settings</span>
            </button>
            <Link href="/student/" class="flex items-center justify-center rounded-xl h-10 w-10 bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200">
              <span class="material-symbols-outlined">close</span>
            </Link>
          </div>
        </header>

        <main class="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-7xl mx-auto w-full">
          {/* Hero Section */}
          <div class="w-full text-center mb-10">
            <h1 class="text-slate-900 text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-2">Persiapan Sebelum Ujian</h1>
            <p class="text-slate-600 text-base sm:text-lg">Pastikan semua sistem berfungsi dengan baik sebelum memulai ujian.</p>
          </div>

          {/* Tata letak utama */}
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
            {/* Kiri: Pratinjau kamera & cek sistem */}
            <div class="lg:col-span-7 flex flex-col gap-6">
              <div class="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-sm">
                <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span class="material-symbols-outlined text-blue-600">videocam</span>
                  Pratinjau Kamera
                </h3>
                <div class="relative aspect-video bg-slate-200 rounded-2xl overflow-hidden group border border-slate-100">
                  {stream.value ? (
                    <video autoplay playsInline ref={videoRef} class="w-full h-full object-cover scale-x-[-1]" />
                  ) : (
                    <div class="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                      <span class="material-symbols-outlined text-6xl">videocam_off</span>
                    </div>
                  )}
                  <div class="absolute inset-0 border-2 border-blue-600/30 rounded-2xl pointer-events-none"></div>
                  <div class="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs flex items-center gap-2">
                    <span class={`size-2 rounded-full ${cameraEnabled.value ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {cameraEnabled.value ? 'Pratinjau Langsung' : 'Kamera Nonaktif'}
                  </div>
                </div>
                <p class="mt-4 text-sm text-slate-500 italic">Pastikan wajah terlihat jelas dan berada di tengah frame.</p>
              </div>

              <div class="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-sm border-l-4 border-l-yellow-500">
                <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span class="material-symbols-outlined text-blue-600">analytics</span>
                  Panel Pemeriksaan Sistem
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Kamera Aktif', ok: cameraEnabled.value, icon: 'videocam' },
                    { label: 'Mikrofon Aktif', ok: micEnabled.value, icon: 'mic' },
                    { label: 'Koneksi Stabil', ok: isOnline.value, icon: 'wifi' },
                    { label: 'Audio Input Terdeteksi', ok: audioLevel.value > 8, icon: 'graphic_eq' }
                  ].map((sys, i) => (
                    <div key={i} class="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-slate-100">
                      <div class="flex items-center gap-3">
                        <span class={`material-symbols-outlined ${sys.ok ? 'text-emerald-500' : 'text-red-400'}`}>
                          {sys.ok ? 'check_circle' : 'cancel'}
                        </span>
                        <span class="font-bold text-slate-700 text-sm">{sys.label}</span>
                      </div>
                      <span class={`text-[10px] font-bold uppercase tracking-widest ${sys.ok ? 'text-emerald-500' : 'text-red-400'}`}>
                        {sys.ok ? 'Siap' : 'Belum Siap'}
                      </span>
                    </div>
                  ))}
                </div>
                <div class="mt-5 rounded-2xl border border-slate-100 bg-white/60 p-4">
                  <div class="flex items-center justify-between mb-3">
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Checklist Simulasi</p>
                    <span class={`text-[10px] font-bold px-2 py-1 rounded-full ${prepChecks.value.isReady ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {prepChecks.value.passed}/{prepChecks.value.total}
                    </span>
                  </div>
                  <div class="space-y-1.5 text-xs font-semibold">
                    <div class="flex items-center justify-between"><span>Kamera</span><span class={prepChecks.value.cameraOk ? 'text-emerald-600' : 'text-red-500'}>{prepChecks.value.cameraOk ? 'Lulus' : 'Belum'}</span></div>
                    <div class="flex items-center justify-between"><span>Mikrofon</span><span class={prepChecks.value.micOk ? 'text-emerald-600' : 'text-red-500'}>{prepChecks.value.micOk ? 'Lulus' : 'Belum'}</span></div>
                    <div class="flex items-center justify-between"><span>Jaringan</span><span class={prepChecks.value.networkOk ? 'text-emerald-600' : 'text-red-500'}>{prepChecks.value.networkOk ? 'Lulus' : 'Belum'}</span></div>
                    <div class="flex items-center justify-between"><span>Audio Input</span><span class={prepChecks.value.audioOk ? 'text-emerald-600' : 'text-red-500'}>{prepChecks.value.audioOk ? 'Lulus' : 'Belum'}</span></div>
                    <div class="flex items-center justify-between"><span>Persetujuan</span><span class={prepChecks.value.termsOk ? 'text-emerald-600' : 'text-red-500'}>{prepChecks.value.termsOk ? 'Lulus' : 'Belum'}</span></div>
                  </div>
                </div>
                {prepError.value && (
                  <p class="mt-3 text-xs font-semibold text-red-500">{prepError.value}</p>
                )}
              </div>
            </div>

            {/* Kanan: Aturan & tombol aksi */}
            <div class="lg:col-span-5 flex flex-col gap-6">
              <div class="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-sm h-full flex flex-col">
                <h3 class="text-xl font-bold text-slate-900 mb-6">Tata Tertib & Peraturan</h3>
                <ul class="space-y-6 flex-1">
                  {[
                    { icon: 'tab_unselected', title: 'Dilarang berpindah tab', desc: 'Sistem akan otomatis mendeteksi jika Anda membuka tab atau aplikasi lain.' },
                    { icon: 'videocam', title: 'Kamera akan merekam', desc: 'Aktifitas visual akan direkam selama durasi ujian untuk keperluan integritas.' },
                    { icon: 'person_pin', title: 'Tetap berada di depan layar', desc: 'Anda tidak diperkenankan meninggalkan area pengawasan kamera.' },
                    { icon: 'record_voice_over', title: 'Suara akan dipantau', desc: 'Mohon menjaga ketenangan dan tidak berbicara selama ujian berlangsung.' }
                  ].map((rule, i) => (
                    <li key={i} class="flex gap-4">
                      <div class="flex-shrink-0 size-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                        <span class="material-symbols-outlined text-yellow-600 font-bold">{rule.icon}</span>
                      </div>
                      <div>
                        <h4 class="font-bold text-slate-800 text-sm">{rule.title}</h4>
                        <p class="text-xs text-slate-500 leading-relaxed mt-1">{rule.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div class="mt-8 pt-6 border-t border-slate-100">
                  <div class="flex items-start gap-3 mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <input 
                      type="checkbox" 
                      id="terms"
                      checked={agreedToTerms.value}
                      onChange$={(e, el) => agreedToTerms.value = el.checked}
                      class="mt-1 size-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                    />
                    <label for="terms" class="text-xs text-slate-600 leading-relaxed font-medium cursor-pointer">
                      Saya telah membaca semua aturan dan menyetujui perekaman sistem demi kelancaran ujian.
                    </label>
                  </div>
                  <button 
                    onClick$={startSimulation}
                    disabled={!prepChecks.value.isReady || isRequesting.value}
                    class="w-full flex items-center justify-center gap-2 rounded-2xl h-16 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:grayscale text-white font-bold text-lg transition-all shadow-xl shadow-blue-600/20 border-b-4 border-blue-800 active:scale-[0.98]"
                  >
                    <span>{isRequesting.value ? 'Menyiapkan Perangkat...' : 'Mulai Ujian Simulasi'}</span>
                    <span class="material-symbols-outlined font-bold">arrow_forward</span>
                  </button>
                  <button
                    type="button"
                    onClick$={async () => {
                      await requestPermission();
                    }}
                    class="w-full mt-3 flex items-center justify-center gap-2 rounded-xl h-11 bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:border-blue-200 hover:text-blue-700 transition-all"
                  >
                    Coba Ulang Izin Perangkat
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-12 flex flex-col items-center gap-2 opacity-40">
            <p class="text-xs font-bold uppercase tracking-widest text-slate-500">Mata Pelajaran: Matematika Lanjut - Simulasi</p>
            <p class="text-[10px] font-bold text-slate-400 tracking-tighter">ID SESI: SIM-992-001 | V2.4.0-ADV</p>
          </div>
        </main>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────
  // 3. Kondisi simulasi aktif
  // ──────────────────────────────────────────────────────
  const currentQ = MOCK_QUESTIONS[currentQuestionIndex.value];

  return (
    <div class="min-h-screen bg-[#f8fafc] text-slate-900 font-sans select-none flex flex-col">
      <AntiCheatWarning show={showWarning.value} title="Simulasi: Pelanggaran!" message={warningMessage.value} />

      {/* Bilah navigasi atas tetap */}
      <header class="sticky top-0 z-50 w-full bg-white border-b border-slate-200 px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-2 sm:gap-4">
          <div class="bg-blue-600 p-1.5 rounded-lg text-white">
            <span class="material-symbols-outlined block font-bold text-sm sm:text-base">rocket_launch</span>
          </div>
          <div>
            <h2 class="text-slate-900 text-sm sm:text-lg font-bold leading-tight">Examinator</h2>
            <p class="text-slate-500 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest leading-none">Simulasi</p>
          </div>
          <div class="h-6 sm:h-8 w-[1px] bg-slate-200 mx-1 sm:mx-2"></div>
        </div>
        
        <div class="flex items-center gap-3 sm:gap-8">
          {/* Hitung mundur */}
          <div class="flex items-center gap-2 sm:gap-3 bg-slate-100 px-3 sm:px-6 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-slate-200">
             {(() => {
                const hours = Math.floor(timeLeft.value / 3600);
                const minutes = Math.floor((timeLeft.value % 3600) / 60);
                const seconds = timeLeft.value % 60;
                const isUrgent = timeLeft.value < 60;
                return (
                  <>
                    <div class="flex flex-col items-center">
                      <span class={`text-sm sm:text-xl font-bold tabular-nums leading-none ${isUrgent ? 'text-red-600' : 'text-slate-900'}`}>{hours.toString().padStart(2, '0')}</span>
                    </div>
                    <span class="text-sm sm:text-xl font-bold text-slate-300">:</span>
                    <div class="flex flex-col items-center">
                      <span class={`text-sm sm:text-xl font-bold tabular-nums leading-none ${isUrgent ? 'text-red-600' : 'text-slate-900'}`}>{minutes.toString().padStart(2, '0')}</span>
                    </div>
                    <span class="text-sm sm:text-xl font-bold text-slate-300">:</span>
                    <div class="flex flex-col items-center">
                      <span class={`text-sm sm:text-xl font-bold tabular-nums leading-none ${isUrgent ? 'text-red-600' : 'text-blue-600'}`}>{seconds.toString().padStart(2, '0')}</span>
                    </div>
                  </>
                );
             })()}
          </div>
          
          <button 
            onClick$={() => isFinished.value = true}
            class="flex items-center justify-center rounded-xl sm:rounded-2xl h-10 sm:h-12 px-4 sm:px-6 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-red-500/20 active:scale-95 border-b-2 sm:border-b-4 border-red-800"
          >
            Selesai
          </button>
        </div>
      </header>

      <main class="flex flex-col lg:flex-row h-[calc(100vh-60px)] sm:h-[calc(100vh-73px)] overflow-hidden">
        {/* Panel soal utama */}
        <section class="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 bg-white m-2 sm:m-4 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100 custom-scrollbar-hidden order-2 lg:order-1">
          <div class="max-w-3xl mx-auto">
            <div class="flex items-center justify-between mb-8">
              <span class="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100 uppercase tracking-widest">
                Soal {currentQuestionIndex.value + 1} dari {MOCK_QUESTIONS.length}
              </span>
              <button 
                onClick$={() => doubtfulAnswers.value = { ...doubtfulAnswers.value, [currentQ.id]: !doubtfulAnswers.value[currentQ.id] }}
                class={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all px-4 py-2 rounded-xl border-2 ${doubtfulAnswers.value[currentQ.id] ? 'bg-yellow-400 border-yellow-500 text-slate-900 shadow-lg' : 'text-slate-400 border-slate-100 hover:border-yellow-200 hover:text-yellow-600'}`}
              >
                <span class="material-symbols-outlined text-lg">{doubtfulAnswers.value[currentQ.id] ? 'bookmark_added' : 'bookmark'}</span>
                Ragu-ragu
              </button>
            </div>

            {/* Teks soal */}
            <div class="mb-12">
              <h1 class="text-2xl lg:text-3xl font-bold leading-relaxed text-slate-800">
                {currentQ.text}
              </h1>
            </div>

            {/* Pilihan jawaban */}
            <div class="space-y-4">
              {currentQ.options.map((opt, idx) => {
                const label = String.fromCharCode(65 + idx);
                const isSelected = answers.value[currentQ.id] === idx;
                return (
                  <button 
                    key={idx}
                    onClick$={() => answers.value = { ...answers.value, [currentQ.id]: idx }}
                    class={`w-full flex items-center gap-6 p-5 rounded-3xl border-2 transition-all group text-left ${isSelected ? 'border-blue-600 bg-blue-50/50 shadow-md ring-4 ring-blue-500/10' : 'border-slate-50 bg-slate-50 hover:border-slate-200 hover:bg-white'}`}
                  >
                    <div class={`size-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white border border-slate-200 text-slate-500 group-hover:bg-slate-100'}`}>
                       {label}
                    </div>
                    <span class={`text-lg font-bold flex-1 ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>{opt}</span>
                    {isSelected && (
                      <div class="text-blue-600">
                        <span class="material-symbols-outlined font-bold text-3xl">check_circle</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Kontrol navigasi */}
            <div class="flex items-center justify-between mt-16 pt-8 border-t border-slate-100">
              <button 
                disabled={currentQuestionIndex.value === 0}
                onClick$={() => currentQuestionIndex.value > 0 && currentQuestionIndex.value--}
                class="flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-100 font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-20 active:scale-95"
              >
                <span class="material-symbols-outlined font-bold">arrow_back</span>
                Sebelumnya
              </button>
              <button 
                onClick$={nextQuestion}
                class="flex items-center gap-2 px-10 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 border-b-4 border-blue-800"
              >
                {currentQuestionIndex.value === MOCK_QUESTIONS.length - 1 ? 'Selesai' : 'Berikutnya'}
                <span class="material-symbols-outlined font-bold">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* Sidebar kanan: navigasi soal */}
        <aside class="w-full lg:w-80 bg-[#f8fafc] border-b lg:border-l border-slate-200 flex flex-col order-1 lg:order-2">
          <div class="p-4 sm:p-6 border-b border-slate-200 bg-white">
            <h3 class="font-bold text-slate-900 mb-2 sm:mb-6 flex items-center gap-2 uppercase tracking-tighter">
              <span class="material-symbols-outlined text-blue-600 font-bold">grid_view</span>
              Navigasi Soal
            </h3>
            <div class="hidden sm:flex flex-wrap gap-4">
              <div class="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                <div class="size-3 bg-blue-600 rounded-sm"></div>
                Dijawab
              </div>
              <div class="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                <div class="size-3 bg-yellow-400 rounded-sm"></div>
                Ragu
              </div>
              <div class="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                <div class="size-3 bg-slate-200 rounded-sm"></div>
                Kosong
              </div>
            </div>
          </div>
          
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar-hidden">
            <div class="grid grid-cols-5 sm:grid-cols-5 gap-2 sm:gap-3">
              {MOCK_QUESTIONS.map((q, i) => {
                const isAnswered = answers.value[q.id] !== undefined;
                const isDoubtful = doubtfulAnswers.value[q.id];
                const isActive = currentQuestionIndex.value === i;
                
                let bgColor = "bg-slate-100 text-slate-400";
                if (isAnswered) bgColor = "bg-blue-600 text-white shadow-lg shadow-blue-500/20";
                if (isDoubtful) bgColor = "bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-500/20";
                
                return (
                  <button 
                    key={i}
                    onClick$={() => currentQuestionIndex.value = i}
                    class={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all active:scale-95 border-2 ${isActive ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-transparent'} ${bgColor}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div class="p-8 bg-white border-t border-slate-200">
            <div class="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              <span>Kemajuan</span>
              <span>{Math.round(((Object.keys(answers.value).length) / MOCK_QUESTIONS.length) * 100)}%</span>
            </div>
            <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50 shadow-inner">
              <progress
                value={Math.round((Object.keys(answers.value).length / MOCK_QUESTIONS.length) * 100)}
                max={100}
                class="h-full w-full [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-blue-600 [&::-moz-progress-bar]:bg-blue-600"
              />
            </div>
          </div>
        </aside>
      </main>

      {/* Pemantauan webcam mengambang */}
      <div class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-24 h-32 sm:w-40 sm:h-52 bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-white z-50 group hover:scale-110 transition-all duration-300 ring-4 sm:ring-8 ring-blue-600/10">
        <div class="absolute top-2 left-2 sm:top-4 sm:left-4 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
          <div class="size-1.5 sm:size-2 bg-red-500 rounded-full animate-pulse"></div>
          <span class="text-[7px] sm:text-[9px] text-white font-bold tracking-widest uppercase">Langsung</span>
        </div>
        <div class="w-full h-full bg-slate-800">
           {stream.value ? (
             <video autoplay playsInline muted ref={videoRef} class="w-full h-full object-cover scale-x-[-1] grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
           ) : (
             <div class="w-full h-full flex items-center justify-center">
               <span class="material-symbols-outlined text-slate-600 text-3xl">videocam_off</span>
             </div>
           )}
           <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
         </div>
      </div>
      {/* ═══ Navigasi bawah mengambang (khusus mobile) ═══ */}
      <div class="md:hidden fixed bottom-10 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-sm bg-white/70 backdrop-blur-3xl border border-white/40 rounded-[3rem] px-5 py-4 shadow-[0_30px_90px_rgba(0,0,0,0.15)] flex items-center justify-between z-50 animate-fade-in-up ring-1 ring-black/5">
        <button 
          onClick$={() => currentQuestionIndex.value > 0 && currentQuestionIndex.value--}
          disabled={currentQuestionIndex.value === 0}
          class="flex flex-col items-center gap-1.5 group disabled:opacity-20 transition-opacity"
        >
           <div class="size-11 rounded-2xl flex items-center justify-center text-slate-400 group-active:bg-slate-100 transition-all">
              <span class="material-symbols-outlined font-bold text-2xl">chevron_left</span>
           </div>
           <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sebelumnya</span>
        </button>

        <div class="relative flex flex-col items-center group">
           <div class="size-16 -mt-10 bg-blue-600 text-white rounded-[1.75rem] flex flex-col items-center justify-center shadow-2xl shadow-blue-500/40 ring-[6px] ring-white transition-all scale-110">
              <span class="text-[9px] font-bold uppercase tracking-tighter opacity-70 leading-none">Simulasi</span>
              <span class="text-2xl font-bold">{currentQuestionIndex.value + 1}</span>
           </div>
           <span class="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Aktif</span>
        </div>

        <button 
          onClick$={nextQuestion}
          class="flex flex-col items-center gap-1.5 group transition-opacity"
        >
           <div class="size-11 rounded-2xl flex items-center justify-center text-slate-400 group-active:bg-slate-100 transition-all">
              <span class="material-symbols-outlined font-bold text-2xl">chevron_right</span>
           </div>
           <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Berikutnya</span>
        </button>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Simulasi Ujian — Examinator",
};
