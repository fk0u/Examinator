import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

export const Greeting = component$(({ name }: { name?: string }) => {
  const greeting = useSignal("");

  useVisibleTask$(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) greeting.value = "Selamat Pagi";
      else if (hour >= 12 && hour < 15) greeting.value = "Selamat Siang";
      else if (hour >= 15 && hour < 18) greeting.value = "Selamat Sore";
      else greeting.value = "Selamat Malam";
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  });

  return (
    <span class="text-white/80">
      {greeting.value},{" "}
      <span class="text-white font-[900]">{name}</span>
    </span>
  );
});