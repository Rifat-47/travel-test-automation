import { newCustomer } from '../../../data/customers.js';
import { test, expect } from '../../../fixtures/test.js';
import { LoginPage } from '../../../pages/auth/login.page.js';
import { Navbar } from '../../../pages/layout/navbar.page.js';
import { registerByApi } from '../../../services/authApi.js';

const LOGIN_API = '**/api/v1/auth/login/';

let login;

test.beforeEach(async ({ page }) => {
  login = new LoginPage(page);
  await login.open();
});

test('TRV-2-LOG19 The button is blocked while sending', async ({ page, request }) => {
  const customer = newCustomer();
  await registerByApi(request, customer);
  let requests = 0;
  let release;
  const held = new Promise((resolve) => {
    release = resolve;
  });
  await page.route(LOGIN_API, async (route) => {
    requests += 1;
    await held;
    await route.continue();
  });

  await login.signIn(customer);
  await expect(login.submitting).toBeDisabled();
  await login.password.press('Enter');
  release();
  await expect(page).toHaveURL('/');
  expect(requests).toBe(1);
});

test('TRV-2-LOG20 A server failure is reported', async ({ page }) => {
  await page.route(LOGIN_API, (route) =>
    route.fulfill({ status: 500, contentType: 'text/html', body: '<h1>Server Error (500)</h1>' }),
  );
  await login.signIn(newCustomer());
  await expect(login.failureMessage).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  await expect(new Navbar(page).login).toBeVisible();
});

test('TRV-2-LOG21 A lost connection is reported', async ({ page }) => {
  await page.route(LOGIN_API, (route) => route.abort('internetdisconnected'));
  await login.signIn(newCustomer());
  await expect(login.failureMessage).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});
