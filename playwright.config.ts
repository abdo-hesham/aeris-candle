import { defineConfig } from "@playwright/test";

const baseURL = process.env.AERIS_TEST_URL || "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests",
  timeout: 90_000,
  use: { baseURL, channel: "msedge", headless: true },
  webServer: {
    command: "node node_modules/next/dist/bin/next start --port 3100",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
