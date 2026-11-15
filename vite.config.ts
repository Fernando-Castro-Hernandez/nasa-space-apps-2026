import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,webp,ico,svg,woff2}"],
        // La API la responde el Worker, nunca la copia de la app sin conexión.
        navigateFallbackDenylist: [/^\/api\//],
      },
      // En inglés, el idioma oficial de la app; los colores son el papel Marea.
      manifest: {
        name: "Nóstos — crew health",
        short_name: "Nóstos",
        description:
          "Each astronaut checks in on their own health and gets guidance on what to do, with Lunito as a companion. A NASA Space Apps 2026 prototype.",
        lang: "en",
        display: "standalone",
        theme_color: "#fdf7f3",
        background_color: "#fdf7f3",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  // En desarrollo, la API es el Worker local de `pnpm dev:api`. NOSTOS_API
  // apunta a otro Worker (por ejemplo, uno de pruebas en otro puerto).
  server: {
    proxy: { "/api": process.env.NOSTOS_API ?? "http://127.0.0.1:8787" },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}", "worker/**/*.test.ts"],
    setupFiles: ["src/test/setup.ts"],
  },
});
