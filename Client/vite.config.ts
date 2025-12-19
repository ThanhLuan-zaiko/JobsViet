import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_API_BASE_URL
    ? new URL(env.VITE_API_BASE_URL).origin
    : "http://localhost:5174";

  return {
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    server: {
      proxy: {
        "/api": {
          target: target,
          changeOrigin: true,
          secure: false,
        },
        "/jobsHub": {
          target: target,
          ws: true,
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target: target,
          changeOrigin: true,
          secure: false,
        },
        "/images": {
          target: process.env.VITE_IMAGES_SERVICE || "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
