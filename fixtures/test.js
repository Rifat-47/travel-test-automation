import { test as base, expect, request as playwrightRequest } from '@playwright/test';
import { baseUrl, requireEnv } from '../config/env.js';
import { newCustomer } from '../data/customers.js';
import { loginByApi, registerByApi } from '../services/authApi.js';

// Where the app keeps its sign-in in localStorage.
const ACCESS_KEY = 'travello_access';
const REFRESH_KEY = 'travello_refresh';

// Access tokens last 60 minutes. Renewing early stops the app from rotating the
// shared refresh token, which would invalidate it for the tests that follow.
const RENEW_AFTER_MS = 45 * 60 * 1000;

async function createStorageState() {
  const api = await playwrightRequest.newContext();
  try {
    const { access, refresh } = await loginByApi(api, {
      email: requireEnv('CUSTOMER_EMAIL'),
      password: requireEnv('CUSTOMER_PASSWORD'),
    });
    return {
      cookies: [],
      origins: [
        {
          origin: new URL(baseUrl()).origin,
          localStorage: [
            { name: ACCESS_KEY, value: access },
            { name: REFRESH_KEY, value: refresh },
          ],
        },
      ],
    };
  } finally {
    await api.dispose();
  }
}

/** Replaces the sign-in kept in the page's browser. Reload or navigate to apply it. */
export async function storeTokens(page, { access, refresh }) {
  await page.evaluate(
    ([keys, values]) => keys.forEach((key, i) => localStorage.setItem(key, values[i])),
    [
      [ACCESS_KEY, REFRESH_KEY],
      [access, refresh],
    ],
  );
}

/** Reads the sign-in kept in the page's browser; null where nothing is kept. */
export function readTokens(page) {
  return page.evaluate(
    ([accessKey, refreshKey]) => ({
      access: localStorage.getItem(accessKey),
      refresh: localStorage.getItem(refreshKey),
    }),
    [ACCESS_KEY, REFRESH_KEY],
  );
}

/**
 * Guest tests. Nobody is signed in until a test calls signedIn(path), which
 * registers a new customer, signs them in, opens path and returns
 * { ...details, access, refresh }. That customer is the test's own, so it may log out.
 */
export const test = base.extend({
  signedIn: async ({ page, request }, use) => {
    await use(async (path = '/', overrides = {}) => {
      const customer = newCustomer(overrides);
      const { access, refresh } = await registerByApi(request, customer);
      await page.goto('/');
      await storeTokens(page, { access, refresh });
      await page.goto(path);
      return { ...customer, access, refresh };
    });
  },
});

/**
 * Signed-in tests: one login per worker, reused by every test it runs.
 * Never log out or change the password here; that ends the shared session.
 */
export const customerTest = base.extend({
  customerSession: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      let cached;
      await use(async () => {
        if (!cached || Date.now() - cached.createdAt > RENEW_AFTER_MS) {
          cached = { createdAt: Date.now(), state: await createStorageState() };
        }
        return cached.state;
      });
    },
    { scope: 'worker' },
  ],
  storageState: async ({ customerSession }, use) => {
    await use(await customerSession());
  },
});

export { expect };
