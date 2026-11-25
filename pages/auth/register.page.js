import { testConfig } from '../../config/test.config.js';

export class RegisterPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Create an account' });
    // The form's labels are not tied to their inputs, so fields go by name.
    this.firstName = this.#field('first_name');
    this.lastName = this.#field('last_name');
    this.email = this.#field('email');
    this.password = this.#field('password');
    this.confirmPassword = this.#field('password2');
    this.submit = page.getByRole('button', { name: 'Create Account', exact: true });
    this.submitting = page.getByRole('button', { name: 'Creating account…' });
    this.signIn = page.getByRole('link', { name: 'Sign in', exact: true });
    this.mismatchMessage = page.getByText('Passwords do not match');
    this.successMessage = page.getByText('Account created! Welcome aboard.');
    this.failureMessage = page.getByText('Registration failed. Please try again.');
  }

  #field(name) {
    const input = this.page.locator(`form input[name="${name}"]`);
    const block = input.locator('xpath=ancestor::div[label][1]');
    return {
      input,
      label: block.locator('label'),
      error: block.locator('p'),
      toggle: block.getByRole('button', { name: /^(Show|Hide) password$/ }),
    };
  }

  async open() {
    await this.page.goto('/register');
  }

  async fill({ firstName, lastName, email, password, confirmPassword = password }) {
    await this.firstName.input.fill(firstName);
    await this.lastName.input.fill(lastName);
    await this.email.input.fill(email);
    await this.password.input.fill(password);
    await this.confirmPassword.input.fill(confirmPassword);
  }

  async register(details) {
    await this.fill(details);
    await this.submit.click();
  }

  /** Submits the details and returns the server's reply. */
  async registerAndGetResponse(details) {
    await this.fill(details);
    const [response] = await Promise.all([
      this.page.waitForResponse('**/api/v1/auth/register/', {
        timeout: testConfig.timeouts.registration,
      }),
      this.submit.click(),
    ]);
    return response;
  }
}
