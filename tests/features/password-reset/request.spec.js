import { testConfig } from '../../../config/test.config.js';
import { newCustomer, newEmail } from '../../../data/customers.js';
import { test, expect } from '../../../fixtures/test.js';
import { ForgotPasswordPage } from '../../../pages/auth/forgot-password.page.js';
import { LoginPage } from '../../../pages/auth/login.page.js';
import { ResetPasswordPage } from '../../../pages/auth/reset-password.page.js';
import { registerByApi } from '../../../services/authApi.js';
import { countEmailsAfterWaiting, resetLinkIn, waitForEmail } from '../../../services/mailbox.js';

// TRV-3-RST12 (the hourly limit) is checked by hand only.

let forgot;

test.beforeEach(async ({ page }) => {
  forgot = new ForgotPasswordPage(page);
  await forgot.open();
});

test('TRV-3-RST06 Request a link for a registered email', async ({ page, request }) => {
  test.setTimeout(testConfig.timeouts.emailTest);
  const customer = newCustomer({ firstName: 'Ayesha', lastName: 'Karim' });
  await registerByApi(request, customer);
  const since = new Date();

  await forgot.request(customer.email);
  await expect(forgot.sentHeading).toBeVisible();
  await expect(forgot.sentText).toBeVisible();

  const email = await waitForEmail(customer.email, { since });
  expect(email.to).toEqual([customer.email]);
  expect(email.subject).toMatch(/^Reset your password — \S/);
  expect(email.text).toContain('Ayesha Karim');
  expect(email.text).toMatch(/expires in \d+ hours?/);
  expect(email.text).toContain('Reset My Password');

  const reset = new ResetPasswordPage(page);
  await reset.open(resetLinkIn(email));
  await expect(reset.heading).toBeVisible();
});

test('TRV-3-RST07 An unregistered email gets the same screen', async () => {
  test.setTimeout(testConfig.timeouts.emailTest);
  const email = newEmail();
  const since = new Date();
  await forgot.request(email);
  await expect(forgot.sentHeading).toBeVisible();
  await expect(forgot.sentText).toBeVisible();
  expect(await countEmailsAfterWaiting(email, { since })).toBe(0);
});

test('TRV-3-RST08 The email is not case-sensitive', async ({ request }) => {
  test.setTimeout(testConfig.timeouts.emailTest);
  const customer = newCustomer();
  await registerByApi(request, customer);
  const since = new Date();
  await forgot.request(customer.email.toUpperCase());
  await expect(forgot.sentHeading).toBeVisible();
  const email = await waitForEmail(customer.email, { since });
  expect(email.to).toEqual([customer.email]);
});

test('TRV-3-RST09 Enter submits the form', async () => {
  await forgot.email.fill(newEmail());
  await forgot.email.press('Enter');
  await expect(forgot.sentHeading).toBeVisible();
});

test('TRV-3-RST10 Try a different email returns to the form', async () => {
  await forgot.request(newEmail());
  await expect(forgot.sentHeading).toBeVisible();
  await forgot.tryDifferentEmail.click();
  await expect(forgot.heading).toBeVisible();
  await expect(forgot.email).toBeVisible();
  await expect(forgot.submit).toBeVisible();
});

test('TRV-3-RST11 Back to login from the sent screen', async ({ page }) => {
  await forgot.request(newEmail());
  await expect(forgot.sentHeading).toBeVisible();
  await forgot.backToLogin.click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(new LoginPage(page).heading).toBeVisible();
});
