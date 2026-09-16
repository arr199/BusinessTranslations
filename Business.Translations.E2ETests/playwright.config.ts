import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  retries: 0,
  webServer: {
    command: "pnpm -C ../Business.Translations.FrontEnd run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  use: {
    baseURL: "http://localhost:5173/bt/dashboard/",
    headless: true,
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
