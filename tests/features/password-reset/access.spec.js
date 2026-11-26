import { madeUpLink } from '../../../data/resetLinks.js';
import { test, customerTest, expect } from '../../../fixtures/test.js';
import { ForgotPasswordPage } from '../../../pages/auth/forgot-password.page.js';
import { LoginPage } from '../../../pages/auth/login.page.js';
import { ResetPasswordPage } from '../../../pages/auth/reset-password.page.js';
import { Navbar } from '../../../pages/layout/navbar.page.js';

test('TRV-3-RST01 Forgot password opens from Login', async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
  await login.forgotPassword.click();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await expect(new ForgotPasswordPage(page).heading).toBeVisible();
});

test('TRV-3-RST02 Login opens from Forgot password', async ({ page }) => {
  const forgot = new ForgotPasswordPage(page);
  await forgot.open();
  await forgot.signIn.click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(new LoginPage(page).heading).toBeVisible();
});

test('TRV-3-RST03 The request form shows its field', async ({ page }) => {
  const forgot = new ForgotPasswordPage(page);
  await forgot.open();
  await expect(forgot.label).toHaveText('Email address *');
  await expect(forgot.email).toBeVisible();
  await expect(forgot.submit).toBeVisible();
  await expect(forgot.signIn).toBeVisible();
});

customerTest('TRV-3-RST04 A signed-in customer cannot open Forgot password', async ({ page }) => {
  const forgot = new ForgotPasswordPage(page);
  await forgot.open();
  await expect(page).toHaveURL('/');
  await expect(new Navbar(page).userMenu).toBeVisible();
  await expect(forgot.heading).toBeHidden();
});

customerTest('TRV-3-RST05 A signed-in customer cannot open a reset link', async ({ page }) => {
  const reset = new ResetPasswordPage(page);
  await reset.open(madeUpLink());
  await expect(page).toHaveURL('/');
  await expect(new Navbar(page).userMenu).toBeVisible();
  await expect(reset.heading).toBeHidden();
});
