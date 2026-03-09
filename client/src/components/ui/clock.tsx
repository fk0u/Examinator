import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

export const Clock = component$(() => {
  const time = useSignal("");

  useVisibleTask$(() => {
    const updateTime = () => {
      const now = new Date();
      time.value = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  });

  return (
    <div class="flex items-center gap-2 text-surface-500 bg-surface-100/50 px-3 py-1.5 rounded-lg border border-surface-200">
      <svg class="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="text-sm font-medium font-mono min-w-[70px]">{time.value}</span>
    </div>
  );
});
