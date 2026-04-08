<<<<<<< Updated upstream
import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { t, LANG_LABELS, type Lang } from "~/lib/i18n";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import { initTheme } from "~/lib/theme";

const GREETINGS = [
  "Hello", "Halo", "Bonjour", "こんにちは", "Hola", "Ciao",
  "مرحبا", "Привет", "안녕하세요", "Olá", "Merhaba", "Sawubona",
  "Xin chào", "Kamusta", "Habari", "Namaste", "Hej", "Szia",
];

export default component$(() => {
  const showLoader = useSignal(true);
  const loaderPhase = useSignal<"typing" | "done">("typing");
  const displayedText = useSignal("");
  const lang = useSignal<Lang>("id");
  const langOpen = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    initTheme();

    let disposed = false;
    const timeoutIds: number[] = [];
    const intervalIds: number[] = [];
    let observer: IntersectionObserver | null = null;

    const trackedTimeout = (handler: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (!disposed) handler();
      }, ms);
      timeoutIds.push(id);
      return id;
    };

    let gIdx = 0;
    const typeGreeting = (word: string) => {
      return new Promise<void>((resolve) => {
        if (disposed) {
          resolve();
          return;
        }
        let charIdx = 0;
        displayedText.value = "";
        const typeInterval = window.setInterval(() => {
          if (disposed) {
            window.clearInterval(typeInterval);
            resolve();
            return;
          }
          displayedText.value = word.slice(0, charIdx + 1);
          charIdx++;
          if (charIdx >= word.length) {
            window.clearInterval(typeInterval);
            trackedTimeout(resolve, 400);
          }
        }, 60);
        intervalIds.push(typeInterval);
      });
    };

    const eraseGreeting = () => {
      return new Promise<void>((resolve) => {
        if (disposed) {
          resolve();
          return;
        }
        const word = displayedText.value;
        let charIdx = word.length;
        const eraseInterval = window.setInterval(() => {
          if (disposed) {
            window.clearInterval(eraseInterval);
            resolve();
            return;
          }
          charIdx--;
          displayedText.value = word.slice(0, charIdx);
          if (charIdx <= 0) {
            window.clearInterval(eraseInterval);
            trackedTimeout(resolve, 100);
          }
        }, 35);
        intervalIds.push(eraseInterval);
      });
    };

    for (let i = 0; i < 6; i++) {
      if (disposed) break;
      await typeGreeting(GREETINGS[gIdx]);
      if (i < 5) await eraseGreeting();
      gIdx = (gIdx + 1) % GREETINGS.length;
    }

    if (disposed) return;

    loaderPhase.value = "done";
    trackedTimeout(() => { showLoader.value = false; }, 600);

    trackedTimeout(async () => {
      if (disposed) return;
      const { animate, stagger } = await import("motion");
      if (disposed) return;
      animate(".blob-1" as any, { scale: [1, 1.15], rotate: [0, 60], y: [0, -30] }, { duration: 14, repeat: Infinity, direction: "alternate", ease: "easeInOut" } as any);
      animate(".blob-2" as any, { scale: [0.9, 1.1], rotate: [0, -40], x: [0, 40] }, { duration: 18, repeat: Infinity, direction: "alternate", ease: "easeInOut" } as any);
      animate(".blob-3" as any, { scale: [1, 0.85], rotate: [0, 25], y: [0, 25] }, { duration: 20, repeat: Infinity, direction: "alternate", ease: "easeInOut" } as any);
      animate(".fade-up" as any, { opacity: [0, 1], y: [50, 0] }, { duration: 0.8, delay: stagger(0.12), ease: [0.16, 1, 0.3, 1] } as any);
      const sections = document.querySelectorAll(".section-reveal");
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const children = entry.target.querySelectorAll(".reveal-item");
            animate(children as any, { opacity: [0, 1], y: [40, 0] }, { duration: 0.7, delay: stagger(0.1), ease: [0.16, 1, 0.3, 1] } as any);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      sections.forEach((s) => observer.observe(s));
    }, 800);

    return () => {
      disposed = true;
      timeoutIds.forEach((id) => window.clearTimeout(id));
      intervalIds.forEach((id) => window.clearInterval(id));
      observer?.disconnect();
    };
  });

  const L = () => t[lang.value];

  return (
    <div class="font-sans w-full bg-[#fdfdfd] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden selection:bg-blue-500/20 selection:text-blue-700 relative transition-colors duration-300">

      {/* ═══ LOADING SCREEN ═══ */}
      <div class={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 transition-all duration-700 ${showLoader.value ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div class="relative">
          <p class="text-5xl sm:text-7xl md:text-8xl font-[900] text-white tracking-tight min-h-[1.2em] flex items-center">
            <span>{displayedText.value}</span>
            <span class={`inline-block w-[3px] h-[0.8em] bg-blue-400 ml-1 ${loaderPhase.value === "done" ? "opacity-0" : "animate-pulse"}`}></span>
          </p>
        </div>
        <div class="mt-10 flex items-center gap-1.5">
          {[
            { key: 0, delayClass: "[animation-delay:0ms]" },
            { key: 150, delayClass: "[animation-delay:150ms]" },
            { key: 300, delayClass: "[animation-delay:300ms]" },
          ].map((d) => (
            <div key={d.key} class={`w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce ${d.delayClass}`}></div>
          ))}
        </div>
        <p class="mt-6 text-slate-500 text-sm font-medium tracking-wider uppercase">Examinator</p>
      </div>

      {/* ═══ BACKGROUND ═══ */}
      <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden dark:opacity-50">
        <div class="blob-1 absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full opacity-30 mix-blend-multiply dark:mix-blend-screen filter blur-[100px] bg-[radial-gradient(circle,rgba(59,130,246,0.25)_0%,transparent_70%)]"></div>
        <div class="blob-2 absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] rounded-full opacity-25 mix-blend-multiply dark:mix-blend-screen filter blur-[120px] bg-[radial-gradient(circle,rgba(16,185,129,0.2)_0%,transparent_70%)]"></div>
        <div class="blob-3 absolute top-[40%] left-[50%] w-[40vw] h-[40vw] rounded-full opacity-20 mix-blend-multiply dark:mix-blend-screen filter blur-[90px] bg-[radial-gradient(circle,rgba(234,179,8,0.15)_0%,transparent_70%)]"></div>
      </div>

      {/* ═══ NAVIGATION ═══ */}
      <nav class="sticky top-0 z-50 w-full px-5 sm:px-8 md:px-12 py-4 flex items-center fade-up opacity-0 bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        {/* Left: Logo */}
        <div class="flex items-center gap-2.5 flex-1">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <span class="text-white font-[900] text-lg leading-none">E</span>
          </div>
          <span class="text-xl font-[900] tracking-tight text-slate-900 dark:text-white">Examinator</span>
        </div>
        {/* Center: Nav links — truly centered */}
        <div class="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500 dark:text-slate-400 absolute left-1/2 -translate-x-1/2">
          <a href="#features" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{L().nav_features}</a>
          <a href="#tech" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{L().nav_tech}</a>
          <a href="#docs" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{L().nav_docs}</a>
          <a href="#team" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{L().nav_team}</a>
        </div>
        {/* Right: Actions */}
        <div class="flex items-center gap-3 flex-1 justify-end">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Switcher */}
          <div class="relative">
            <button onClick$={() => langOpen.value = !langOpen.value}
              class="h-9 px-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
              <span>{LANG_LABELS[lang.value].slice(0, 4)}</span>
              <span class="material-symbols-outlined text-[14px]">expand_more</span>
            </button>
            {langOpen.value && (
              <div class="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 min-w-[160px] z-50">
                {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
                  <button key={l} onClick$={() => { lang.value = l; langOpen.value = false; }}
                    class={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors ${lang.value === l ? "text-blue-600 bg-blue-50/50 dark:bg-blue-950/30" : "text-slate-700 dark:text-slate-300"}`}>
                    {LANG_LABELS[l]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link href="/login"
            class="group px-5 py-2.5 rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2">
            <span>{L().nav_login}</span>
            <span class="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
          </Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section class="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-12 pt-8 sm:pt-10 md:pt-14 lg:pt-16 pb-16 sm:pb-20 flex flex-col items-center text-center min-h-[80vh] justify-center">
        <div class="fade-up opacity-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 dark:bg-blue-950/50 border border-blue-100/50 dark:border-blue-800/50 mb-6 sm:mb-8 backdrop-blur-sm">
          <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>
          <span class="text-[10px] sm:text-xs font-bold text-blue-700 dark:text-blue-400 tracking-wider uppercase">{L().hero_badge}</span>
        </div>
        <h1 class="fade-up opacity-0 text-[2.5rem] sm:text-[3.5rem] md:text-[5rem] lg:text-[6.5rem] leading-[1.05] font-[900] tracking-tighter text-slate-900 dark:text-white mb-5 sm:mb-6 max-w-5xl">
          {L().hero_title_1} <br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">{L().hero_title_2}</span>
        </h1>
        <p class="fade-up opacity-0 text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed mb-8 sm:mb-10 px-2">{L().hero_desc}</p>
        <div class="fade-up opacity-0 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full justify-center">
          <Link href="/login" class="w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-blue-600 text-white font-[700] text-base sm:text-lg hover:bg-blue-700 transition-all duration-300 shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:-translate-y-1 flex items-center justify-center gap-3 group">
            <span>{L().hero_cta}</span><span class="material-symbols-outlined text-[20px] group-hover:translate-x-1.5 transition-transform">arrow_forward</span>
          </Link>
          <a href="#features" class="w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 font-[600] text-base sm:text-lg hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[20px]">explore</span><span>{L().hero_cta2}</span>
          </a>
        </div>
        <div class="fade-up opacity-0 mt-14 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-3xl">
          {[{ v: "10K+", k: "stat_conn", i: "hub" }, { v: "<1.2s", k: "stat_lcp", i: "speed" }, { v: "99.9%", k: "stat_uptime", i: "verified" }, { v: "3s", k: "stat_snap", i: "photo_camera" }].map((s) => (
            <div key={s.k} class="flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-100 dark:border-slate-700/50">
              <span class="material-symbols-outlined text-blue-500 text-xl sm:text-2xl mb-1">{s.i}</span>
              <span class="text-xl sm:text-2xl font-[900] text-slate-900 dark:text-white">{s.v}</span>
              <span class="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{L()[s.k]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" class="section-reveal relative z-10 w-full bg-white dark:bg-slate-900 py-16 sm:py-24 border-t border-slate-100 dark:border-slate-800">
        <div class="max-w-7xl mx-auto px-5 sm:px-8 md:px-12">
          <div class="reveal-item opacity-0 text-center mb-12 sm:mb-16">
            <span class="inline-block px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">{L().feat_badge}</span>
            <h2 class="text-2xl sm:text-3xl md:text-5xl font-[900] text-slate-900 dark:text-white tracking-tight mb-3 sm:mb-4">{L().feat_title}</h2>
            <p class="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium text-sm sm:text-lg">{L().feat_desc}</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {[
              { icon: "policy", color: "blue", tk: "f1_title", dk: "f1_desc" },
              { icon: "visibility_off", color: "red", tk: "f2_title", dk: "f2_desc" },
              { icon: "photo_camera", color: "emerald", tk: "f3_title", dk: "f3_desc" },
              { icon: "fullscreen_exit", color: "amber", tk: "f4_title", dk: "f4_desc" },
              { icon: "bolt", color: "indigo", tk: "f5_title", dk: "f5_desc" },
              { icon: "cell_tower", color: "teal", tk: "f6_title", dk: "f6_desc" },
            ].map((f) => (
              <div key={f.tk} class="reveal-item opacity-0 group bg-slate-50 dark:bg-slate-800/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div class={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-${f.color}-100 to-${f.color}-50 border border-${f.color}-200 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                  <span class={`material-symbols-outlined text-2xl sm:text-3xl text-${f.color}-600`}>{f.icon}</span>
                </div>
                <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">{L()[f.tk]}</h3>
                <p class="text-slate-600 dark:text-slate-400 leading-relaxed text-xs sm:text-sm">{L()[f.dk]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TECH STACK ═══ (already dark bg, minimal changes) ═══ */}
      <section id="tech" class="section-reveal relative z-10 w-full bg-slate-950 text-white py-16 sm:py-24 overflow-hidden">
        <div class="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 relative z-10">
          <div class="reveal-item opacity-0 text-center mb-12 sm:mb-16">
            <span class="inline-block px-4 py-1.5 rounded-full bg-white/10 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4 border border-white/10">{L().tech_badge}</span>
            <h2 class="text-2xl sm:text-3xl md:text-5xl font-[900] tracking-tight mb-3">{L().tech_title_1} <span class="text-blue-400">{L().tech_title_2}</span></h2>
            <p class="text-slate-400 max-w-2xl mx-auto font-medium text-sm sm:text-lg">{L().tech_desc}</p>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-12 sm:mb-16">
            {[
              { name: "Qwik", role: "Frontend", c: "from-cyan-500 to-blue-600" },
              { name: "Elysia.js", role: "Backend", c: "from-pink-500 to-rose-600" },
              { name: "Bun", role: "Runtime", c: "from-amber-400 to-orange-500" },
              { name: "Prisma", role: "ORM", c: "from-slate-400 to-slate-600" },
              { name: "MySQL", role: "Database", c: "from-blue-500 to-indigo-600" },
            ].map((tc) => (
              <div key={tc.name} class="reveal-item opacity-0 group flex flex-col items-center p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:-translate-y-1 text-center">
                <div class={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${tc.c} flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <span class="text-white font-[900] text-lg sm:text-xl">{tc.name[0]}</span>
                </div>
                <h4 class="text-sm sm:text-base font-bold">{tc.name}</h4>
                <p class="text-[10px] sm:text-xs text-slate-400 mt-1">{tc.role}</p>
              </div>
            ))}
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {[
              { i: "desktop_windows", tk: "layer1_title", dk: "layer1_desc", tags: ["Qwik City", "Tailwind v4", "Motion"] },
              { i: "dns", tk: "layer2_title", dk: "layer2_desc", tags: ["JWT Auth", "REST API", "WebSocket"] },
              { i: "storage", tk: "layer3_title", dk: "layer3_desc", tags: ["Prisma ORM", "MySQL", "ACID"] },
            ].map((ly) => (
              <div key={ly.tk} class="reveal-item opacity-0 p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <span class="material-symbols-outlined text-3xl sm:text-4xl text-blue-400 mb-4 block">{ly.i}</span>
                <h3 class="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{L()[ly.tk]}</h3>
                <p class="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">{L()[ly.dk]}</p>
                <div class="flex flex-wrap gap-2">
                  {ly.tags.map((tg) => <span key={tg} class="px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-[10px] sm:text-xs font-semibold border border-blue-500/20">{tg}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DOCS ═══ */}
      <section id="docs" class="section-reveal relative z-10 w-full bg-slate-900 py-16 sm:py-24 text-white">
        <div class="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div class="reveal-item opacity-0 lg:w-1/2 text-center lg:text-left">
            <span class="inline-block px-4 py-1.5 rounded-full bg-white/10 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 border border-white/10">{L().docs_badge}</span>
            <h2 class="text-2xl sm:text-3xl md:text-5xl font-[900] tracking-tight mb-4 sm:mb-6">{L().docs_title_1} <span class="text-blue-400">{L().docs_title_2}</span></h2>
            <p class="text-slate-300 font-medium text-sm sm:text-lg leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0">{L().docs_desc}</p>
          </div>
          <div class="reveal-item opacity-0 lg:w-1/2 w-full max-w-xl mx-auto lg:mx-0">
            <div class="bg-slate-800/50 backdrop-blur-2xl border border-slate-600/40 p-4 sm:p-6 rounded-2xl shadow-2xl space-y-3">
              {[
                { i: "school", c: "from-blue-500 to-indigo-600", t: "Karya Tulis Ilmiah", s: "Edge-Ready Framework & Bun" },
                { i: "architecture", c: "from-emerald-500 to-teal-600", t: "SRS (IEEE 830-1998)", s: "Software Requirements Spec" },
                { i: "account_tree", c: "from-purple-500 to-violet-600", t: "System Architecture", s: "3-Layer Monorepo" },
                { i: "api", c: "from-pink-500 to-rose-600", t: "API Reference", s: "REST & WebSocket Handlers" },
                { i: "rocket_launch", c: "from-amber-500 to-orange-600", t: "Deployment Guide", s: "NGINX, PM2, Production" },
              ].map((dc) => (
                <div key={dc.t} class="group flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <div class="flex items-center gap-3 sm:gap-4">
                    <div class={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${dc.c} flex items-center justify-center shadow-lg shrink-0`}>
                      <span class="material-symbols-outlined text-white text-lg sm:text-xl">{dc.i}</span>
                    </div>
                    <div class="min-w-0">
                      <h4 class="text-sm sm:text-base font-bold group-hover:text-blue-300 transition-colors truncate">{dc.t}</h4>
                      <p class="text-[10px] sm:text-xs text-slate-400 truncate">{dc.s}</p>
                    </div>
                  </div>
                  <span class="material-symbols-outlined text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0">chevron_right</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TEAM ═══ */}
      <section id="team" class="section-reveal relative z-10 w-full bg-slate-50 dark:bg-slate-900 py-16 sm:py-24 border-t border-slate-200/60 dark:border-slate-800">
        <div class="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 text-center">
          <div class="reveal-item opacity-0 mb-12 sm:mb-16">
            <span class="inline-block px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">{L().team_badge}</span>
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-[900] text-slate-900 dark:text-white tracking-tight mb-3">{L().team_title}</h2>
            <p class="text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium text-sm sm:text-base">{L().team_desc}</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8 max-w-5xl mx-auto">
            {[
              { n: "Al-Ghani Desta Setyawan", rk: "dev1_role", dk: "dev1_desc", i: "engineering", c: "blue" },
              { n: "Hilal Sulthanul Adzam", rk: "dev2_role", dk: "dev2_desc", i: "devices", c: "emerald" },
              { n: "Diaz Daffa Aulia", rk: "dev3_role", dk: "dev3_desc", i: "dns", c: "amber" },
            ].map((d) => (
              <div key={d.n} class="reveal-item opacity-0 group p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 flex flex-col items-center">
                <div class={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-${d.c}-100 to-${d.c}-50 mb-4 sm:mb-6 flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform`}>
                  <span class={`material-symbols-outlined text-3xl sm:text-4xl text-${d.c}-500`}>{d.i}</span>
                </div>
                <h3 class="text-base sm:text-xl font-bold text-slate-900 dark:text-white mb-1">{d.n}</h3>
                <p class={`text-[10px] sm:text-sm font-semibold text-${d.c}-600 uppercase tracking-widest mb-3 sm:mb-4`}>{L()[d.rk]}</p>
                <p class="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">{L()[d.dk]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section class="section-reveal relative z-10 w-full bg-slate-950 py-16 sm:py-24 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-80 sm:w-96 h-80 sm:h-96 bg-blue-500 rounded-full filter blur-[120px] opacity-30"></div>
        <div class="reveal-item opacity-0 max-w-4xl mx-auto px-5 sm:px-8 text-center relative z-10">
          <h2 class="text-2xl sm:text-3xl md:text-5xl font-[900] text-white tracking-tight mb-4 sm:mb-6">{L().cta_title_1} <span class="text-blue-400">{L().cta_title_2}</span></h2>
          <p class="text-slate-300 font-medium text-sm sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">{L().cta_desc}</p>
          <Link href="/login" class="inline-flex px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white text-slate-900 font-[800] text-base sm:text-lg hover:bg-blue-50 hover:text-blue-700 transition-all hover:scale-105 shadow-lg">{L().cta_btn}</Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer class="relative z-10 w-full py-6 sm:py-8 border-t border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div class="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center"><span class="text-white font-[900] text-xs">E</span></div>
            <span class="font-[800] text-slate-900 dark:text-white text-sm">Examinator</span>
            <span class="text-slate-400 font-medium text-xs sm:text-sm">© 2026</span>
          </div>
          <p class="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">{L().footer_text}</p>
        </div>
      </footer>

    </div>
  );
});

export const head: DocumentHead = {
  title: "Examinator — Platform CBT & Proctoring Masa Depan",
  meta: [{ name: "description", content: "Platform Ujian Berbasis Komputer mutakhir dengan keamanan proctoring multi-lapis dan arsitektur O(1) Resumability." }],
=======
import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { t, LANG_LABELS, type Lang } from "~/lib/i18n";
import { ThemeToggle } from "~/components/ui/theme-toggle";
import { initTheme } from "~/lib/theme";

const GREETINGS = [
  "Hello", "Halo", "Bonjour", "こんにちは", "Hola", "Ciao",
  "مرحبا", "Привет", "안녕하세요", "Olá", "Merhaba", "Sawubona",
  "Xin chào", "Kamusta", "Habari", "Namaste", "Hej", "Szia",
];

export default component$(() => {
  const showLoader = useSignal(true);
  const loaderPhase = useSignal<"typing" | "done">("typing");
  const displayedText = useSignal("");
  const currentGreetingIdx = useSignal(0);
  const lang = useSignal<Lang>("id");
  const langOpen = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    initTheme();

    let gIdx = 0;
    const typeGreeting = (word: string) => {
      return new Promise<void>((resolve) => {
        let charIdx = 0;
        displayedText.value = "";
        const typeInterval = setInterval(() => {
          displayedText.value = word.slice(0, charIdx + 1);
          charIdx++;
          if (charIdx >= word.length) { clearInterval(typeInterval); setTimeout(resolve, 400); }
        }, 60);
      });
    };

    const eraseGreeting = () => {
      return new Promise<void>((resolve) => {
        const word = displayedText.value;
        let charIdx = word.length;
        const eraseInterval = setInterval(() => {
          charIdx--;
          displayedText.value = word.slice(0, charIdx);
          if (charIdx <= 0) { clearInterval(eraseInterval); setTimeout(resolve, 100); }
        }, 35);
      });
    };

    for (let i = 0; i < 6; i++) {
      currentGreetingIdx.value = gIdx;
      await typeGreeting(GREETINGS[gIdx]);
      if (i < 5) await eraseGreeting();
      gIdx = (gIdx + 1) % GREETINGS.length;
    }

    loaderPhase.value = "done";
    setTimeout(() => { showLoader.value = false; }, 600);

    setTimeout(async () => {
      const { animate, stagger } = await import("motion");
      animate(".blob-1" as any, { scale: [1, 1.15], rotate: [0, 60], y: [0, -30] }, { duration: 14, repeat: Infinity, direction: "alternate", ease: "easeInOut" } as any);
      animate(".blob-2" as any, { scale: [0.9, 1.1], rotate: [0, -40], x: [0, 40] }, { duration: 18, repeat: Infinity, direction: "alternate", ease: "easeInOut" } as any);
      animate(".blob-3" as any, { scale: [1, 0.85], rotate: [0, 25], y: [0, 25] }, { duration: 20, repeat: Infinity, direction: "alternate", ease: "easeInOut" } as any);
      animate(".fade-up" as any, { opacity: [0, 1], y: [50, 0] }, { duration: 0.8, delay: stagger(0.12), ease: [0.16, 1, 0.3, 1] } as any);
      const sections = document.querySelectorAll(".section-reveal");
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const children = entry.target.querySelectorAll(".reveal-item");
            animate(children as any, { opacity: [0, 1], y: [40, 0] }, { duration: 0.7, delay: stagger(0.1), ease: [0.16, 1, 0.3, 1] } as any);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      sections.forEach((s) => observer.observe(s));
    }, 800);
  });

  const L = () => t[lang.value];

  return (
    <div class="font-sans w-full bg-[#fdfdfd] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden selection:bg-blue-500/20 selection:text-blue-700 relative transition-colors duration-300">

      {/* ═══ LOADING SCREEN ═══ */}
      <div class={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 transition-all duration-700 ${showLoader.value ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div class="relative">
          <p class="text-5xl sm:text-7xl md:text-8xl font-[900] text-white tracking-tight min-h-[1.2em] flex items-center">
            <span>{displayedText.value}</span>
            <span class={`inline-block w-[3px] h-[0.8em] bg-blue-400 ml-1 ${loaderPhase.value === "done" ? "opacity-0" : "animate-pulse"}`}></span>
          </p>
        </div>
        <div class="mt-10 flex items-center gap-1.5">
          {[0, 150, 300].map((d) => (
            <div key={d} class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: `${d}ms` }}></div>
          ))}
        </div>
        <p class="mt-6 text-slate-500 text-sm font-medium tracking-wider uppercase">Examinator</p>
      </div>

      {/* ═══ BACKGROUND ═══ */}
      <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden dark:opacity-50">
        <div class="blob-1 absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full opacity-30 mix-blend-multiply dark:mix-blend-screen filter blur-[100px]" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)' }}></div>
        <div class="blob-2 absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] rounded-full opacity-25 mix-blend-multiply dark:mix-blend-screen filter blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)' }}></div>
        <div class="blob-3 absolute top-[40%] left-[50%] w-[40vw] h-[40vw] rounded-full opacity-20 mix-blend-multiply dark:mix-blend-screen filter blur-[90px]" style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.15) 0%, transparent 70%)' }}></div>
      </div>

      {/* ═══ NAVIGATION ═══ */}
      <nav class="sticky top-0 z-50 w-full px-5 sm:px-8 md:px-12 py-4 flex items-center fade-up opacity-0 bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        {/* Left: Logo */}
        <div class="flex items-center gap-2.5 flex-1">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <span class="text-white font-[900] text-lg leading-none">E</span>
          </div>
          <span class="text-xl font-[900] tracking-tight text-slate-900 dark:text-white">Examinator</span>
        </div>
        {/* Center: Nav links — truly centered */}
        <div class="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500 dark:text-slate-400 absolute left-1/2 -translate-x-1/2">
          <a href="#features" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{L().nav_features}</a>
          <a href="#tech" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{L().nav_tech}</a>
          <a href="#docs" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{L().nav_docs}</a>
          <a href="#team" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{L().nav_team}</a>
        </div>
        {/* Right: Actions */}
        <div class="flex items-center gap-3 flex-1 justify-end">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Switcher */}
          <div class="relative">
            <button onClick$={() => langOpen.value = !langOpen.value}
              class="h-9 px-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
              <span>{LANG_LABELS[lang.value].slice(0, 4)}</span>
              <span class="material-symbols-outlined text-[14px]">expand_more</span>
            </button>
            {langOpen.value && (
              <div class="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 min-w-[160px] z-50">
                {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
                  <button key={l} onClick$={() => { lang.value = l; langOpen.value = false; }}
                    class={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors ${lang.value === l ? "text-blue-600 bg-blue-50/50 dark:bg-blue-950/30" : "text-slate-700 dark:text-slate-300"}`}>
                    {LANG_LABELS[l]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link href="/login"
            class="group px-5 py-2.5 rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2">
            <span>{L().nav_login}</span>
            <span class="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
          </Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section class="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-12 pt-8 sm:pt-10 md:pt-14 lg:pt-16 pb-16 sm:pb-20 flex flex-col items-center text-center min-h-[80vh] justify-center">
        <div class="fade-up opacity-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 dark:bg-blue-950/50 border border-blue-100/50 dark:border-blue-800/50 mb-6 sm:mb-8 backdrop-blur-sm">
          <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>
          <span class="text-[10px] sm:text-xs font-bold text-blue-700 dark:text-blue-400 tracking-wider uppercase">{L().hero_badge}</span>
        </div>
        <h1 class="fade-up opacity-0 text-[2.5rem] sm:text-[3.5rem] md:text-[5rem] lg:text-[6.5rem] leading-[1.05] font-[900] tracking-tighter text-slate-900 dark:text-white mb-5 sm:mb-6 max-w-5xl">
          {L().hero_title_1} <br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">{L().hero_title_2}</span>
        </h1>
        <p class="fade-up opacity-0 text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed mb-8 sm:mb-10 px-2">{L().hero_desc}</p>
        <div class="fade-up opacity-0 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full justify-center">
          <Link href="/login" class="w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-blue-600 text-white font-[700] text-base sm:text-lg hover:bg-blue-700 transition-all duration-300 shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:-translate-y-1 flex items-center justify-center gap-3 group">
            <span>{L().hero_cta}</span><span class="material-symbols-outlined text-[20px] group-hover:translate-x-1.5 transition-transform">arrow_forward</span>
          </Link>
          <a href="#features" class="w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 font-[600] text-base sm:text-lg hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[20px]">explore</span><span>{L().hero_cta2}</span>
          </a>
        </div>
        <div class="fade-up opacity-0 mt-14 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-3xl">
          {[{ v: "10K+", k: "stat_conn", i: "hub" }, { v: "<1.2s", k: "stat_lcp", i: "speed" }, { v: "99.9%", k: "stat_uptime", i: "verified" }, { v: "3s", k: "stat_snap", i: "photo_camera" }].map((s) => (
            <div key={s.k} class="flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-100 dark:border-slate-700/50">
              <span class="material-symbols-outlined text-blue-500 text-xl sm:text-2xl mb-1">{s.i}</span>
              <span class="text-xl sm:text-2xl font-[900] text-slate-900 dark:text-white">{s.v}</span>
              <span class="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{L()[s.k]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" class="section-reveal relative z-10 w-full bg-white dark:bg-slate-900 py-16 sm:py-24 border-t border-slate-100 dark:border-slate-800">
        <div class="max-w-7xl mx-auto px-5 sm:px-8 md:px-12">
          <div class="reveal-item opacity-0 text-center mb-12 sm:mb-16">
            <span class="inline-block px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">{L().feat_badge}</span>
            <h2 class="text-2xl sm:text-3xl md:text-5xl font-[900] text-slate-900 dark:text-white tracking-tight mb-3 sm:mb-4">{L().feat_title}</h2>
            <p class="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium text-sm sm:text-lg">{L().feat_desc}</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {[
              { icon: "policy", color: "blue", tk: "f1_title", dk: "f1_desc" },
              { icon: "visibility_off", color: "red", tk: "f2_title", dk: "f2_desc" },
              { icon: "photo_camera", color: "emerald", tk: "f3_title", dk: "f3_desc" },
              { icon: "fullscreen_exit", color: "amber", tk: "f4_title", dk: "f4_desc" },
              { icon: "bolt", color: "indigo", tk: "f5_title", dk: "f5_desc" },
              { icon: "cell_tower", color: "teal", tk: "f6_title", dk: "f6_desc" },
            ].map((f) => (
              <div key={f.tk} class="reveal-item opacity-0 group bg-slate-50 dark:bg-slate-800/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div class={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-${f.color}-100 to-${f.color}-50 border border-${f.color}-200 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                  <span class={`material-symbols-outlined text-2xl sm:text-3xl text-${f.color}-600`}>{f.icon}</span>
                </div>
                <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">{L()[f.tk]}</h3>
                <p class="text-slate-600 dark:text-slate-400 leading-relaxed text-xs sm:text-sm">{L()[f.dk]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TECH STACK ═══ (already dark bg, minimal changes) ═══ */}
      <section id="tech" class="section-reveal relative z-10 w-full bg-slate-950 text-white py-16 sm:py-24 overflow-hidden">
        <div class="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 relative z-10">
          <div class="reveal-item opacity-0 text-center mb-12 sm:mb-16">
            <span class="inline-block px-4 py-1.5 rounded-full bg-white/10 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4 border border-white/10">{L().tech_badge}</span>
            <h2 class="text-2xl sm:text-3xl md:text-5xl font-[900] tracking-tight mb-3">{L().tech_title_1} <span class="text-blue-400">{L().tech_title_2}</span></h2>
            <p class="text-slate-400 max-w-2xl mx-auto font-medium text-sm sm:text-lg">{L().tech_desc}</p>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-12 sm:mb-16">
            {[
              { name: "Qwik", role: "Frontend", c: "from-cyan-500 to-blue-600" },
              { name: "Elysia.js", role: "Backend", c: "from-pink-500 to-rose-600" },
              { name: "Bun", role: "Runtime", c: "from-amber-400 to-orange-500" },
              { name: "Prisma", role: "ORM", c: "from-slate-400 to-slate-600" },
              { name: "MySQL", role: "Database", c: "from-blue-500 to-indigo-600" },
            ].map((tc) => (
              <div key={tc.name} class="reveal-item opacity-0 group flex flex-col items-center p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:-translate-y-1 text-center">
                <div class={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${tc.c} flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <span class="text-white font-[900] text-lg sm:text-xl">{tc.name[0]}</span>
                </div>
                <h4 class="text-sm sm:text-base font-bold">{tc.name}</h4>
                <p class="text-[10px] sm:text-xs text-slate-400 mt-1">{tc.role}</p>
              </div>
            ))}
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {[
              { i: "desktop_windows", tk: "layer1_title", dk: "layer1_desc", tags: ["Qwik City", "Tailwind v4", "Motion"] },
              { i: "dns", tk: "layer2_title", dk: "layer2_desc", tags: ["JWT Auth", "REST API", "WebSocket"] },
              { i: "storage", tk: "layer3_title", dk: "layer3_desc", tags: ["Prisma ORM", "MySQL", "ACID"] },
            ].map((ly) => (
              <div key={ly.tk} class="reveal-item opacity-0 p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <span class="material-symbols-outlined text-3xl sm:text-4xl text-blue-400 mb-4 block">{ly.i}</span>
                <h3 class="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{L()[ly.tk]}</h3>
                <p class="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">{L()[ly.dk]}</p>
                <div class="flex flex-wrap gap-2">
                  {ly.tags.map((tg) => <span key={tg} class="px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-[10px] sm:text-xs font-semibold border border-blue-500/20">{tg}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DOCS ═══ */}
      <section id="docs" class="section-reveal relative z-10 w-full bg-slate-900 py-16 sm:py-24 text-white">
        <div class="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div class="reveal-item opacity-0 lg:w-1/2 text-center lg:text-left">
            <span class="inline-block px-4 py-1.5 rounded-full bg-white/10 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 border border-white/10">{L().docs_badge}</span>
            <h2 class="text-2xl sm:text-3xl md:text-5xl font-[900] tracking-tight mb-4 sm:mb-6">{L().docs_title_1} <span class="text-blue-400">{L().docs_title_2}</span></h2>
            <p class="text-slate-300 font-medium text-sm sm:text-lg leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0">{L().docs_desc}</p>
          </div>
          <div class="reveal-item opacity-0 lg:w-1/2 w-full max-w-xl mx-auto lg:mx-0">
            <div class="bg-slate-800/50 backdrop-blur-2xl border border-slate-600/40 p-4 sm:p-6 rounded-2xl shadow-2xl space-y-3">
              {[
                { i: "school", c: "from-blue-500 to-indigo-600", t: "Karya Tulis Ilmiah", s: "Edge-Ready Framework & Bun" },
                { i: "architecture", c: "from-emerald-500 to-teal-600", t: "SRS (IEEE 830-1998)", s: "Software Requirements Spec" },
                { i: "account_tree", c: "from-purple-500 to-violet-600", t: "System Architecture", s: "3-Layer Monorepo" },
                { i: "api", c: "from-pink-500 to-rose-600", t: "API Reference", s: "REST & WebSocket Handlers" },
                { i: "rocket_launch", c: "from-amber-500 to-orange-600", t: "Deployment Guide", s: "NGINX, PM2, Production" },
              ].map((dc) => (
                <div key={dc.t} class="group flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <div class="flex items-center gap-3 sm:gap-4">
                    <div class={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${dc.c} flex items-center justify-center shadow-lg shrink-0`}>
                      <span class="material-symbols-outlined text-white text-lg sm:text-xl">{dc.i}</span>
                    </div>
                    <div class="min-w-0">
                      <h4 class="text-sm sm:text-base font-bold group-hover:text-blue-300 transition-colors truncate">{dc.t}</h4>
                      <p class="text-[10px] sm:text-xs text-slate-400 truncate">{dc.s}</p>
                    </div>
                  </div>
                  <span class="material-symbols-outlined text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0">chevron_right</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TEAM ═══ */}
      <section id="team" class="section-reveal relative z-10 w-full bg-slate-50 dark:bg-slate-900 py-16 sm:py-24 border-t border-slate-200/60 dark:border-slate-800">
        <div class="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 text-center">
          <div class="reveal-item opacity-0 mb-12 sm:mb-16">
            <span class="inline-block px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">{L().team_badge}</span>
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-[900] text-slate-900 dark:text-white tracking-tight mb-3">{L().team_title}</h2>
            <p class="text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium text-sm sm:text-base">{L().team_desc}</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8 max-w-5xl mx-auto">
            {[
              { n: "Al-Ghani Desta Setyawan", rk: "dev1_role", dk: "dev1_desc", i: "engineering", c: "blue" },
              { n: "Hilal Sulthanul Adzam", rk: "dev2_role", dk: "dev2_desc", i: "devices", c: "emerald" },
              { n: "Diaz Daffa Aulia", rk: "dev3_role", dk: "dev3_desc", i: "dns", c: "amber" },
            ].map((d) => (
              <div key={d.n} class="reveal-item opacity-0 group p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 flex flex-col items-center">
                <div class={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-${d.c}-100 to-${d.c}-50 mb-4 sm:mb-6 flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform`}>
                  <span class={`material-symbols-outlined text-3xl sm:text-4xl text-${d.c}-500`}>{d.i}</span>
                </div>
                <h3 class="text-base sm:text-xl font-bold text-slate-900 dark:text-white mb-1">{d.n}</h3>
                <p class={`text-[10px] sm:text-sm font-semibold text-${d.c}-600 uppercase tracking-widest mb-3 sm:mb-4`}>{L()[d.rk]}</p>
                <p class="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">{L()[d.dk]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section class="section-reveal relative z-10 w-full bg-slate-950 py-16 sm:py-24 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-80 sm:w-96 h-80 sm:h-96 bg-blue-500 rounded-full filter blur-[120px] opacity-30"></div>
        <div class="reveal-item opacity-0 max-w-4xl mx-auto px-5 sm:px-8 text-center relative z-10">
          <h2 class="text-2xl sm:text-3xl md:text-5xl font-[900] text-white tracking-tight mb-4 sm:mb-6">{L().cta_title_1} <span class="text-blue-400">{L().cta_title_2}</span></h2>
          <p class="text-slate-300 font-medium text-sm sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">{L().cta_desc}</p>
          <Link href="/login" class="inline-flex px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white text-slate-900 font-[800] text-base sm:text-lg hover:bg-blue-50 hover:text-blue-700 transition-all hover:scale-105 shadow-lg">{L().cta_btn}</Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer class="relative z-10 w-full py-6 sm:py-8 border-t border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div class="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center"><span class="text-white font-[900] text-xs">E</span></div>
            <span class="font-[800] text-slate-900 dark:text-white text-sm">Examinator</span>
            <span class="text-slate-400 font-medium text-xs sm:text-sm">© 2026</span>
          </div>
          <p class="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">{L().footer_text}</p>
        </div>
      </footer>

    </div>
  );
});

export const head: DocumentHead = {
  title: "Examinator — Platform CBT & Proctoring Masa Depan",
  meta: [{ name: "description", content: "Platform Ujian Berbasis Komputer mutakhir dengan keamanan proctoring multi-lapis dan arsitektur O(1) Resumability." }],
>>>>>>> Stashed changes
};