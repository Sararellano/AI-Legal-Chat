import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
  collectCoverageFrom: [
    "lib/**/*.{ts,tsx}",
    "!lib/prompts.ts",
    "components/**/*.{ts,tsx}",
    "!components/ui/**",
    "!components/ChatShell.tsx",
    "!components/MessageList.tsx",
    "!components/SuggestedPrompts.tsx",
    "!components/SiteFooter.tsx",
    "!components/ChatErrorBoundary.tsx",
    "!**/*.d.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    "./lib/validation/": {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    "./lib/utils.ts": {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default createJestConfig(config);
