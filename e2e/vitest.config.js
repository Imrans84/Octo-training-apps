// vitest.config.js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Use jsdom to simulate a browser environment for localStorage
    environment: "jsdom",

    // Run all files matching these patterns
    include: ["**/*.test.js", "**/*.test.ts", "**/*.spec.js"],

    // Exclude Playwright E2E specs from the Vitest run
    exclude: ["e2e/**", "node_modules/**", "dist/**"],

    // Show individual test names in output
    reporter: "verbose",

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["tasks.js", "study-coach.js"],
      exclude: ["app.js", "vite.config.js", "vitest.config.js"],
      // Fail CI if coverage drops below these thresholds
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
      },
    },

    // Global test utilities available without importing
    globals: true,
  },
});
