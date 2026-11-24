/** The one place to tune how tests run. */
export const testConfig = {
  workers: { local: 2, ci: 2 },
  retries: { local: 0, ci: 1 },
  headless: true,
  timeouts: { test: 30_000, expect: 7_000, action: 10_000, navigation: 20_000 },
};
