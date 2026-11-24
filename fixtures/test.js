import { test as base, expect, request as playwrightRequest } from '@playwright/test';
import { baseUrl, requireEnv } from '../config/env.js';
import { loginByApi } from '../services/authApi.js';

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
            { name: 'travello_access', value: access },
            { name: 'travello_refresh', value: refresh },
          ],
        },
      ],
    };
  } finally {
    await api.dispose();
  }
}

/** Guest tests. Nobody is signed in. */
export const test = base;

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
