import { test, customerTest, expect } from '../../../fixtures/test.js';
import { LoginPage } from '../../../pages/auth/login.page.js';
import { DestinationsPage } from '../../../pages/destinations/destinations.page.js';
import { Navbar } from '../../../pages/layout/navbar.page.js';

test('TRV-2-LOG01 Login opens from the top bar', async ({ page }) => {
  await page.goto('/');
  await new Navbar(page).login.click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(new LoginPage(page).heading).toBeVisible();
});

test('TRV-2-LOG02 Login opens from a destination', async ({ page }) => {
  const destinations = new DestinationsPage(page);
  await destinations.open();
  await destinations.firstDestination.click();
  await destinations.loginToBook.click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(new LoginPage(page).heading).toBeVisible();
});

test('TRV-2-LOG03 Forgot password opens from Login', async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
  await login.forgotPassword.click();
  await expect(page).toHaveURL(/\/forgot-password$/);
});

customerTest('TRV-2-LOG04 A signed-in customer cannot open Login', async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
  await expect(page).toHaveURL('/');
  await expect(new Navbar(page).userMenu).toBeVisible();
  await expect(login.heading).toBeHidden();
});

test('TRV-2-LOG05 The form shows its fields', async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
  await expect(login.labels).toHaveText(['Email address *', 'Password *']);
  await expect(login.email).toBeVisible();
  await expect(login.password).toBeVisible();
  await expect(login.submit).toBeVisible();
  await expect(login.forgotPassword).toBeVisible();
  await expect(login.register).toBeVisible();
});
