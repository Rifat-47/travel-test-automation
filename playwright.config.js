import { defineConfig, devices } from '@playwright/test';
import { baseUrl } from './config/env.js';
import { testConfig } from './config/test.config.js';

const where = process.env.CI ? 'ci' : 'local';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: testConfig.workers[where],
  retries: testConfig.retries[where],
  timeout: testConfig.timeouts.test,
  expect: { timeout: testConfig.timeouts.expect },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: baseUrl(),
    headless: testConfig.headless,
    actionTimeout: testConfig.timeouts.action,
    navigationTimeout: testConfig.timeouts.navigation,
    screenshot: 'only-on-failure',
    // Traces record typed passwords and session tokens. Kept local only.
    trace: process.env.CI ? 'off' : 'retain-on-failure',
  },
  projects: [{ name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }],
});
