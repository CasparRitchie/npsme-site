import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// No special base needed since we serve from Express
export default defineConfig({
  plugins: [react()]
});
