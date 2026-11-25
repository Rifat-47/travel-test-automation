import { newCustomer } from '../../../data/customers.js';
import { test, expect } from '../../../fixtures/test.js';
import { ProfilePage } from '../../../pages/account/profile.page.js';
import { LoginPage } from '../../../pages/auth/login.page.js';
import { RegisterPage } from '../../../pages/auth/register.page.js';
import { Navbar } from '../../../pages/layout/navbar.page.js';
import { registerByApi } from '../../../services/authApi.js';

let register;
let navbar;
let profile;

test.beforeEach(async ({ page }) => {
  register = new RegisterPage(page);
  navbar = new Navbar(page);
  profile = new ProfilePage(page);
  await register.open();
});

test('TRV-1-REG07 Register with all fields', async ({ page }) => {
  expect((await register.registerAndGetResponse(newCustomer())).status()).toBe(201);
  await expect(register.successMessage).toBeVisible();
  await expect(page).toHaveURL('/');
  await expect(navbar.userMenu).toBeVisible();
  await expect(navbar.login).toBeHidden();
  await expect(navbar.register).toBeHidden();
});

test('TRV-1-REG08 Register without a last name', async ({ page }) => {
  expect((await register.registerAndGetResponse(newCustomer({ lastName: '' }))).status()).toBe(201);
  await expect(register.successMessage).toBeVisible();
  await expect(page).toHaveURL('/');
  await expect(navbar.userMenu).toBeVisible();
});

test('TRV-1-REG09 Names and email are saved', async () => {
  const customer = newCustomer({ firstName: 'Amina', lastName: 'Walker' });
  expect((await register.registerAndGetResponse(customer)).status()).toBe(201);
  await expect(navbar.userMenu).toBeVisible();
  await profile.open();
  await expect(profile.firstName).toHaveValue(customer.firstName);
  await expect(profile.lastName).toHaveValue(customer.lastName);
  await expect(profile.email).toHaveValue(customer.email);
});

test('TRV-1-REG10 The session survives a reload', async ({ page }) => {
  expect((await register.registerAndGetResponse(newCustomer())).status()).toBe(201);
  await expect(navbar.userMenu).toBeVisible();
  await page.reload();
  await expect(navbar.userMenu).toBeVisible();
  await expect(navbar.login).toBeHidden();
});

test('TRV-1-REG11 A new customer can sign in later', async ({ page }) => {
  const customer = newCustomer();
  expect((await register.registerAndGetResponse(customer)).status()).toBe(201);
  await navbar.logOut();
  await expect(navbar.login).toBeVisible();
  const login = new LoginPage(page);
  await login.open();
  await login.signIn(customer);
  await expect(page).toHaveURL('/');
  await expect(navbar.userMenu).toBeVisible();
});

test('TRV-1-REG12 A plus alias is its own account', async ({ request }) => {
  // Every new customer gets a different alias of the same mailbox.
  await registerByApi(request, newCustomer());
  const second = newCustomer();
  expect((await register.registerAndGetResponse(second)).status()).toBe(201);
  await expect(navbar.userMenu).toBeVisible();
  await profile.open();
  await expect(profile.email).toHaveValue(second.email);
});

test('TRV-1-REG14 A mixed-case email is saved in lower case', async () => {
  const customer = newCustomer();
  const mixedCase = customer.email.replace(/^.|@./g, (part) => part.toUpperCase());
  expect((await register.registerAndGetResponse({ ...customer, email: mixedCase })).status()).toBe(
    201,
  );
  await expect(navbar.userMenu).toBeVisible();
  await profile.open();
  await expect(profile.email).toHaveValue(customer.email);
});

test('TRV-1-REG15 International characters are accepted', async () => {
  const customer = newCustomer({ firstName: 'Zoë', lastName: "O'Brien-রহমান" });
  expect((await register.registerAndGetResponse(customer)).status()).toBe(201);
  await expect(navbar.userMenu).toBeVisible();
  await profile.open();
  await expect(profile.firstName).toHaveValue(customer.firstName);
  await expect(profile.lastName).toHaveValue(customer.lastName);
});

test('TRV-1-REG16 The shortest allowed password works', async ({ page }) => {
  const password = newCustomer().password.slice(0, 8);
  expect((await register.registerAndGetResponse(newCustomer({ password }))).status()).toBe(201);
  await expect(page).toHaveURL('/');
  await expect(navbar.userMenu).toBeVisible();
});
