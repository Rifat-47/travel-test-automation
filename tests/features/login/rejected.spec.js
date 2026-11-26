import { newCustomer, newEmail } from '../../../data/customers.js';
import { test, expect } from '../../../fixtures/test.js';
import { LoginPage } from '../../../pages/auth/login.page.js';
import { Navbar } from '../../../pages/layout/navbar.page.js';
import { registerByApi } from '../../../services/authApi.js';

let login;
let navbar;

test.beforeEach(async ({ page }) => {
  login = new LoginPage(page);
  navbar = new Navbar(page);
  await login.open();
});

async function existingCustomer(request) {
  const customer = newCustomer();
  await registerByApi(request, customer);
  return customer;
}

/** Signs in with the given details and checks the server refused them. */
async function expectRefused(details) {
  expect((await login.signInAndGetResponse(details)).status()).toBe(401);
  await expect(login.invalidCredentials).toBeVisible();
  await expect(navbar.login).toBeVisible();
}

const swapCase = (text) =>
  [...text].map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join('');

test('TRV-2-LOG12 An empty form is rejected', async ({ page }) => {
  let requests = 0;
  page.on('request', (request) => {
    if (request.url().includes('/api/v1/auth/login/')) requests += 1;
  });
  await login.submit.click();
  await expect(login.emailError).toHaveText('Email is required');
  await expect(login.passwordError).toHaveText('Password is required');
  await expect(page).toHaveURL(/\/login$/);
  expect(requests).toBe(0);
});

test('TRV-2-LOG13 A malformed email is rejected', async () => {
  for (const email of ['plain', 'a@b', '@example.com', 'a b@example.com']) {
    await login.email.fill(email);
    await login.email.blur();
    await expect(login.emailError, email).toHaveText('Enter a valid email address');
  }
});

test('TRV-2-LOG14 A wrong password is rejected', async ({ page, request }) => {
  const customer = await existingCustomer(request);
  await expectRefused({ ...customer, password: newCustomer().password });
  await expect(page).toHaveURL(/\/login$/);
  // The message sits above the form, not under a field.
  const message = await login.invalidCredentials.boundingBox();
  const form = await login.form.boundingBox();
  expect(message.y + message.height).toBeLessThanOrEqual(form.y);
});

test('TRV-2-LOG15 An unknown email gets the same message', async ({ page }) => {
  await expectRefused({ email: newEmail(), password: newCustomer().password });
  await expect(page).toHaveURL(/\/login$/);
});

test('TRV-2-LOG16 The password is case-sensitive', async ({ request }) => {
  const customer = await existingCustomer(request);
  await expectRefused({ ...customer, password: swapCase(customer.password) });
});

// Bug 4 in the test case file: spaces around the password are dropped.
test.fail('TRV-2-LOG17 A password with an extra space is rejected', async ({ request }) => {
  const customer = await existingCustomer(request);
  await expectRefused({ ...customer, password: `${customer.password} ` });
});

test('TRV-2-LOG18 The email stays after a rejection', async ({ request }) => {
  const customer = await existingCustomer(request);
  await expectRefused({ ...customer, password: newCustomer().password });
  await expect(login.email).toHaveValue(customer.email);
});
