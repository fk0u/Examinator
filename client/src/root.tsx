import { component$ } from "@builder.io/qwik";
import { isDev } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";
import "./global.css";

export default component$(() => {
  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* ── Dark mode script — runs BEFORE render, no flash ── */}
        <script dangerouslySetInnerHTML={`
          (function() {
            try {
              var theme = localStorage.getItem('examinator-theme');
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          })();
        `} />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        {!isDev && (
          <link
            rel="manifest"
            href={`${import.meta.env.BASE_URL}manifest.json`}
          />
        )}
        <RouterHead />
      </head>
      <body lang="id">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});