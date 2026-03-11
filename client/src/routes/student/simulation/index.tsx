import { component$, useSignal, $, useVisibleTask$, useComputed$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";
import { useCamera } from "~/hooks/use-camera";

// Mock Data for Simulation
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
  const timeLeft = useSignal(300); // 5 minutes
  const cheatCount = useSignal(0);
  const showWarning = useSignal(false);
  const warningMessage = useSignal("");
  
  const dummyAttempt = useSignal({ id: null });
  const { cameraEnabled, micEnabled, audioLevel, capturePhoto, stream } = useCamera(dummyAttempt);
  const videoRef = useSignal<HTMLVideoElement>();
  
  const isFullscreen = useSignal(false);
  const isOnline = useSignal(true);

  // ─── Verification & Tracking ───
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

  useVisibleTask$(() => {
    let timer: any;
    if (isStarted.value && !isFinished.value) {
      timer = setInterval(() => {
        if (timeLeft.value > 0) timeLeft.value--;
        else isFinished.value = true;
      }, 1000);
    }
    return () => clearInterval(timer);
  });

  // ─── Actions ───
  const startSimulation = $(() => {
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

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const score = useComputed$(() => {
    let correctCount = 0;
    MOCK_QUESTIONS.forEach((q, idx) => {
      if (answers.value[q.id] === q.correct) correctCount++;
    });
    return Math.round((correctCount / MOCK_QUESTIONS.length) * 100);
  });

  // ──────────────────────────────────────────────────────
  // 1. Result State
  // ──────────────────────────────────────────────────────
  if (isFinished.value) {
    return (
      <div class="min-h-screen bg-slate-50 bg-gradient-mesh flex items-center justify-center p-6">
        <div class="glass-darker rounded-[3rem] p-12 max-w-2xl w-full text-center space-y-8 animate-scale-up">
          <div class="size-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
            <span class="material-symbols-outlined text-5xl">task_alt</span>
          </div>
          <div class="space-y-2">
            <h2 class="text-4xl font-black text-slate-900">Simulasi Selesai!</h2>
            <p class="text-slate-500 text-lg">Anda telah berhasil mencoba sistem ujian kami.</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white/50 border border-white p-6 rounded-3xl shadow-sm">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Skor Simulasi</p>
              <p class="text-4xl font-black text-blue-600">{score.value}%</p>
            </div>
            <div class="bg-white/50 border border-white p-6 rounded-3xl shadow-sm">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pelanggaran</p>
              <p class={`text-4xl font-black ${cheatCount.value === 0 ? 'text-emerald-500' : 'text-red-500'}`}>{cheatCount.value}</p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-4">
             <button onClick$={() => window.location.reload()} class="flex-1 py-4 bg-yellow-400 text-slate-900 font-black rounded-2xl hover:bg-yellow-500 transition-all shadow-lg border-b-4 border-yellow-600">
               Coba Lagi
             </button>
             <Link href="/student/" class="flex-1 py-4 bg-blue-600 text-yellow-400 font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg border-b-4 border-blue-800">
               Kembali ke Dashboard
             </Link>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────
  // 2. Readiness Room (Before Start)
  // ──────────────────────────────────────────────────────
  if (!isStarted.value) {
    return (
      <div class="min-h-screen bg-slate-50 bg-gradient-mesh flex flex-col pt-8">
        <nav class="max-w-7xl mx-auto w-full px-6 py-3">
          <div class="glass rounded-2xl px-6 py-2 flex items-center justify-between shadow-sm border-b-2 border-yellow-400/30">
             <div class="flex items-center gap-2">
                <div class="bg-blue-600 text-yellow-400 p-1.5 rounded-lg flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg font-black">science</span>
                </div>
                <h2 class="font-black text-slate-900">Simulasi Ujian</h2>
             </div>
             <Link href="/student/" class="flex items-center justify-center size-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-yellow-400 hover:text-slate-900 transition-all active:scale-95">
                <span class="material-symbols-outlined">close</span>
             </Link>
          </div>
        </nav>

        <main class="flex-1 max-w-6xl mx-auto w-full p-6 grid lg:grid-cols-5 gap-8 items-start">
          <div class="lg:col-span-3 space-y-6 animate-fade-in-left">
            {/* Mock Camera Preview */}
            <div class="glass-darker rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
               <div class="flex items-center justify-between mb-6">
                 <h3 class="text-xl font-black text-slate-900 flex items-center gap-2">
                   <span class="material-symbols-outlined text-blue-600">videocam</span>
                   Pratinjau Kamera Proktor
                 </h3>
                 <div class="flex items-center gap-2">
                    <div class={`size-2 rounded-full ${cameraEnabled.value ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">{cameraEnabled.value ? 'Online' : 'Offline'}</span>
                 </div>
               </div>
               
               <div class="aspect-video bg-black rounded-3xl overflow-hidden shadow-inner border border-white/20 relative">
                 {stream.value ? (
                   <video autoplay playsInline ref={videoRef} class="w-full h-full object-cover scale-x-[-1]" />
                 ) : (
                   <div class="w-full h-full flex items-center justify-center bg-slate-900 group-hover:bg-slate-800 transition-colors">
                      <span class="material-symbols-outlined text-6xl text-slate-700">no_photography</span>
                   </div>
                 )}
               </div>

               {/* Audio Visualizer Mock */}
               <div class="mt-6 space-y-2">
                  <div class="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Input Suara Simulasi</span>
                    <span class={micEnabled.value ? 'text-blue-600' : 'text-slate-400'}>{audioLevel.value}%</span>
                  </div>
                  <div class="h-2 bg-slate-200 rounded-full overflow-hidden border border-white">
                    <div class="h-full bg-blue-600 transition-all duration-75 shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ width: `${audioLevel.value}%` }} />
                  </div>
               </div>
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
               <div class="glass rounded-3xl p-6 border border-white/50 flex items-center gap-4">
                  <div class="size-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                    <span class="material-symbols-outlined">quiz</span>
                  </div>
                  <div>
                    <p class="text-[10px] text-slate-600 font-black uppercase tracking-widest">Jumlah Soal</p>
                    <p class="font-bold text-slate-800">{MOCK_QUESTIONS.length} Pertanyaan</p>
                  </div>
               </div>
               <div class="glass rounded-3xl p-6 border border-white/50 flex items-center gap-4">
                  <div class="size-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                    <span class="material-symbols-outlined">timer</span>
                  </div>
                  <div>
                    <p class="text-[10px] text-slate-600 font-black uppercase tracking-widest">Waktu Estimasi</p>
                    <p class="font-bold text-slate-800">5 Menit</p>
                  </div>
               </div>
            </div>
          </div>

          <div class="lg:col-span-2 space-y-6 animate-fade-in-right">
            <div class="glass-darker rounded-[2.5rem] p-8 shadow-2xl space-y-8">
              <h3 class="text-2xl font-black text-slate-900">Peraturan Simulasi</h3>
              <ul class="space-y-4">
                 {[
                   { icon: 'fullscreen', text: 'Simulasi akan berjalan dalam mode layar penuh.' },
                   { icon: 'tab_unselected', text: 'Meninggalkan tab akan memicu peringatan kecurangan.' },
                   { icon: 'videocam', text: 'Kamera akan tetap ON untuk simulasi proctoring.' },
                   { icon: 'lock', text: 'Skor ini bersifat edukatif dan tidak mempengaruhi nilai rapor.' }
                 ].map((rule, i) => (
                   <li key={i} class="flex items-start gap-3">
                     <span class="material-symbols-outlined text-blue-500 bg-blue-50 p-1.5 rounded-lg text-lg">{rule.icon}</span>
                     <p class="text-slate-600 text-sm leading-relaxed">{rule.text}</p>
                   </li>
                 ))}
              </ul>

              <button 
                onClick$={startSimulation}
                class="w-full py-5 bg-yellow-400 text-slate-900 font-black rounded-3xl shadow-xl shadow-yellow-500/30 hover:bg-yellow-500 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-lg border-b-4 border-yellow-600 mt-4 active:scale-95"
              >
                Mulai Simulasi Sekarang
                <span class="material-symbols-outlined font-black">arrow_forward</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────
  // 3. Active Simulation State
  // ──────────────────────────────────────────────────────
  const currentQ = MOCK_QUESTIONS[currentQuestionIndex.value];

  return (
    <div class="min-h-screen bg-slate-50 bg-gradient-mesh text-slate-800 select-none flex flex-col pt-12">
      {/* Anti-cheat Overlay */}
      {showWarning.value && (
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-red-500/10 backdrop-blur-md animate-fade-in">
           <div class="glass-darker border-2 border-red-500 rounded-[2rem] p-8 max-w-md text-center animate-shake shadow-2xl shadow-red-500/20">
              <div class="size-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <span class="material-symbols-outlined text-4xl">warning</span>
              </div>
              <p class="text-red-600 font-black text-2xl mb-2">Simulasi: Pelanggaran!</p>
              <p class="text-slate-600 font-medium">{warningMessage.value}</p>
           </div>
        </div>
      )}

      <div class="fixed top-0 left-0 right-0 glass-darker border-b-2 border-yellow-400/30 px-6 py-4 flex items-center justify-between z-50">
        <div class="flex items-center gap-3">
           <div class="bg-blue-600 text-yellow-400 p-2 rounded-xl shadow-lg shadow-blue-500/20">
             <span class="material-symbols-outlined font-black">science</span>
           </div>
           <div>
             <h1 class="font-black text-slate-900">SIMULASI UJIAN</h1>
             <p class="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Latihan System Check</p>
           </div>
        </div>

        <div class={`flex items-center gap-3 px-6 py-2.5 rounded-xl font-mono text-xl font-black shadow-sm border-2 ${timeLeft.value < 60 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-white text-blue-600 border-blue-100'}`}>
          <span class="material-symbols-outlined font-black">timer</span>
          {formatTime(timeLeft.value)}
        </div>

        <div class="flex items-center gap-2">
           <div class="text-right hidden sm:block">
              <p class="text-xs font-black text-slate-400 uppercase">Pelanggaran</p>
              <p class="font-black text-red-500">{cheatCount.value}</p>
           </div>
           <div class="size-10 bg-slate-100 rounded-full overflow-hidden border border-slate-200 ml-2">
              <video autoplay playsInline ref={videoRef} class="w-full h-full object-cover scale-x-[-1]" />
           </div>
        </div>
      </div>

      <main class="flex-1 max-w-4xl mx-auto w-full px-6 py-20">
         <div class="glass-darker rounded-[3rem] p-10 shadow-2xl border border-white animate-fade-in" key={currentQ.id}>
            <div class="space-y-8">
               <div class="space-y-4">
                  <span class="px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full font-black text-[10px] uppercase tracking-widest">
                    Pertanyaan {currentQuestionIndex.value + 1} dari {MOCK_QUESTIONS.length}
                  </span>
                  <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                    {currentQ.text}
                  </h2>
               </div>

               <div class="grid gap-3">
                  {currentQ.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick$={() => {
                        const newAnswers = { ...answers.value };
                        newAnswers[currentQ.id] = idx;
                        answers.value = newAnswers;
                      }}
                      class={`w-full p-6 text-left rounded-[1.5rem] border-2 transition-all font-medium flex items-center justify-between group ${
                        answers.value[currentQ.id] === idx 
                          ? 'border-blue-500 bg-blue-50/50 text-blue-800 shadow-md ring-4 ring-blue-500/10' 
                          : 'border-slate-100 bg-slate-50/50 hover:border-slate-300 hover:bg-white text-slate-600'
                      }`}
                    >
                      <span>{opt}</span>
                      <div class={`size-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        answers.value[currentQ.id] === idx ? 'bg-blue-500 border-blue-500' : 'border-slate-200 group-hover:border-slate-300'
                      }`}>
                         {answers.value[currentQ.id] === idx && <span class="material-symbols-outlined text-white text-sm">check</span>}
                      </div>
                    </button>
                  ))}
               </div>
            </div>

            <div class="mt-12 flex justify-between items-center gap-4">
               <div class="h-2.5 flex-1 bg-slate-100 rounded-full overflow-hidden max-w-[200px] border border-white">
                 <div class="h-full bg-blue-600 transition-all duration-500" style={{ width: `${((currentQuestionIndex.value + 1) / MOCK_QUESTIONS.length) * 100}%` }} />
               </div>
               
               <button 
                 onClick$={nextQuestion}
                 disabled={answers.value[currentQ.id] === undefined}
                 class="px-10 py-4 bg-yellow-400 text-slate-900 font-black rounded-2xl hover:bg-yellow-500 transition-all shadow-xl shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border-b-4 border-yellow-600 active:scale-95"
               >
                 {currentQuestionIndex.value === MOCK_QUESTIONS.length - 1 ? 'Selesaikan Simulasi' : 'Selanjutnya'}
                 <span class="material-symbols-outlined font-black">{currentQuestionIndex.value === MOCK_QUESTIONS.length - 1 ? 'done_all' : 'arrow_forward'}</span>
               </button>
            </div>
         </div>
      </main>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Simulasi Ujian — Examinator",
};
