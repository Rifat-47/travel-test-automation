import { test, expect } from '../../../fixtures/test.js';
import { ProfilePage } from '../../../pages/account/profile.page.js';
import { Navbar, PAGE_LINKS } from '../../../pages/layout/navbar.page.js';
import { PHONE } from '../../../data/viewports.js';

test.use({ viewport: PHONE });

test('TRV-4-NAV16 The links move into the menu', async ({ page }) => {
  const navbar = new Navbar(page);
  await page.goto('/');
  await expect(navbar.siteName).toBeVisible();
  await expect(navbar.themeButton).toBeVisible();
  await expect(navbar.phoneMenu).toBeVisible();
  for (const { name } of PAGE_LINKS) await expect(navbar.link(name)).toBeHidden();
  await expect(navbar.login).toBeHidden();
  await expect(navbar.register).toBeHidden();
});

test('TRV-4-NAV17 The menu shows the guest links', async ({ page }) => {
  const navbar = new Navbar(page);
  await page.goto('/');
  await navbar.phoneMenu.click();
  for (const { name } of PAGE_LINKS) await expect(navbar.link(name)).toBeVisible();
  await expect(navbar.login).toBeVisible();
  await expect(navbar.register).toBeVisible();
});

test('TRV-4-NAV18 A link opens its page and closes the menu', async ({ page }) => {
  const navbar = new Navbar(page);
  await page.goto('/');
  await navbar.phoneMenu.click();
  await navbar.link('Blog').click();
  await expect(page).toHaveURL('/blog');
  await expect(navbar.login).toBeHidden();
});

test('TRV-4-NAV19 The menu button opens and closes it', async ({ page }) => {
  const navbar = new Navbar(page);
  await page.goto('/');
  await navbar.phoneMenu.click();
  await expect(navbar.login).toBeVisible();
  await navbar.phoneMenu.click();
  await expect(navbar.login).toBeHidden();
});

test('TRV-4-NAV20 The menu shows the customer and its links', async ({ page, signedIn }) => {
  const navbar = new Navbar(page);
  const customer = await signedIn('/', { firstName: 'Nora', lastName: 'Vance' });
  await navbar.phoneMenu.click();
  await expect(navbar.bar.getByText('Nora Vance', { exact: true })).toBeVisible();
  await expect(navbar.bar.getByText(customer.email, { exact: true })).toBeVisible();
  await expect(navbar.wishlist).toBeVisible();
  await expect(navbar.profile).toBeVisible();
  await expect(navbar.myBookings).toBeVisible();
  await expect(navbar.logout).toBeVisible();
  await expect(navbar.login).toBeHidden();
  await expect(navbar.register).toBeHidden();
});

// Bug 5 in the test case file: My Bookings does nothing when Profile is already open.
test.fail('TRV-4-NAV21 The customer links open their pages', async ({ page, signedIn }) => {
  const navbar = new Navbar(page);
  const profile = new ProfilePage(page);
  await signedIn('/');

  await navbar.phoneMenu.click();
  await navbar.wishlist.click();
  await expect(page).toHaveURL('/wishlist');

  await navbar.phoneMenu.click();
  await navbar.profile.click();
  await expect(page).toHaveURL('/profile');
  await expect(profile.firstName).toBeVisible();

  await navbar.phoneMenu.click();
  await navbar.myBookings.click();
  await expect(page).toHaveURL('/profile');
  await expect(page.getByText('No bookings yet.', { exact: true })).toBeVisible();
  await expect(profile.firstName).toBeHidden();
});

// Bug 3 in the test case file: the menu button has no accessible name.
test.fail('TRV-4-NAV40 The menu button has a name', async ({ page }) => {
  const navbar = new Navbar(page);
  await page.goto('/');
  await expect(navbar.namedPhoneMenu).toBeVisible();
});
