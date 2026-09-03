import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Breaks an import cycle in R3F v10 alpha 3 that otherwise makes the first `@react-three/fiber/webgpu` import throw.
      "three/addons/inspector/Inspector.js": fileURLToPath(
        new URL("./src/lib/three-inspector-stub.ts", import.meta.url),
      ),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
