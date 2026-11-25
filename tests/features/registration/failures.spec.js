import { newCustomer } from '../../../data/customers.js';
import { testConfig } from '../../../config/test.config.js';
import { test, expect } from '../../../fixtures/test.js';
import { RegisterPage } from '../../../pages/auth/register.page.js';
import { Navbar } from '../../../pages/layout/navbar.page.js';
import { registerByApi } from '../../../services/authApi.js';

const REGISTER_API = '**/api/v1/auth/register/';
const EMAIL_TAKEN = 'A user with this email already exists.';

let register;

test.beforeEach(async ({ page }) => {
  register = new RegisterPage(page);
  await register.open();
});

test('TRV-1-REG31 A used email is rejected', async ({ page, request }) => {
  const existing = newCustomer();
  await registerByApi(request, existing);
  await register.register(newCustomer({ email: existing.email }));
  await expect(register.email.error).toHaveText(EMAIL_TAKEN);
  await expect(new Navbar(page).login).toBeVisible();
});

test('TRV-1-REG32 A used email in other case is rejected', async ({ request }) => {
  const existing = newCustomer();
  await registerByApi(request, existing);
  await register.register(newCustomer({ email: existing.email.toUpperCase() }));
  await expect(register.email.error).toHaveText(EMAIL_TAKEN);
});

test('TRV-1-REG33 Entries stay after a rejection', async ({ request }) => {
  const customer = newCustomer();
  await registerByApi(request, customer);
  await register.register(customer);
  await expect(register.email.error).toHaveText(EMAIL_TAKEN);
  await expect(register.firstName.input).toHaveValue(customer.firstName);
  await expect(register.lastName.input).toHaveValue(customer.lastName);
  await expect(register.email.input).toHaveValue(customer.email);
});

test('TRV-1-REG34 The button is blocked while sending', async ({ page }) => {
  let requests = 0;
  let release;
  const held = new Promise((resolve) => {
    release = resolve;
  });
  await page.route(REGISTER_API, async (route) => {
    requests += 1;
    await held;
    await route.continue();
  });

  await register.register(newCustomer());
  await expect(register.submitting).toBeDisabled();
  await register.email.input.press('Enter');
  release();
  await expect(page).toHaveURL('/', { timeout: testConfig.timeouts.registration });
  expect(requests).toBe(1);
});

test('TRV-1-REG35 A server failure is reported', async ({ page }) => {
  await page.route(REGISTER_API, (route) =>
    route.fulfill({ status: 500, contentType: 'text/html', body: '<h1>Server Error (500)</h1>' }),
  );
  const customer = newCustomer();
  await register.register(customer);
  await expect(register.failureMessage).toBeVisible();
  await expect(page).toHaveURL(/\/register$/);
  await expect(register.firstName.input).toHaveValue(customer.firstName);
  await expect(register.lastName.input).toHaveValue(customer.lastName);
  await expect(register.email.input).toHaveValue(customer.email);
  await expect(register.password.input).toHaveValue(customer.password);
  await expect(register.confirmPassword.input).toHaveValue(customer.password);
});

test('TRV-1-REG36 A lost connection is reported', async ({ page }) => {
  await page.route(REGISTER_API, (route) => route.abort('internetdisconnected'));
  await register.register(newCustomer());
  await expect(register.failureMessage).toBeVisible();
  await expect(page).toHaveURL(/\/register$/);
});
