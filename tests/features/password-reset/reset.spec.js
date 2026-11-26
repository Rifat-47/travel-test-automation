import { testConfig } from '../../../config/test.config.js';
import { newCustomer } from '../../../data/customers.js';
import { test, expect } from '../../../fixtures/test.js';
import { LoginPage } from '../../../pages/auth/login.page.js';
import { ResetPasswordPage } from '../../../pages/auth/reset-password.page.js';
import { Navbar } from '../../../pages/layout/navbar.page.js';
import {
  refreshByApi,
  registerByApi,
  requestResetByApi,
  resetPasswordByApi,
  tryLoginByApi,
} from '../../../services/authApi.js';
import { resetLinkIn, waitForEmail, waitForEmails } from '../../../services/mailbox.js';

// Every test here waits for a real email.
test.describe.configure({ timeout: testConfig.timeouts.emailTest });

let reset;

test.beforeEach(async ({ page }) => {
  reset = new ResetPasswordPage(page);
});

/** Registers a customer, asks for one reset link and returns { customer, link, session }. */
async function customerWithLink(request) {
  const customer = newCustomer();
  const session = await registerByApi(request, customer);
  const since = new Date();
  await requestResetByApi(request, customer.email);
  const link = resetLinkIn(await waitForEmail(customer.email, { since }));
  return { customer, link, session };
}

test('TRV-3-RST19 Reset the password with the emailed link', async ({ page, request }) => {
  const { customer, link } = await customerWithLink(request);
  const newPassword = newCustomer().password;
  await reset.open(link);
  await reset.reset(newPassword);
  await expect(reset.successHeading).toBeVisible();
  await reset.signIn.click();
  await expect(page).toHaveURL(/\/login$/);

  const login = new LoginPage(page);
  expect((await login.signInAndGetResponse(customer)).status()).toBe(401);
  await expect(login.invalidCredentials).toBeVisible();
  await login.signIn({ ...customer, password: newPassword });
  await expect(new Navbar(page).userMenu).toBeVisible();
});

test('TRV-3-RST20 A link works only once', async ({ page, request }) => {
  const { link } = await customerWithLink(request);
  await resetPasswordByApi(request, link, newCustomer().password);
  await reset.open(link);
  await reset.reset(newCustomer().password);
  await expect(reset.usedHeading).toBeVisible();
  await reset.requestNewLink.click();
  await expect(page).toHaveURL(/\/forgot-password$/);
});

test('TRV-3-RST21 Earlier links stop working after a reset', async ({ request }) => {
  const customer = newCustomer();
  await registerByApi(request, customer);
  const since = new Date();
  await requestResetByApi(request, customer.email);
  await requestResetByApi(request, customer.email);
  const [first, second] = (await waitForEmails(customer.email, { since, count: 2 })).map(
    resetLinkIn,
  );
  await resetPasswordByApi(request, second, newCustomer().password);

  await reset.open(first);
  await reset.reset(newCustomer().password);
  await expect(reset.usedHeading).toBeVisible();
});

// Bug 2 in the test case file: a reset does not end earlier sign-ins.
test.fail('TRV-3-RST22 A sign-in from before the reset cannot be renewed', async ({ request }) => {
  // session is the sign-in the customer got on registering, as if in another browser.
  const { link, session } = await customerWithLink(request);
  await reset.open(link);
  await reset.reset(newCustomer().password);
  await expect(reset.successHeading).toBeVisible();

  const renewal = await refreshByApi(request, session.refresh);
  expect(renewal.status()).toBe(401);
  expect(await renewal.json()).not.toHaveProperty('access');
});

// Bug 3 in the test case file: spaces around a new password are dropped.
test.fail('TRV-3-RST23 Spaces around the new password are kept', async ({ request }) => {
  const { customer, link } = await customerWithLink(request);
  const newPassword = `${newCustomer().password} `;
  await reset.open(link);
  await reset.reset(newPassword);
  await expect(reset.successHeading).toBeVisible();

  const withSpace = await tryLoginByApi(request, { ...customer, password: newPassword });
  expect(withSpace.status()).toBe(200);
  const withoutSpace = await tryLoginByApi(request, {
    ...customer,
    password: newPassword.trimEnd(),
  });
  expect(withoutSpace.status()).toBe(401);
});
