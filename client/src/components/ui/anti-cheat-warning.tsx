import { component$ } from "@builder.io/qwik";

interface AntiCheatWarningProps {
  show: boolean;
  title?: string;
  message: string;
}

export const AntiCheatWarning = component$<AntiCheatWarningProps>(({ show, title = "Pelanggaran Terdeteksi", message }) => {
  if (!show) return null;

  return (
    <div class="fixed inset-0 z-[100] flex items-center justify-center bg-red-950/40 backdrop-blur-sm animate-fade-in px-4">
      <div class="bg-white border border-red-100 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl shadow-red-500/20">
        <div class="size-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
          <span class="material-symbols-outlined text-4xl font-bold">warning</span>
        </div>
        <p class="text-red-700 font-extrabold text-2xl mb-2 tracking-tight">{title}</p>
        <p class="text-slate-600 font-semibold leading-relaxed">{message}</p>
      </div>
    </div>
  );
});
