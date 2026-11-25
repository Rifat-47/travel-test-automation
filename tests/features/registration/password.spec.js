import { newCustomer } from '../../../data/customers.js';
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

test('TRV-1-REG24 A 7-character password is rejected', async () => {
  await register.password.input.fill('Abc!23x');
  await register.password.input.blur();
  await expect(register.password.error).toHaveText('Password must be at least 8 characters');
});

test('TRV-1-REG25 A numeric password is rejected', async () => {
  await register.password.input.fill('8264917350');
  await register.password.input.blur();
  await expect(register.password.error).toHaveText('Password cannot be entirely numeric');
});

test('TRV-1-REG26 A common password is rejected', async () => {
  const response = await register.registerAndGetResponse(newCustomer({ password: 'password123' }));
  expect(response.status()).toBe(400);
  await expect(register.password.error).toHaveText('This password is too common.');
  await expect(navbar.login).toBeVisible();
});

test('TRV-1-REG27 A password of spaces is rejected', async () => {
  const response = await register.registerAndGetResponse(newCustomer({ password: ' '.repeat(8) }));
  expect(response.status()).toBe(400);
  await expect(register.password.error).toHaveText(/\S/);
  await expect(navbar.login).toBeVisible();
});

test('TRV-1-REG28 Different passwords are rejected', async ({ page }) => {
  const customer = newCustomer();
  await register.register({ ...customer, confirmPassword: `${customer.password}x` });
  await expect(register.confirmPassword.error).toHaveText('Passwords do not match');
  await expect(page).toHaveURL(/\/register$/);
});

test('TRV-1-REG29 Changing the password after confirming is caught', async ({ page }) => {
  const customer = newCustomer();
  await register.fill(customer);
  await register.password.input.fill(`${customer.password}x`);
  await register.submit.click();
  // The case does not say which password field carries the message.
  await expect(register.mismatchMessage).toBeVisible();
  await expect(page).toHaveURL(/\/register$/);
  await expect(navbar.login).toBeVisible();
});

test('TRV-1-REG30 Each password can be shown and hidden', async () => {
  const { password, confirmPassword } = register;
  // Matching values: TRV-1-REG37 covers a mismatch.
  await password.input.fill('Same-value1');
  await confirmPassword.input.fill('Same-value1');
  await expect(password.input).toHaveAttribute('type', 'password');
  await expect(confirmPassword.input).toHaveAttribute('type', 'password');

  for (const [field, other] of [
    [password, confirmPassword],
    [confirmPassword, password],
  ]) {
    await field.toggle.click();
    await expect(field.input).toHaveAttribute('type', 'text');
    await expect(other.input).toHaveAttribute('type', 'password');
    await field.toggle.click();
    await expect(field.input).toHaveAttribute('type', 'password');
    await expect(other.input).toHaveAttribute('type', 'password');
  }
});

// Expected to fail until bug 1 is fixed: the mismatch error moves the form and the click is lost.
test.fail('TRV-1-REG37 A password can be shown while the passwords differ', async () => {
  const { password, confirmPassword } = register;
  await password.input.fill('First-value1');
  await confirmPassword.input.fill('Second-value2');
  await password.toggle.click();
  await expect(password.input).toHaveAttribute('type', 'text');
});
