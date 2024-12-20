import path from "path";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import replace from "@rollup/plugin-replace";

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin(),
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
  ],
  build: {
    lib: {
      // Entry point of your library
      entry: "src/main.jsx",
      // Name of the output file
      fileName: "camie-ai-floating-button",
      // Library name that will be used as a global variable
      name: "CamieFloatingButton",
      // Specify the output format (can be 'es', 'umd', or 'iife')
      formats: ["umd"],
    },
    // Ensure external libraries are not bundled
    rollupOptions: {
      // Make sure React and ReactDOM are treated as external dependencies
      external: [],
      output: {
        // Global variables for external dependencies
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
