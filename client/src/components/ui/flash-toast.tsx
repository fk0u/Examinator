import { component$ } from "@builder.io/qwik";

type ToastType = "success" | "error" | "info";

interface FlashToastProps {
  toast: { type: ToastType; message: string } | null;
}

export const FlashToast = component$<FlashToastProps>(({ toast }) => {
  if (!toast) return null;

  const toneClass =
    toast.type === "success"
      ? "bg-emerald-50/95 border-emerald-200 text-emerald-700"
      : toast.type === "error"
        ? "bg-rose-50/95 border-rose-200 text-rose-700"
        : "bg-blue-50/95 border-blue-200 text-blue-700";

  return (
    <div class="fixed top-5 right-5 z-[120] max-w-sm w-[calc(100%-2rem)] sm:w-auto">
      <div class={`rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl text-sm font-bold ${toneClass}`}>
        {toast.message}
      </div>
    </div>
  );
});
