// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.js"),
      name: "ios-notification-stack",
      fileName: (format) => `ios-notification-stack.${format}.js`,
      cssFileName: "style.css",
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        exports: "named",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith(".css")) return "style.css";
          return assetInfo.name;
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  css: {
    extract: "style.css",
  },
});
