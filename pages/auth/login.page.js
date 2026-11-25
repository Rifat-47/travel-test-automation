export class LoginPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Welcome back' });
    // The form's labels are not tied to their inputs, so fields go by autocomplete.
    this.email = page.locator('input[autocomplete="email"]');
    this.password = page.locator('input[autocomplete="current-password"]');
    this.submit = page.getByRole('button', { name: 'Sign In' });
    this.register = page.getByRole('main').getByRole('link', { name: 'Register', exact: true });
  }

  async open() {
    await this.page.goto('/login');
  }

  async signIn({ email, password }) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
