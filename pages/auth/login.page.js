export class LoginPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Welcome back' });
    this.form = page.locator('form');
    // The form's labels are not tied to their inputs, so fields go by autocomplete.
    this.email = page.locator('input[autocomplete="email"]');
    this.password = page.locator('input[autocomplete="current-password"]');
    this.labels = this.form.locator('label');
    // Each field's error is the <p> directly inside the field's block.
    this.emailError = this.form.locator('> div').nth(0).locator('> p');
    this.passwordError = this.form.locator('> div').nth(1).locator('> p');
    this.togglePassword = page.getByRole('button', { name: /^(Show|Hide) password$/ });
    this.submit = page.getByRole('button', { name: 'Sign In' });
    this.submitting = page.getByRole('button', { name: 'Signing in…' });
    this.forgotPassword = page.getByRole('link', { name: 'Forgot password?' });
    this.register = page.getByRole('main').getByRole('link', { name: 'Register', exact: true });
    this.invalidCredentials = page.getByText('Invalid credentials.', { exact: true });
    this.successMessage = page.getByText('Welcome back!', { exact: true });
    this.failureMessage = page.getByText('Login failed. Please try again.');
  }

  async open() {
    await this.page.goto('/login');
  }

  async signIn({ email, password }) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }

  /** Submits the details and returns the server's reply. */
  async signInAndGetResponse(details) {
    const [response] = await Promise.all([
      this.page.waitForResponse('**/api/v1/auth/login/'),
      this.signIn(details),
    ]);
    return response;
  }
}
