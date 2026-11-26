import { test, expect, readTokens } from '../../../fixtures/test.js';
import { ProfilePage } from '../../../pages/account/profile.page.js';
import { LoginPage } from '../../../pages/auth/login.page.js';
import { Navbar } from '../../../pages/layout/navbar.page.js';
import { refreshByApi } from '../../../services/authApi.js';

const LOGOUT_API = '**/api/v1/auth/logout/';
const PHONE = { width: 390, height: 844 };

let navbar;

test.beforeEach(async ({ page }) => {
  navbar = new Navbar(page);
});

// Bug 2 in the test case file: logout on a customer page lands on Login.
test.fail('TRV-2-LOG32 Log out from the account menu', async ({ page, signedIn }) => {
  await signedIn('/profile');
  await navbar.logOut();
  await expect(navbar.logoutMessage).toBeVisible();
  await expect(page).toHaveURL('/');
  await expect(navbar.login).toBeVisible();
  await expect(navbar.register).toBeVisible();
});

test('TRV-2-LOG33 Log out from the phone menu', async ({ page, signedIn }) => {
  await page.setViewportSize(PHONE);
  await signedIn('/');
  await navbar.phoneMenu.click();
  await navbar.logout.click();
  await expect(navbar.logoutMessage).toBeVisible();
  await navbar.phoneMenu.click();
  await expect(navbar.login).toBeVisible();
  expect(await readTokens(page)).toEqual({ access: null, refresh: null });
});

test('TRV-2-LOG34 Customer pages are closed after logout', async ({ page, signedIn }) => {
  await signedIn('/');
  await navbar.logOut();
  await expect(navbar.logoutMessage).toBeVisible();
  await new ProfilePage(page).open();
  await expect(page).toHaveURL(/\/login$/);
});

test('TRV-2-LOG35 Back does not reopen a customer page', async ({ page, signedIn }) => {
  const profile = new ProfilePage(page);
  await signedIn('/profile');
  await expect(profile.email).toBeVisible();
  await navbar.logOut();
  await expect(navbar.logoutMessage).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/login$/);
  // Login's own email field shares Profile's field name, so check for Login itself.
  await expect(new LoginPage(page).heading).toBeVisible();
});

test('TRV-2-LOG36 Logout stays after a reload', async ({ page, signedIn }) => {
  await signedIn('/');
  await navbar.logOut();
  await expect(navbar.logoutMessage).toBeVisible();
  await page.reload();
  await expect(navbar.login).toBeVisible();
  await expect(navbar.userMenu).toBeHidden();
});

test('TRV-2-LOG37 Logout reaches other open tabs', async ({ context, signedIn }) => {
  await signedIn('/profile');
  const other = await context.newPage();
  await new ProfilePage(other).open();
  await expect(new ProfilePage(other).email).toBeVisible();

  await navbar.logOut();
  await expect(navbar.logoutMessage).toBeVisible();
  await expect(other).toHaveURL(/\/login$/);
});

test('TRV-2-LOG38 Logout works when the server fails', async ({ page, signedIn }) => {
  await signedIn('/');
  await page.route(LOGOUT_API, (route) =>
    route.fulfill({ status: 500, contentType: 'text/html', body: '<h1>Server Error (500)</h1>' }),
  );
  await navbar.logOut();
  await expect(navbar.login).toBeVisible();
  expect(await readTokens(page)).toEqual({ access: null, refresh: null });
});

test('TRV-2-LOG39 A logged-out session cannot be renewed', async ({ page, request, signedIn }) => {
  const { refresh } = await signedIn('/');
  const [logout] = await Promise.all([page.waitForResponse(LOGOUT_API), navbar.logOut()]);
  expect(logout.status()).toBe(200);

  const renewal = await refreshByApi(request, refresh);
  expect(renewal.status()).toBe(401);
  expect(await renewal.json()).not.toHaveProperty('access');
});
