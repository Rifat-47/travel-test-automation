import { newCustomer, newEmail } from '../../../data/customers.js';
import { test, expect } from '../../../fixtures/test.js';
import { RegisterPage } from '../../../pages/auth/register.page.js';
import { Navbar } from '../../../pages/layout/navbar.page.js';

let register;
let navbar;

test.beforeEach(async ({ page }) => {
  register = new RegisterPage(page);
  navbar = new Navbar(page);
  await register.open();
});

test('TRV-1-REG17 An empty form is rejected', async ({ page }) => {
  await register.submit.click();
  await expect(register.firstName.error).toHaveText('First name is required');
  await expect(register.lastName.error).toBeHidden();
  await expect(register.email.error).toHaveText('Email is required');
  await expect(register.password.error).toHaveText('Password is required');
  await expect(register.confirmPassword.error).toHaveText('Please confirm your password');
  await expect(page).toHaveURL(/\/register$/);
});

test('TRV-1-REG18 An error shows on leaving a field and clears once fixed', async () => {
  await register.firstName.input.focus();
  await register.firstName.input.blur();
  await expect(register.firstName.error).toHaveText('First name is required');
  await register.firstName.input.fill('Test');
  await expect(register.firstName.error).toBeHidden();
});

test('TRV-1-REG19 A first name of spaces is rejected', async () => {
  const response = await register.registerAndGetResponse(newCustomer({ firstName: '   ' }));
  expect(response.status()).toBe(400);
  await expect(register.firstName.error).toHaveText(/\S/);
  await expect(navbar.login).toBeVisible();
});

test('TRV-1-REG20 A malformed email is rejected', async () => {
  for (const email of ['plain', 'a@b', '@example.com', 'a b@example.com']) {
    await test.step(email, async () => {
      await register.email.input.fill(email);
      await register.email.input.blur();
      await expect(register.email.error).toHaveText('Enter a valid email address');
      // Clear the error so the next value has to raise it again.
      await register.email.input.fill(newEmail());
      await expect(register.email.error).toBeHidden();
    });
  }
});

test('TRV-1-REG21 An email with a one-letter ending is rejected', async () => {
  const email = newEmail().replace(/\.com$/, '.c');
  const response = await register.registerAndGetResponse(newCustomer({ email }));
  expect(response.status()).toBe(400);
  await expect(register.email.error).toHaveText('Enter a valid email address.');
  await expect(navbar.login).toBeVisible();
});

test('TRV-1-REG22 Names stop at 50 characters', async () => {
  for (const field of [register.firstName, register.lastName]) {
    await field.input.pressSequentially('a'.repeat(51));
    await expect(field.input).toHaveValue('a'.repeat(50));
    await expect(field.error).toHaveText('Maximum 50 characters reached');
  }
});

test('TRV-1-REG23 Email stops at 100 characters', async () => {
  const email = `${'a'.repeat(91)}@gmail.com`;
  await register.email.input.pressSequentially(email);
  await expect(register.email.input).toHaveValue(email.slice(0, 100));
  await expect(register.email.error).toHaveText('Maximum 100 characters reached');
});
