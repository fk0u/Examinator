import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link, useLocation, useNavigate } from "@builder.io/qwik-city";
import { attemptsApi, examsApi } from "~/lib/api";
import { getUserData, isAuthenticated } from "~/lib/auth";

export default component$(() => {
  const DEVICE_READINESS_MAX_AGE_MS = 24 * 60 * 60 * 1000;
  const loc = useLocation();
  const nav = useNavigate();
  const examId = loc.params.examId;

  const user = useSignal<any>(null);
  const exam = useSignal<any>(null);
  const activeAttempt = useSignal<any>(null);
  const deviceReadinessSnapshot = useSignal<{
    isReady: boolean;
    score: number;
    checksPassed: number;
    totalChecks: number;
    networkOk: boolean;
    latency: number | null;
    updatedAt: string;
  } | null>(null);
  const deviceReadinessStale = useSignal(false);
  const loading = useSignal(true);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    if (!isAuthenticated()) {
      await nav("/");
      return;
    }

    user.value = getUserData();

    try {
      const [examData, attemptData] = await Promise.all([
        examsApi.get(examId),
        attemptsApi.my(),
      ]);

      exam.value = examData.exam;
      activeAttempt.value = (attemptData.attempts || []).find(
        (item: any) => item.examId === examId && item.status === "IN_PROGRESS"
      );

      try {
        const storedReadiness = localStorage.getItem("examinator_device_readiness");
        if (storedReadiness) {
          const parsed = JSON.parse(storedReadiness);
          deviceReadinessSnapshot.value = parsed;
          const updatedAtTs = new Date(parsed?.updatedAt || "").getTime();
          deviceReadinessStale.value = !Number.isFinite(updatedAtTs) || (Date.now() - updatedAtTs > DEVICE_READINESS_MAX_AGE_MS);
        }
      } catch {
        deviceReadinessSnapshot.value = null;
        deviceReadinessStale.value = false;
      }
    } catch {
      activeAttempt.value = null;
    } finally {
      loading.value = false;
    }
  });

  if (loading.value) {
    return (
      <div class="min-h-screen bg-slate-50 flex items-center justify-center">
        <div class="size-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!activeAttempt.value) {
    return (
      <div class="font-['Public_Sans',sans-serif] min-h-screen bg-[#f8fafd] flex items-center justify-center px-6">
        <div class="max-w-lg w-full rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl text-center">
          <span class="material-symbols-outlined text-5xl text-slate-300">info</span>
          <h1 class="mt-4 text-2xl font-bold text-slate-900">Tidak Ada Sesi Berjalan</h1>
          <p class="mt-2 text-slate-500 font-medium">Sesi ujian aktif untuk mata ujian ini tidak ditemukan. Kamu bisa mulai dari halaman persiapan ujian.</p>
          <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/student/" class="h-11 px-5 rounded-xl bg-slate-100 text-slate-700 font-bold inline-flex items-center justify-center">Dashboard</Link>
            <Link href={`/student/exam/${examId}/`} class="h-11 px-5 rounded-xl bg-blue-600 text-white font-bold inline-flex items-center justify-center border-b-4 border-blue-800">Ke Halaman Ujian</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class="font-['Public_Sans',sans-serif] min-h-screen bg-[#f8fafd] text-slate-900 p-6 sm:p-10">
      <div class="max-w-3xl mx-auto rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 bg-white p-6 sm:p-10 shadow-2xl shadow-slate-200/60">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
          <span class="material-symbols-outlined text-sm">pending_actions</span>
          Sesi Berjalan Terdeteksi
        </div>

        <h1 class="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">Lanjutkan Ujian</h1>
        <p class="mt-2 text-slate-500 font-medium leading-relaxed">Halo {user.value?.fullName || "Siswa"}, kamu masih memiliki sesi ujian aktif. Pastikan perangkat dan koneksi tetap stabil, lalu lanjutkan sesi di bawah ini.</p>

        {deviceReadinessSnapshot.value && (
          <div class={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${deviceReadinessStale.value ? "bg-amber-50 text-amber-700 border-amber-200" : (deviceReadinessSnapshot.value.isReady ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200")}`}>
            <span class="material-symbols-outlined text-sm">{deviceReadinessStale.value ? "history" : (deviceReadinessSnapshot.value.isReady ? "task_alt" : "pending_actions")}</span>
            {deviceReadinessStale.value ? "Status Diagnostik Kedaluwarsa" : `Snapshot Diagnostik • ${deviceReadinessSnapshot.value.score}%`}
          </div>
        )}

        <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Mata Ujian</p>
            <p class="text-sm font-bold text-slate-900 mt-1 line-clamp-2">{exam.value?.title || "-"}</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Mulai</p>
            <p class="text-sm font-bold text-slate-900 mt-1">{new Date(activeAttempt.value.startedAt).toLocaleString("id-ID")}</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Status</p>
            <p class="text-sm font-bold text-amber-700 mt-1">Sedang Berjalan</p>
          </div>
        </div>

        <div class="mt-8 p-5 rounded-2xl border border-blue-100 bg-blue-50/70">
          <p class="text-sm font-semibold text-slate-700">Catatan:</p>
          <p class="text-sm text-slate-600 mt-1">Timer tetap berjalan selama sesi aktif. Klik tombol lanjutkan untuk kembali ke antarmuka ujian aktif.</p>
          <div class="mt-3">
            <Link
              href={`/student/test-device/?reason=${deviceReadinessSnapshot.value && deviceReadinessSnapshot.value.networkOk === false ? "network" : "preflight"}`}
              class="inline-flex h-9 items-center px-4 rounded-xl bg-white text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider hover:border-blue-400 transition-all"
            >
              {deviceReadinessStale.value ? "Perbarui Diagnostik" : "Buka Diagnostik Perangkat"}
            </Link>
          </div>
        </div>

        <div class="mt-8 flex flex-col sm:flex-row gap-3">
          <Link href="/student/" class="h-12 px-6 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold inline-flex items-center justify-center">Kembali ke Dashboard</Link>
          <Link href={`/student/exam/${examId}/`} class="h-12 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold inline-flex items-center justify-center border-b-4 border-amber-700 shadow-lg shadow-amber-500/25">Lanjutkan Sesi Ujian</Link>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Lanjutkan Ujian — Examinator",
};
