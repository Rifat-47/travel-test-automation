import { newCustomer } from '../../../data/customers.js';
import { madeUpLink } from '../../../data/resetLinks.js';
import { test, expect } from '../../../fixtures/test.js';
import { LoginPage } from '../../../pages/auth/login.page.js';
import { ResetPasswordPage } from '../../../pages/auth/reset-password.page.js';

const RESET_API = '/api/v1/auth/password/reset/';

let reset;
let requests;

test.beforeEach(async ({ page }) => {
  reset = new ResetPasswordPage(page);
  requests = 0;
  page.on('request', (request) => {
    if (request.url().includes(RESET_API)) requests += 1;
  });
  await reset.open(madeUpLink());
});

test('TRV-3-RST24 The reset form shows its fields', async () => {
  await expect(reset.heading).toBeVisible();
  await expect(reset.newPassword.label).toHaveText('New password *');
  await expect(reset.confirmPassword.label).toHaveText('Confirm new password *');
  await expect(reset.newPassword.input).toBeVisible();
  await expect(reset.confirmPassword.input).toBeVisible();
  await expect(reset.submit).toBeVisible();
  await expect(reset.backToLogin).toBeVisible();
});

// Bug 1 in the test case file: with different passwords, the first show click is lost.
test.fail('TRV-3-RST25 Both passwords can be shown and hidden', async () => {
  await reset.fill(newCustomer().password, newCustomer().password);
  for (const [field, other] of [
    [reset.newPassword, reset.confirmPassword],
    [reset.confirmPassword, reset.newPassword],
  ]) {
    await expect(field.input).toHaveAttribute('type', 'password');
    await field.toggle.click();
    await expect(field.input).toHaveAttribute('type', 'text');
    await expect(other.input).toHaveAttribute('type', 'password');
    await field.toggle.click();
    await expect(field.input).toHaveAttribute('type', 'password');
  }
});

test('TRV-3-RST26 Back to login from the reset form', async ({ page }) => {
  await reset.backToLogin.click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(new LoginPage(page).heading).toBeVisible();
});

test('TRV-3-RST27 An empty form is rejected', async () => {
  await reset.submit.click();
  await expect(reset.newPassword.error).toHaveText('Password is required');
  await expect(reset.confirmPassword.error).toHaveText('Please confirm your password');
  expect(requests).toBe(0);
});

test('TRV-3-RST28 A short password is rejected', async () => {
  await reset.reset(newCustomer().password.slice(0, 7));
  await expect(reset.newPassword.error).toHaveText('Password must be at least 8 characters');
  expect(requests).toBe(0);
});

test('TRV-3-RST29 An all-digit password is rejected', async () => {
  await reset.reset('48207319');
  await expect(reset.newPassword.error).toHaveText('Password cannot be entirely numeric');
  expect(requests).toBe(0);
});

test('TRV-3-RST30 Different passwords are rejected', async () => {
  await reset.reset(newCustomer().password, newCustomer().password);
  await expect(reset.confirmPassword.error).toHaveText('Passwords do not match');
  expect(requests).toBe(0);
});

test('TRV-3-RST31 A common password is rejected by the server', async ({ page }) => {
  const [response] = await Promise.all([
    page.waitForResponse(`**${RESET_API}`),
    reset.reset('password123'),
  ]);
  expect(response.status()).toBe(400);
  await expect(reset.newPassword.error).toHaveText('This password is too common.');
  await expect(reset.heading).toBeVisible();
});
