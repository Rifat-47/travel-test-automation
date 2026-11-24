import { test, expect } from '../../fixtures/test.js';
import { LoginPage } from '../../pages/auth/login.page.js';
import { Navbar } from '../../pages/layout/navbar.page.js';

test('TRV-0-SMK01 Home opens for a guest', async ({ page }) => {
  await page.goto('/');
  const navbar = new Navbar(page);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(navbar.login).toBeVisible();
  await expect(navbar.register).toBeVisible();
});

test('TRV-0-SMK02 Destinations opens for a guest', async ({ page }) => {
  await page.goto('/destinations');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('main a[href^="/destinations/"]').first()).toBeVisible();
});

test('TRV-0-SMK03 A guest is sent from Wishlist to Login', async ({ page }) => {
  const login = new LoginPage(page);
  await page.goto('/wishlist');
  await expect(page).toHaveURL(/\/login$/);
  await expect(login.email).toBeVisible();
  await expect(login.password).toBeVisible();
  await expect(login.submit).toBeVisible();
});
