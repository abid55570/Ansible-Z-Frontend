import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      // Logic + wizard are gated at 93%; purely-visual landing/3D components are
      // covered by Playwright E2E (added later), not unit coverage.
      include: ["lib/**/*.ts", "components/wizard/**/*.tsx", "components/dashboard/**/*.tsx"],
      thresholds: { lines: 93, functions: 93, statements: 93, branches: 80 },
    },
  },
});
