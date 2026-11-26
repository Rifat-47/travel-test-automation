import { newCustomer } from '../../../data/customers.js';
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

/** Registers a new customer through the API and returns their details. */
async function existingCustomer(request, overrides) {
  const customer = newCustomer(overrides);
  await registerByApi(request, customer);
  return customer;
}

test('TRV-2-LOG06 Sign in with a correct email and password', async ({ page, request }) => {
  const customer = await existingCustomer(request);
  expect((await login.signInAndGetResponse(customer)).status()).toBe(200);
  await expect(login.successMessage).toBeVisible();
  await expect(page).toHaveURL('/');
  await expect(navbar.userMenu).toBeVisible();
  await expect(navbar.login).toBeHidden();
  await expect(navbar.register).toBeHidden();
});

test('TRV-2-LOG07 The top bar shows who is signed in', async ({ request }) => {
  const customer = await existingCustomer(request, { firstName: 'Nadia', lastName: 'Rahman' });
  await login.signIn(customer);
  await navbar.userMenu.click();
  await expect(navbar.accountMenu).toContainText('Nadia Rahman');
  await expect(navbar.accountMenu).toContainText(customer.email);
  await expect(navbar.logout).toBeVisible();
  await expect(navbar.dashboard).toHaveCount(0);
});

test('TRV-2-LOG08 Enter submits the form', async ({ request }) => {
  const customer = await existingCustomer(request);
  await login.email.fill(customer.email);
  await login.password.fill(customer.password);
  await login.password.press('Enter');
  await expect(navbar.userMenu).toBeVisible();
});

test('TRV-2-LOG09 The email is not case-sensitive', async ({ request }) => {
  const customer = await existingCustomer(request);
  await login.signIn({ ...customer, email: customer.email.toUpperCase() });
  await navbar.userMenu.click();
  await expect(navbar.accountMenu).toContainText(customer.email);
});

test('TRV-2-LOG10 A failed attempt does not block the next one', async ({ request }) => {
  const customer = await existingCustomer(request);
  const rejected = await login.signInAndGetResponse({
    ...customer,
    password: `${customer.password}x`,
  });
  expect(rejected.status()).toBe(401);
  await expect(login.invalidCredentials).toBeVisible();
  await login.signIn(customer);
  await expect(navbar.userMenu).toBeVisible();
});

test('TRV-2-LOG11 The password can be shown and hidden', async () => {
  await login.password.fill(newCustomer().password);
  await expect(login.password).toHaveAttribute('type', 'password');
  await login.togglePassword.click();
  await expect(login.password).toHaveAttribute('type', 'text');
  await login.togglePassword.click();
  await expect(login.password).toHaveAttribute('type', 'password');
});
