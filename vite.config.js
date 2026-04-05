import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("react-dom") || id.includes("react-router-dom") || id.includes("framer-motion") || id.includes("/react/")) {
            return "framework";
          }
          if (id.includes("@react-three/fiber") || id.includes("@react-three/drei") || id.includes("three")) {
            return "three-stack";
          }
          if (id.includes("leaflet") || id.includes("react-leaflet")) {
            return "map-stack";
          }
        },
      },
    },
  },
});
