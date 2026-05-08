import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,   // 0.0.0.0 — subdomains kaam karenge
    proxy: {
      // Frontend se /api calls seedha backend pe jayenge
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});