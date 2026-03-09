import { component$, useSignal, useVisibleTask$, $, useOnDocument } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useNavigate, useLocation } from "@builder.io/qwik-city";
import { attemptsApi, cheatLogsApi } from "~/lib/api";
import { getUserData, isAuthenticated } from "~/lib/auth";
import { getWsClient } from "~/lib/ws";

// ─── Exam Taking Page ───────────────────────────────────

export default component$(() => {
  const loc = useLocation();
  const nav = useNavigate();
  const examId = loc.params.examId;

  const user = useSignal<any>(null);
  const attempt = useSignal<any>(null);
  const questions = useSignal<any[]>([]);
  const currentQuestion = useSignal(0);
  const answers = useSignal<Record<string, string>>({});
  const timeLeft = useSignal(0);
  const cameraEnabled = useSignal(false);
  const loading = useSignal(true);
  const submitting = useSignal(false);
  const cheatCount = useSignal(0);
  const showWarning = useSignal(false);
  const warningMessage = useSignal("");

  // ── Initialize exam ─────────────────────────────────
  useVisibleTask$(async () => {
    if (!isAuthenticated()) {
      await nav("/");
      return;
    }
    user.value = getUserData();

    try {
      // Request camera permission
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        cameraEnabled.value = true;
      } catch {
        cameraEnabled.value = false;
      }

      // Start attempt
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
        // Fullscreen may not be available
      }

      loading.value = false;
    } catch (e: any) {
      console.error("Failed to start exam:", e);
    }
  });

  // ── Cheat Detection: Page Visibility ────────────────
  useOnDocument(
    "visibilitychange",
    $(() => {
      if (document.hidden && attempt.value) {
        logCheat("TAB_SWITCH", "Siswa berpindah tab");
      }
    })
  );

  // ── Cheat Detection: Fullscreen Exit ────────────────
  useOnDocument(
    "fullscreenchange",
    $(() => {
      if (!document.fullscreenElement && attempt.value) {
        logCheat("FULLSCREEN_EXIT", "Siswa keluar dari fullscreen");
        // Try to re-enter fullscreen
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

    // Auto-hide after 3 seconds
    setTimeout(() => {
      showWarning.value = false;
    }, 3000);

    // Log to server
    try {
      await cheatLogsApi.log({
        attemptId: attempt.value.id,
        cheatType: type,
        description,
      });

      // Notify via WebSocket
      const ws = getWsClient();
      ws.send("cheat:detected", {
        cheatType: type,
        description,
      });
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

      // Exit fullscreen
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      ws.disconnect();

      // Show result then redirect
      alert(`Ujian selesai!\nNilai: ${Math.round(result.result.score)}\nStatus: ${result.result.passed ? 'LULUS ✓' : 'BELUM LULUS ✗'}`);
      await nav("/student/");
    } catch (e: any) {
      submitting.value = false;
      alert("Gagal mengirim ujian: " + e.message);
    }
  });

  // ── Format timer ────────────────────────────────────
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQ = () => questions.value[currentQuestion.value];
  const isLast = () => currentQuestion.value === questions.value.length - 1;

  return (
    <div class="min-h-screen bg-surface-900 select-none" onContextMenu$={(e) => e.preventDefault()}>
      {/* Cheat Warning Overlay */}
      {showWarning.value && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-danger/10 backdrop-blur-sm animate-fade-in">
          <div class="bg-surface-800 border-2 border-danger rounded-2xl p-8 max-w-md text-center animate-shake shadow-2xl shadow-danger/20">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-danger/10 flex items-center justify-center">
              <svg class="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p class="text-danger font-bold text-lg mb-2">Pelanggaran Terdeteksi!</p>
            <p class="text-surface-300 text-sm">{warningMessage.value}</p>
          </div>
        </div>
      )}

      {loading.value ? (
        <div class="flex items-center justify-center h-screen">
          <div class="text-center">
            <div class="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p class="text-surface-400">Memuat ujian...</p>
          </div>
        </div>
      ) : (
        <div class="flex flex-col h-screen">
          {/* Top Bar */}
          <div class="glass border-b border-surface-700/50 px-4 py-3 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-4">
              <h1 class="text-sm font-semibold text-surface-200 truncate max-w-xs">
                {attempt.value?.exam?.title}
              </h1>
              {!cameraEnabled.value && (
                <span class="text-xs px-2 py-0.5 bg-warning/10 text-warning rounded-full border border-warning/20">
                  📷 Kamera OFF
                </span>
              )}
            </div>

            {/* Timer */}
            <div class={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-sm font-bold ${
              timeLeft.value <= 300
                ? 'bg-danger/10 text-danger border border-danger/20 animate-pulse-glow'
                : 'bg-surface-800 text-surface-200 border border-surface-700'
            }`}>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(timeLeft.value)}
            </div>

            <div class="flex items-center gap-3">
              {cheatCount.value > 0 && (
                <span class="text-xs px-2.5 py-1 bg-danger/10 text-danger rounded-full border border-danger/20">
                  ⚠ {cheatCount.value} pelanggaran
                </span>
              )}
              <span class="text-xs text-surface-500">
                {currentQuestion.value + 1}/{questions.value.length}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div class="h-1 bg-surface-800 shrink-0">
            <div
              class="h-full bg-gradient-to-r from-primary-500 to-info transition-all duration-300"
              style={`width: ${((currentQuestion.value + 1) / questions.value.length) * 100}%`}
            />
          </div>

          {/* Question Content */}
          <div class="flex-1 overflow-auto p-6">
            <div class="max-w-3xl mx-auto animate-fade-in" key={currentQuestion.value}>
              {/* Question Number */}
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-400 text-sm font-medium border border-primary-500/20 mb-4">
                Soal {currentQuestion.value + 1}
                <span class="text-surface-500">/ {questions.value.length}</span>
              </div>

              {/* Question Text */}
              <h2 class="text-xl font-medium text-surface-100 mb-6 leading-relaxed">
                {currentQ()?.text}
              </h2>

              {/* Options */}
              <div class="space-y-3">
                {currentQ()?.options?.map((option: any, idx: number) => {
                  const isSelected = answers.value[currentQ()?.id] === option.id;
                  const letters = ["A", "B", "C", "D", "E"];

                  return (
                    <button
                      key={option.id}
                      onClick$={() => saveAnswer(currentQ().id, option.id)}
                      class={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-start gap-3 group ${
                        isSelected
                          ? 'bg-primary-500/10 border-2 border-primary-500 text-surface-100 shadow-lg shadow-primary-500/10'
                          : 'bg-surface-800/50 border border-surface-700/50 text-surface-300 hover:border-surface-500 hover:bg-surface-800'
                      }`}
                    >
                      <span class={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                        isSelected
                          ? 'bg-primary-500 text-white'
                          : 'bg-surface-700 text-surface-400 group-hover:bg-surface-600'
                      }`}>
                        {letters[idx]}
                      </span>
                      <span class="pt-1">{option.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Navigation Footer */}
          <div class="glass border-t border-surface-700/50 px-6 py-4 flex items-center justify-between shrink-0">
            {/* Question dots */}
            <div class="flex items-center gap-1.5 flex-wrap max-w-md">
              {questions.value.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick$={() => { currentQuestion.value = idx; }}
                  class={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                    idx === currentQuestion.value
                      ? 'bg-primary-500 text-white scale-110'
                      : answers.value[questions.value[idx]?.id]
                        ? 'bg-success/20 text-success border border-success/30'
                        : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Nav buttons */}
            <div class="flex items-center gap-3">
              {currentQuestion.value > 0 && (
                <button
                  onClick$={() => { currentQuestion.value--; }}
                  class="px-4 py-2 rounded-xl bg-surface-800 text-surface-300 hover:bg-surface-700 transition-colors text-sm"
                >
                  ← Sebelumnya
                </button>
              )}

              {isLast() ? (
                <button
                  onClick$={submitExam}
                  disabled={submitting.value}
                  class="px-6 py-2 rounded-xl bg-success text-white font-medium hover:bg-success/90 transition-colors text-sm shadow-lg shadow-success/20 disabled:opacity-50"
                >
                  {submitting.value ? "Mengirim..." : "Selesai & Kirim"}
                </button>
              ) : (
                <button
                  onClick$={() => { currentQuestion.value++; }}
                  class="px-4 py-2 rounded-xl bg-gradient-primary text-white font-medium hover:scale-[1.02] active:scale-[0.98] transition-all text-sm shadow-lg shadow-primary-500/20"
                >
                  Selanjutnya →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "Ujian — Examinator",
};
