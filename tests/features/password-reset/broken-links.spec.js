import { newCustomer } from '../../../data/customers.js';
import { accountPart, madeUpCode, madeUpLink } from '../../../data/resetLinks.js';
import { test, expect } from '../../../fixtures/test.js';
import { ResetPasswordPage } from '../../../pages/auth/reset-password.page.js';
import { registerByApi, tryLoginByApi } from '../../../services/authApi.js';

const RESET_API = '**/api/v1/auth/password/reset/';

let reset;

test.beforeEach(async ({ page }) => {
  reset = new ResetPasswordPage(page);
});

test('TRV-3-RST32 A link missing its parts is rejected', async ({ page }) => {
  for (const path of ['/reset-password', `/reset-password?uid=${madeUpLink().uid}`]) {
    await page.goto(path);
    await expect(reset.incompleteHeading, path).toBeVisible();
  }
  await reset.requestNewLink.click();
  await expect(page).toHaveURL(/\/forgot-password$/);
});

test('TRV-3-RST33 An altered link is rejected', async ({ request }) => {
  const customer = newCustomer();
  const { user } = await registerByApi(request, customer);
  await reset.open({ uid: accountPart(user.id), token: madeUpCode() });
  await reset.reset(newCustomer().password);
  await expect(reset.usedHeading).toBeVisible();
  expect((await tryLoginByApi(request, customer)).status()).toBe(200);
});

test('TRV-3-RST34 A link for no account is rejected', async () => {
  await reset.open(madeUpLink());
  await reset.reset(newCustomer().password);
  await expect(reset.usedHeading).toBeVisible();
});

test('TRV-3-RST35 The button is blocked while sending', async ({ page }) => {
  let requests = 0;
  let release;
  const held = new Promise((resolve) => {
    release = resolve;
  });
  await page.route(RESET_API, async (route) => {
    requests += 1;
    await held;
    await route.continue();
  });

  await reset.open(madeUpLink());
  await reset.reset(newCustomer().password);
  await expect(reset.resetting).toBeDisabled();
  await reset.confirmPassword.input.press('Enter');
  release();
  await expect(reset.usedHeading).toBeVisible();
  expect(requests).toBe(1);
});

test('TRV-3-RST36 A server failure is reported', async ({ page }) => {
  await page.route(RESET_API, (route) =>
    route.fulfill({ status: 500, contentType: 'text/html', body: '<h1>Server Error (500)</h1>' }),
  );
  await reset.open(madeUpLink());
  await reset.reset(newCustomer().password);
  await expect(reset.failureMessage).toBeVisible();
  await expect(reset.heading).toBeVisible();
});

test('TRV-3-RST37 A lost connection is reported', async ({ page }) => {
  await page.route(RESET_API, (route) => route.abort('internetdisconnected'));
  await reset.open(madeUpLink());
  await reset.reset(newCustomer().password);
  await expect(reset.networkMessage).toBeVisible();
  await expect(reset.heading).toBeVisible();
});
