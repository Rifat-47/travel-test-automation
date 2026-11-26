/** The one place to tune how tests run. */
export const testConfig = {
  // The local dev server slows badly under two workers; one takes no longer overall.
  workers: { local: 1, ci: 2 },
  retries: { local: 0, ci: 1 },
  headless: true,
  // registration: account creation is slow on a busy local server.
  // emailArrival: longest wait for an email. noEmailWindow: how long "no email arrives" waits.
  // emailTest: time allowed for a test that waits for email.
  timeouts: {
    test: 30_000,
    expect: 7_000,
    action: 10_000,
    navigation: 20_000,
    registration: 20_000,
    emailArrival: 120_000,
    noEmailWindow: 120_000,
    emailTest: 180_000,
  },
};
