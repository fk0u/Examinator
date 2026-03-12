import { component$, useSignal, $, useVisibleTask$, useComputed$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";
import { useCamera } from "~/hooks/use-camera";

export default component$(() => {
  const dummyAttempt = useSignal({ id: null });
  const { cameraEnabled, micEnabled, audioLevel, stream, requestPermission, isRequesting, error: cameraError } = useCamera(dummyAttempt);
  const videoRef = useSignal<HTMLVideoElement>();
  
  // Advanced Diagnostics State
  const logs = useSignal<string[]>(["Sistem siap untuk pengecekan."]);
  const addLog = $((msg: string) => {
    const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
    logs.value = [`[${time}] ${msg}`, ...logs.value.slice(0, 9)];
  });

  const isOnline = useSignal(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const latency = useSignal<number | null>(null);
  const osInfo = useSignal("Detecting...");
  const browserInfo = useSignal("Detecting...");
  const devices = useSignal<{ cameras: string[], mics: string[] }>({ cameras: [], mics: [] });
  const hasCheckedDevices = useSignal(false);
  const testSoundPlaying = useSignal(false);

  // 1. Detect OS and Browser
  useVisibleTask$(() => {
    const ua = navigator.userAgent;
    let os = "Terdeteksi (Unknown)";
    if (ua.indexOf("Win") !== -1) os = "Windows";
    if (ua.indexOf("Mac") !== -1) os = "macOS";
    if (ua.indexOf("Linux") !== -1) os = "Linux";
    if (ua.indexOf("Android") !== -1) os = "Android";
    if (ua.indexOf("like Mac") !== -1) os = "iOS";
    osInfo.value = os;

    let browser = "Lainnya";
    if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
    if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
    if (ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1) browser = "Safari";
    if (ua.indexOf("Edge") !== -1) browser = "Edge";
    browserInfo.value = browser;
  });

  // 2. Measure Latency (Ping)
  useVisibleTask$(() => {
    const measurePing = async () => {
      const start = Date.now();
      try {
        await fetch("/favicon.ico", { cache: 'no-store', mode: 'no-cors' });
        latency.value = Date.now() - start;
      } catch (e) {
        console.error("Ping failed:", e);
      }
    };
    
    measurePing();
    const interval = setInterval(measurePing, 5000);
    return () => clearInterval(interval);
  });

  // 3. Enumerate Hardware
  useVisibleTask$(async ({ track }) => {
    track(() => cameraEnabled.value);
    track(() => micEnabled.value);
    
    if (cameraEnabled.value || micEnabled.value) {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        devices.value = {
          cameras: deviceList.filter(d => d.kind === 'videoinput').map(d => d.label || "Kamera Tanpa Nama"),
          mics: deviceList.filter(d => d.kind === 'audioinput').map(d => d.label || "Mikrofon Tanpa Nama")
        };
        hasCheckedDevices.value = true;
        addLog(`Perangkat ditemukan: ${devices.value.cameras.length} Kamera, ${devices.value.mics.length} Mic.`);
      } catch (e) {
        console.error("Failed to list devices:", e);
      }
    }
  });

  const handleStartDiagnostics = $(async () => {
    addLog("Meminta izin akses kamera & mikrofon...");
    const success = await requestPermission();
    if (success) {
      addLog("Akses media diberikan.");
    } else {
      addLog(`GAGAL: ${cameraError.value || 'Izin ditolak atau hardware sibuk'}`);
    }
  });

  useVisibleTask$(({ track }) => {
    const s = track(() => stream.value);
    if (s && videoRef.value) {
      addLog("Menghubungkan aliran video ke layar...");
      videoRef.value.srcObject = s;
      videoRef.value.play().catch(e => {
        addLog(`Error playback: ${e.message}`);
        console.error("Video play error:", e);
      });
    }
  });

  const playTestSound = $(() => {
    testSoundPlaying.value = true;
    addLog("Memulai tes suara...");
    const audio = new Audio("https://www.soundjay.com/buttons/beep-01a.mp3");
    audio.play();
    audio.onended = () => {
      testSoundPlaying.value = false;
      addLog("Tes suara selesai.");
    };
  });

  const latencyColor = useComputed$(() => {
    if (latency.value === null) return "text-slate-400";
    if (latency.value < 100) return "text-emerald-500";
    if (latency.value < 300) return "text-yellow-500";
    return "text-red-500";
  });

  return (
    <div class="font-['Public_Sans',sans-serif] min-h-screen bg-[#f8fafd] text-slate-900 pb-20">
      {/* ═══ iOS 27 Inspired Top Navigation ═══ */}
      <header class="sticky top-0 z-50 px-4 sm:px-6 py-3 sm:py-4 bg-white/70 backdrop-blur-xl border-b border-white/40 mb-6 sm:mb-8">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-5">
            <div class="size-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 rotate-3">
              <span class="material-symbols-outlined text-2xl font-bold">rocket_launch</span>
            </div>
            <div>
              <h1 class="text-xl font-bold text-slate-900 leading-tight">Examinator</h1>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 italic">Device Calibration v3.0</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <Link href="/student/" class="size-11 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center transition-all hover:bg-slate-200 active:scale-95">
               <span class="material-symbols-outlined font-bold text-xl">close</span>
            </Link>
          </div>
        </div>
      </header>

      <main class="flex-1 max-w-6xl mx-auto w-full p-6 space-y-8 pb-20">
        <div class="text-center space-y-4 animate-fade-in-up">
          <h2 class="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tighter mb-2 italic">Advanced <span class="text-blue-600">Diagnostics</span></h2>
          <p class="text-slate-500 font-semibold text-sm sm:text-lg max-w-2xl mx-auto px-4">Pemeriksaan integritas hardware dan optimasi jaringan untuk pengalaman ujian yang tanpa kendala.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-8 animate-fade-in-left">
            <div class="glass-darker rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-xl flex flex-col space-y-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 class="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span class="material-symbols-outlined text-blue-600">videocam</span>
                  Pratinjau Hardware
                </h3>
                <div class="flex gap-2">
                   <div class={`px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-widest ${cameraEnabled.value ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      Cam: {cameraEnabled.value ? 'OK' : 'FAIL'}
                   </div>
                   <div class={`px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-widest ${micEnabled.value ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      Mic: {micEnabled.value ? 'OK' : 'FAIL'}
                   </div>
                </div>
              </div>
              
              <div class="relative aspect-video bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl">
                {stream.value ? (
                  <video autoplay playsInline muted ref={videoRef} class="w-full h-full object-cover scale-x-[-1]" />
                ) : (
                  <div class="w-full h-full flex flex-col items-center justify-center text-slate-300 relative group">
                    <div class="absolute inset-0 bg-slate-800/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-4">
                       <div class="size-20 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                         <span class="material-symbols-outlined text-4xl text-blue-500">lock_open</span>
                       </div>
                       <div class="text-center">
                         <p class="text-sm font-bold uppercase tracking-widest text-white">Izin Diperlukan</p>
                         <p class="text-xs text-slate-400 mt-1 max-w-[200px]">Klik tombol di bawah untuk meminta izin kamera & mikrofon</p>
                       </div>
                       <button 
                         onClick$={handleStartDiagnostics}
                         disabled={isRequesting.value}
                         class="px-8 py-3 bg-yellow-400 text-slate-900 font-bold rounded-xl hover:bg-yellow-500 transition-all shadow-xl shadow-yellow-500/20 active:scale-95 z-20 border-b-4 border-yellow-600"
                       >
                         {isRequesting.value ? 'Meminta Izin...' : 'Beri Izin Sekarang'}
                       </button>
                    </div>
                    <span class="material-symbols-outlined text-6xl mb-4 opacity-20">videocam_off</span>
                  </div>
                )}
                {cameraEnabled.value && (
                  <div class="absolute top-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                     <div class="size-2 bg-red-500 rounded-full animate-pulse"></div>
                     <span class="text-[10px] text-white font-bold tracking-widest">PROCTOR_FEED</span>
                  </div>
                )}
              </div>

              <div class="grid sm:grid-cols-2 gap-6 pt-4">
                 <div class="space-y-4">
                    <div class="flex items-center justify-between">
                       <p class="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Daftar Kamera</p>
                       <span class="text-[10px] font-bold text-slate-500">{devices.value.cameras.length} ditemukan</span>
                    </div>
                    <div class="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                       {devices.value.cameras.map((name, i) => (
                         <div key={i} class="p-3 bg-white/40 rounded-xl text-xs font-medium border border-white/50 truncate flex items-center gap-2">
                           <span class="material-symbols-outlined text-base text-blue-500">check_circle</span>
                           {name}
                         </div>
                       ))}
                       {devices.value.cameras.length === 0 && <div class="p-3 bg-slate-100/50 rounded-xl text-xs italic text-slate-400">Tidak ada kamera terdeteksi</div>}
                    </div>
                 </div>
                 <div class="space-y-4">
                    <div class="flex items-center justify-between">
                       <p class="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Daftar Mikrofon</p>
                       <span class="text-[10px] font-bold text-slate-500">{devices.value.mics.length} ditemukan</span>
                    </div>
                    <div class="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                       {devices.value.mics.map((name, i) => (
                         <div key={i} class="p-3 bg-white/40 rounded-xl text-xs font-medium border border-white/50 truncate flex items-center gap-2">
                           <span class="material-symbols-outlined text-base text-emerald-500">check_circle</span>
                           {name}
                         </div>
                       ))}
                       {devices.value.mics.length === 0 && <div class="p-3 bg-slate-100/50 rounded-xl text-xs italic text-slate-400">Tidak ada mikrofon terdeteksi</div>}
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div class="space-y-8 animate-fade-in-right">
            <div class="glass-darker rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-xl space-y-6">
               <h3 class="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <span class="material-symbols-outlined text-blue-600">terminal</span>
                 Informasi Sistem
               </h3>
               <div class="space-y-4">
                 <div class="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/50">
                    <div class="flex items-center gap-3">
                       <span class="material-symbols-outlined text-slate-500">desktop_windows</span>
                       <p class="text-sm font-bold text-slate-600">OS</p>
                    </div>
                    <p class="text-sm font-bold text-slate-900">{osInfo.value}</p>
                 </div>
                 <div class="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/50">
                    <div class="flex items-center gap-3">
                       <span class="material-symbols-outlined text-slate-500">language</span>
                       <p class="text-sm font-bold text-slate-600">Browser</p>
                    </div>
                    <p class="text-sm font-bold text-slate-900">{browserInfo.value}</p>
                 </div>
               </div>
            </div>

            <div class="glass-darker rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-xl space-y-6 border-l-4 border-blue-500">
              <h3 class="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span class="material-symbols-outlined text-blue-600">list_alt</span>
                Log Aktivitas
              </h3>
              <div class="bg-slate-900/90 rounded-2xl p-4 font-mono text-[11px] space-y-2 min-h-[160px] max-h-[160px] overflow-y-auto border border-yellow-400/20 custom-scrollbar shadow-inner">
                 {logs.value.map((log, i) => (
                   <div key={i} class={`${i === 0 ? 'text-yellow-400' : 'text-slate-400'} ${i === 0 ? 'animate-pulse font-bold' : ''}`}>
                     {log}
                   </div>
                 ))}
              </div>
            </div>

            <button 
              onClick$={playTestSound}
              disabled={testSoundPlaying.value}
              class="w-full py-4 rounded-2xl font-bold bg-blue-600 text-yellow-400 shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 border-b-4 border-blue-800"
            >
              <span class="material-symbols-outlined">volume_up</span>
              Tes Audio Sistem
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
           {[
             { label: 'Webcam', value: cameraEnabled.value ? 'Support' : 'Fail', color: cameraEnabled.value ? 'emerald' : 'red' },
             { label: 'Mic', value: micEnabled.value ? 'Support' : 'Fail', color: micEnabled.value ? 'emerald' : 'red' },
             { label: 'Latency', value: latency.value !== null ? `${latency.value}ms` : '---', color: 'blue' },
             { label: 'Status', value: isOnline.value ? 'Online' : 'Offline', color: isOnline.value ? 'emerald' : 'red' }
           ].map((stat, i) => (
             <div key={i} class={`glass-darker p-5 rounded-3xl text-center border-b-4 border-${stat.color}-500 shadow-sm`}>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p class={`text-lg font-bold text-${stat.color}-600`}>{stat.value}</p>
             </div>
           ))}
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 px-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
           <Link href="/student/" class="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-blue-600 text-yellow-400 font-bold rounded-xl sm:rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 border-b-4 border-blue-800">
              <span class="material-symbols-outlined">home</span>
              Dashboard Utama
           </Link>
           <button 
             onClick$={() => window.location.reload()}
             class="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 glass-darker text-slate-700 font-bold rounded-xl sm:rounded-2xl border-2 border-slate-200 hover:border-yellow-400 hover:text-slate-900 transition-all flex items-center justify-center gap-2 active:scale-95"
           >
              <span class="material-symbols-outlined">refresh</span>
              Ulangi Diagnostik
           </button>
        </div>
      </main>

      <footer class="py-12 text-center text-slate-400 text-xs font-medium border-t border-slate-200/50 mt-10">
        Examinator CBT — Advanced Diagnostics Engine v2.1.0
      </footer>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Advanced Diagnostic — Examinator",
};
