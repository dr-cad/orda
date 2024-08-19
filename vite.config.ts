import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";
import compileTime from "vite-plugin-compile-time";
import { VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      compileTime(),
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
        project: "orda",
        disable: !!env.VITE_LOCAL_APP,
      }),
    ],
    build: {
      sourcemap: true,
      rollupOptions: {},
    },
  };
});
