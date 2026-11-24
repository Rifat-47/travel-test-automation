import { customerTest as test, expect } from '../../fixtures/test.js';
import { Navbar } from '../../pages/layout/navbar.page.js';

test('TRV-0-SMK04 A signed-in customer opens Wishlist', async ({ page }) => {
  const navbar = new Navbar(page);
  await page.goto('/wishlist');
  await expect(page.getByRole('heading', { name: 'My Wishlist', level: 1 })).toBeVisible();
  await expect(navbar.login).toBeHidden();
});

test('TRV-0-SMK05 A signed-in customer opens Profile', async ({ page }) => {
  const navbar = new Navbar(page);
  await page.goto('/profile');
  await expect(navbar.wishlist).toBeVisible();
  await expect(page).toHaveURL(/\/profile$/);
});
