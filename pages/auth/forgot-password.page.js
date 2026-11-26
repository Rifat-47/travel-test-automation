export class ForgotPasswordPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Forgot password?' });
    this.form = page.locator('form');
    // The form's label is not tied to its input, so the field goes by autocomplete.
    this.email = page.locator('input[autocomplete="email"]');
    this.label = this.form.locator('label');
    this.emailError = this.form.locator('> div > p');
    this.submit = page.getByRole('button', { name: 'Send Reset Link' });
    this.sending = page.getByRole('button', { name: 'Sending…' });
    this.signIn = page.getByRole('main').getByRole('link', { name: 'Sign in', exact: true });
    this.failureMessage = page.getByText('Something went wrong. Please try again.');
    this.networkMessage = page.getByText('Network error — check your connection and try again.');

    // The screen shown once a link is requested.
    this.sentHeading = page.getByRole('heading', { name: 'Check your email' });
    this.sentText = page.getByText("If that email address is registered, we've sent");
    this.tryDifferentEmail = page.getByRole('button', { name: 'Try a different email' });
    this.backToLogin = page.getByRole('link', { name: 'Back to login' });
  }

  async open() {
    await this.page.goto('/forgot-password');
  }

  async request(email) {
    await this.email.fill(email);
    await this.submit.click();
  }
}
