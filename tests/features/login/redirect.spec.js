import { newCustomer } from '../../../data/customers.js';
import { test, customerTest, expect } from '../../../fixtures/test.js';
import { ProfilePage } from '../../../pages/account/profile.page.js';
import { LoginPage } from '../../../pages/auth/login.page.js';
import { DestinationsPage } from '../../../pages/destinations/destinations.page.js';
import { Navbar } from '../../../pages/layout/navbar.page.js';
import { registerByApi } from '../../../services/authApi.js';

test('TRV-2-LOG22 A guest is sent to Login from a customer page', async ({ page }) => {
  for (const path of ['/profile', '/wishlist']) {
    await page.goto(path);
    await expect(page, path).toHaveURL(/\/login$/);
  }
});

// Bug 1 in the test case file: sign-in always lands on Home.
test.fail('TRV-2-LOG23 Login returns to the page asked for', async ({ page, request }) => {
  const customer = newCustomer();
  await registerByApi(request, customer);
  const profile = new ProfilePage(page);
  await profile.open();
  await expect(page).toHaveURL(/\/login$/);
  await new LoginPage(page).signIn(customer);
  await expect(page).toHaveURL(/\/profile$/);
  await expect(profile.email).toHaveValue(customer.email);
});

// Bug 1 in the test case file: sign-in always lands on Home.
test.fail('TRV-2-LOG24 Login returns to the destination', async ({ page, request }) => {
  const customer = newCustomer();
  await registerByApi(request, customer);
  const destinations = new DestinationsPage(page);
  await destinations.open();
  await destinations.firstDestination.click();
  await expect(destinations.loginToBook).toBeVisible();
  const destinationUrl = page.url();

  await destinations.loginToBook.click();
  await new LoginPage(page).signIn(customer);
  await expect(page).toHaveURL(destinationUrl);
  await expect(new Navbar(page).userMenu).toBeVisible();
});

test('TRV-2-LOG25 A guest cannot open Dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
});

customerTest('TRV-2-LOG26 A customer cannot open Dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/');
  await expect(new Navbar(page).userMenu).toBeVisible();
});
