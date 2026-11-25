export class ProfilePage {
  constructor(page) {
    this.page = page;
    this.firstName = page.locator('input[name="first_name"]');
    this.lastName = page.locator('input[name="last_name"]');
    this.email = page.locator('input[name="email"]');
  }

  async open() {
    await this.page.goto('/profile');
  }
}
