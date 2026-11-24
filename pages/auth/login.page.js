export class LoginPage {
  constructor(page) {
    this.page = page;
    // The form's labels are not tied to their inputs, so fields go by autocomplete.
    this.email = page.locator('input[autocomplete="email"]');
    this.password = page.locator('input[autocomplete="current-password"]');
    this.submit = page.getByRole('button', { name: 'Sign In' });
  }

  async open() {
    await this.page.goto('/login');
  }
}
