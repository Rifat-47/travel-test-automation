import { newCustomer } from '../../../data/customers.js';
import { expiredAccessToken, invalidRefreshToken } from '../../../data/tokens.js';
import { test, customerTest, expect, readTokens, storeTokens } from '../../../fixtures/test.js';
import { ProfilePage } from '../../../pages/account/profile.page.js';
import { LoginPage } from '../../../pages/auth/login.page.js';
import { Navbar } from '../../../pages/layout/navbar.page.js';
import { registerByApi } from '../../../services/authApi.js';

customerTest('TRV-2-LOG27 The session survives a reload', async ({ page }) => {
  const navbar = new Navbar(page);
  await page.goto('/');
  await expect(navbar.userMenu).toBeVisible();
  await page.reload();
  await expect(navbar.userMenu).toBeVisible();
  await expect(navbar.login).toBeHidden();
});

customerTest('TRV-2-LOG28 The session is shared with a new tab', async ({ page, context }) => {
  await page.goto('/');
  await expect(new Navbar(page).userMenu).toBeVisible();
  const tab = await context.newPage();
  await new ProfilePage(tab).open();
  await expect(tab).toHaveURL(/\/profile$/);
  await expect(new ProfilePage(tab).email).toHaveValue(/@/);
});

test('TRV-2-LOG29 Signing in shows in other open tabs', async ({ page, context, request }) => {
  const customer = newCustomer();
  await registerByApi(request, customer);
  const other = await context.newPage();
  await page.goto('/');
  await other.goto('/');
  await expect(new Navbar(other).login).toBeVisible();

  const login = new LoginPage(page);
  await login.open();
  await login.signIn(customer);
  await expect(new Navbar(page).userMenu).toBeVisible();
  await expect(new Navbar(other).userMenu).toBeVisible();
});

// Bug 3 in the test case file: renewal signs the customer out in most runs, not all,
// so test.fail would be flaky. Skipped until it is fixed.
test.fixme('TRV-2-LOG30 An expired sign-in is renewed quietly', async ({ page, signedIn }) => {
  const customer = await signedIn('/');
  await storeTokens(page, { access: expiredAccessToken(), refresh: customer.refresh });
  const profile = new ProfilePage(page);
  // The dev build starts the app twice, so a second renewal with the same token may be
  // refused; what matters is that one renewal succeeds and the customer stays signed in.
  const renewed = page.waitForResponse(
    (response) => response.url().includes('/api/v1/auth/token/refresh/') && response.ok(),
  );
  await profile.open();
  await renewed;
  await expect(page).toHaveURL(/\/profile$/);
  await expect(profile.email).toHaveValue(customer.email);
  await expect(new Navbar(page).userMenu).toBeVisible();
});

test('TRV-2-LOG31 A sign-in that cannot be renewed ends the session', async ({
  page,
  signedIn,
}) => {
  await signedIn('/');
  await storeTokens(page, { access: expiredAccessToken(), refresh: invalidRefreshToken() });
  await new ProfilePage(page).open();
  await expect(page).toHaveURL(/\/login$/);
  await expect(new Navbar(page).login).toBeVisible();
  expect(await readTokens(page)).toEqual({ access: null, refresh: null });
});
