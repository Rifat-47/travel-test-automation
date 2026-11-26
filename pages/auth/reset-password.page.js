export class ResetPasswordPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Set new password' });
    this.form = page.locator('form');
    // The form's labels are not tied to their inputs, so fields go by name.
    this.newPassword = this.#field('new_password');
    this.confirmPassword = this.#field('new_password2');
    this.submit = page.getByRole('button', { name: 'Reset Password' });
    this.resetting = page.getByRole('button', { name: 'Resetting…' });
    this.backToLogin = page.getByRole('link', { name: 'Back to login' });
    this.failureMessage = page.getByText('Something went wrong. Please try again.');
    this.networkMessage = page.getByText('Network error — check your connection and try again.');

    // The screens shown instead of the form.
    this.successHeading = page.getByRole('heading', { name: 'Password reset!' });
    this.signIn = page.getByRole('main').getByRole('link', { name: 'Sign in', exact: true });
    this.incompleteHeading = page.getByRole('heading', { name: 'Invalid reset link' });
    this.usedHeading = page.getByRole('heading', { name: 'Link expired or already used' });
    this.requestNewLink = page.getByRole('link', { name: 'Request a new link' });
  }

  #field(name) {
    const input = this.page.locator(`form input[name="${name}"]`);
    const block = input.locator('xpath=ancestor::div[label][1]');
    return {
      input,
      label: block.locator('label'),
      error: block.locator('> p'),
      toggle: block.getByRole('button', { name: /^(Show|Hide) password$/ }),
    };
  }

  /** Opens a reset link: { path } from an email, or a made-up { uid, token }. */
  async open(link) {
    await this.page.goto(link.path ?? `/reset-password?${new URLSearchParams(link)}`);
  }

  async fill(password, confirmPassword = password) {
    await this.newPassword.input.fill(password);
    await this.confirmPassword.input.fill(confirmPassword);
  }

  async reset(password, confirmPassword = password) {
    await this.fill(password, confirmPassword);
    await this.submit.click();
  }
}
