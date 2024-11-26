import { defineConfig } from "vite";
// required to use "Buffer" in React-vite
// Ref: https://asaitoshiya.com/vite-troubleshooting-buffer-is-not-defined/
import { nodePolyfills } from "vite-plugin-node-polyfills";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
});
