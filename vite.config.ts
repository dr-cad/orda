import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svgr(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true },
      workbox: { globPatterns: ["**/*"] },
      includeAssets: ["**/*"],
      manifest: false,
    }),
    sentryVitePlugin({
      org: "dr-cad",
      project: "javascript-react",
    }),
  ],
  build: {
    sourcemap: true,
  },
});
