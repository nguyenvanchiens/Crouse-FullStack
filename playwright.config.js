// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const PORT = 5199;
// BASE_URL=http://localhost:8787 npm test  -> chạy test vào server có sẵn (vd. wrangler dev)
const BASE_URL = process.env.BASE_URL;

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL || `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // SLOWMO=500 npm run test:headed để xem từng thao tác
    launchOptions: { slowMo: Number(process.env.SLOWMO) || 0 }
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 860 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } }
  ],
  webServer: BASE_URL ? undefined : {
    command: 'node server.js',
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI
  }
});
