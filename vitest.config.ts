import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Environnement de test
    environment: "happy-dom",

    // Variables globales (describe, it, expect, etc.)
    globals: true,

    // Setup files
    setupFiles: ["./tests/setup.ts"],

    // Inclure les fichiers de test
    include: [
      "**/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}",
      "**/*.{test,spec}.{js,ts,jsx,tsx}",
    ],

    // Exclure les fichiers
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/build/**",
      "**/coverage/**",
    ],

    // Coverage
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        ".next/",
        "tests/",
        "**/*.config.ts",
        "**/*.config.js",
        "**/types/**",
        "**/*.d.ts",
        "**/generated/**",
      ],
      include: ["src/**/*.{ts,tsx}"],
      // Objectifs de couverture
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },

    // Retry des tests flaky
    retry: 2,

    // Timeout
    testTimeout: 10000,

    // Reporter
    reporters: ["verbose"],

    // Pool options
    pool: "threads",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
