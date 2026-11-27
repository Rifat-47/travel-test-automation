import { customerTest, test, expect } from '../../../fixtures/test.js';
import { ProfilePage } from '../../../pages/account/profile.page.js';
import { Navbar } from '../../../pages/layout/navbar.page.js';

// Shared-session tests: open Home signed in and return the top bar.
async function openHome(page) {
  await page.goto('/');
  return new Navbar(page);
}

customerTest('TRV-4-NAV09 A customer sees the wishlist and account menu', async ({ page }) => {
  const navbar = await openHome(page);
  await expect(navbar.wishlist).toBeVisible();
  await expect(navbar.userMenu).toBeVisible();
  await expect(navbar.login).toBeHidden();
  await expect(navbar.register).toBeHidden();
  await expect(navbar.dashboard).toBeHidden();
});

customerTest('TRV-4-NAV10 The wishlist button opens Wishlist', async ({ page }) => {
  const navbar = await openHome(page);
  await navbar.wishlist.click();
  await expect(page).toHaveURL('/wishlist');
  await expect(page.getByRole('heading', { name: 'My Wishlist', level: 1 })).toBeVisible();
});

test('TRV-4-NAV11 The menu shows the customer and its links', async ({ page, signedIn }) => {
  const navbar = new Navbar(page);
  const customer = await signedIn('/', { firstName: 'Nora', lastName: 'Vance' });
  await navbar.userMenu.click();
  const menu = navbar.accountMenu;
  await expect(menu.getByText('NV', { exact: true }).first()).toBeVisible();
  await expect(menu.getByText('Nora Vance', { exact: true })).toBeVisible();
  await expect(menu.getByText(customer.email, { exact: true })).toBeVisible();
  await expect(navbar.profile).toBeVisible();
  await expect(navbar.myBookings).toBeVisible();
  await expect(navbar.logout).toBeVisible();
  await expect(navbar.dashboard).toBeHidden();
});

test('TRV-4-NAV12 Profile opens from the menu', async ({ page, signedIn }) => {
  const navbar = new Navbar(page);
  await signedIn('/');
  await navbar.userMenu.click();
  await navbar.profile.click();
  await expect(page).toHaveURL('/profile');
  await expect(new ProfilePage(page).firstName).toBeVisible();
  await expect(navbar.logout).toBeHidden();
});

test('TRV-4-NAV13 My Bookings opens from the menu', async ({ page, signedIn }) => {
  const navbar = new Navbar(page);
  await signedIn('/');
  await navbar.userMenu.click();
  await navbar.myBookings.click();
  await expect(page).toHaveURL('/profile');
  await expect(page.getByText('No bookings yet.', { exact: true })).toBeVisible();
  await expect(new ProfilePage(page).firstName).toBeHidden();
  await expect(navbar.logout).toBeHidden();
});

// Bug 5 in the test case file: My Bookings does nothing when Profile is already open.
test.fail('TRV-4-NAV41 My Bookings opens from Profile', async ({ page, signedIn }) => {
  const navbar = new Navbar(page);
  const profile = new ProfilePage(page);
  await signedIn('/profile');
  await expect(profile.firstName).toBeVisible();
  await navbar.userMenu.click();
  await navbar.myBookings.click();
  await expect(page.getByText('No bookings yet.', { exact: true })).toBeVisible();
  await expect(profile.firstName).toBeHidden();
});

customerTest('TRV-4-NAV14 The menu closes when clicking elsewhere', async ({ page }) => {
  const navbar = await openHome(page);
  await navbar.userMenu.click();
  await expect(navbar.logout).toBeVisible();
  await page.getByRole('main').click({ position: { x: 5, y: 5 } });
  await expect(navbar.logout).toBeHidden();
});

customerTest('TRV-4-NAV15 The menu button opens and closes it', async ({ page }) => {
  const navbar = await openHome(page);
  await navbar.userMenu.click();
  await expect(navbar.logout).toBeVisible();
  await navbar.userMenu.click();
  await expect(navbar.logout).toBeHidden();
});
