import { emailOfLength, newEmail } from '../../../data/customers.js';
import { test, expect } from '../../../fixtures/test.js';
import { ForgotPasswordPage } from '../../../pages/auth/forgot-password.page.js';

const FORGOT_API = '**/api/v1/auth/password/forgot/';

let forgot;

test.beforeEach(async ({ page }) => {
  forgot = new ForgotPasswordPage(page);
  await forgot.open();
});

test('TRV-3-RST13 An empty email is rejected', async ({ page }) => {
  let requests = 0;
  page.on('request', (request) => {
    if (request.url().includes('/api/v1/auth/password/forgot/')) requests += 1;
  });
  await forgot.submit.click();
  await expect(forgot.emailError).toHaveText('Email is required');
  await expect(forgot.heading).toBeVisible();
  expect(requests).toBe(0);
});

test('TRV-3-RST14 A malformed email is rejected', async () => {
  for (const email of ['plain', 'a@b', '@example.com', 'a b@example.com']) {
    await forgot.email.fill(email);
    await forgot.email.blur();
    await expect(forgot.emailError, email).toHaveText('Enter a valid email address');
  }
});

test('TRV-3-RST15 The email cannot be longer than 100 characters', async () => {
  const email = emailOfLength(101);
  await forgot.email.pressSequentially(email);
  await expect(forgot.email).toHaveValue(email.slice(0, 100));
});

test('TRV-3-RST16 The button is blocked while sending', async ({ page }) => {
  let requests = 0;
  let release;
  const held = new Promise((resolve) => {
    release = resolve;
  });
  await page.route(FORGOT_API, async (route) => {
    requests += 1;
    await held;
    await route.continue();
  });

  await forgot.request(newEmail());
  await expect(forgot.sending).toBeDisabled();
  await forgot.email.press('Enter');
  release();
  await expect(forgot.sentHeading).toBeVisible();
  expect(requests).toBe(1);
});

test('TRV-3-RST17 A server failure is reported', async ({ page }) => {
  await page.route(FORGOT_API, (route) =>
    route.fulfill({ status: 500, contentType: 'text/html', body: '<h1>Server Error (500)</h1>' }),
  );
  const email = newEmail();
  await forgot.request(email);
  await expect(forgot.failureMessage).toBeVisible();
  await expect(forgot.email).toHaveValue(email);
  await expect(forgot.sentHeading).toBeHidden();
});

test('TRV-3-RST18 A lost connection is reported', async ({ page }) => {
  await page.route(FORGOT_API, (route) => route.abort('internetdisconnected'));
  await forgot.request(newEmail());
  await expect(forgot.networkMessage).toBeVisible();
  await expect(forgot.sentHeading).toBeHidden();
});
