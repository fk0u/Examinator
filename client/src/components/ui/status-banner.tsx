import { component$ } from "@builder.io/qwik";

type StatusBannerType = "success" | "info" | "error";

interface StatusBannerProps {
  type: StatusBannerType;
  message: string;
}

export const StatusBanner = component$<StatusBannerProps>(({ type, message }) => {
  const colorClass =
    type === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : type === "error"
        ? "bg-rose-50 border-rose-200 text-rose-700"
        : "bg-blue-50 border-blue-200 text-blue-700";

  return (
    <div class={`rounded-2xl border px-4 py-3 text-sm font-bold shadow-lg ${colorClass}`}>
      {message}
    </div>
  );
});
