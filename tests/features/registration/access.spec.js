import { newCustomer } from '../../../data/customers.js';
import { test, expect } from '../../../fixtures/test.js';
import { LoginPage } from '../../../pages/auth/login.page.js';
import { RegisterPage } from '../../../pages/auth/register.page.js';
import { DestinationsPage } from '../../../pages/destinations/destinations.page.js';
import { Navbar } from '../../../pages/layout/navbar.page.js';

test('TRV-1-REG01 Register opens from the top bar', async ({ page }) => {
  await page.goto('/');
  await new Navbar(page).register.click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(new RegisterPage(page).heading).toBeVisible();
});

test('TRV-1-REG02 Register opens from Login', async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
  await login.register.click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(new RegisterPage(page).heading).toBeVisible();
});

test('TRV-1-REG03 Register opens from a destination', async ({ page }) => {
  const destinations = new DestinationsPage(page);
  await destinations.open();
  await destinations.firstDestination.click();
  await destinations.registerPrompt.click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(new RegisterPage(page).heading).toBeVisible();
});

test('TRV-1-REG04 Login opens from Register', async ({ page }) => {
  const register = new RegisterPage(page);
  await register.open();
  await register.signIn.click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(new LoginPage(page).heading).toBeVisible();
});

test('TRV-1-REG05 A signed-in customer cannot open Register', async ({ page }) => {
  const register = new RegisterPage(page);
  const navbar = new Navbar(page);
  await register.open();
  const response = await register.registerAndGetResponse(newCustomer());
  expect(response.status()).toBe(201);
  await expect(navbar.userMenu).toBeVisible();

  await register.open();
  await expect(page).toHaveURL('/');
  await expect(navbar.userMenu).toBeVisible();
  await expect(register.heading).toBeHidden();
});

test('TRV-1-REG06 The form shows its fields', async ({ page }) => {
  const register = new RegisterPage(page);
  await register.open();
  const labels = [
    [register.firstName, 'First name *'],
    [register.lastName, 'Last name'],
    [register.email, 'Email *'],
    [register.password, 'Password *'],
    [register.confirmPassword, 'Confirm password *'],
  ];
  for (const [field, label] of labels) {
    await expect(field.input).toBeVisible();
    await expect(field.label).toHaveText(label);
  }
  await expect(register.submit).toBeVisible();
});
