// ~/components/ui/theme-toggle.tsx
import { component$, useSignal, useVisibleTask$, $ } from "@builder.io/qwik";
import { getTheme, toggleTheme, initTheme, type Theme } from "~/lib/theme";

export const ThemeToggle = component$(() => {
  const theme = useSignal<Theme>("light");

  useVisibleTask$(() => {
    initTheme();
    theme.value = getTheme();
  });

  const handleToggle = $(() => {
    theme.value = toggleTheme();
  });

  return (
    <button
      onClick$={handleToggle}
      title={theme.value === "dark" ? "Light Mode" : "Dark Mode"}
      class="h-9 w-9 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 transition-all hover:scale-105 flex-shrink-0"
    >
      <span class="text-[14px] leading-none select-none">
        {theme.value === "dark" ? "☀️" : "🌙"}
      </span>
    </button>
  );
});