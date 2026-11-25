export class DestinationsPage {
  constructor(page) {
    this.page = page;
    this.firstDestination = page.locator('main a[href^="/destinations/"]').first();
    // On a destination's details page.
    this.registerPrompt = page.getByRole('link', { name: "Don't have an account? Register" });
  }

  async open() {
    await this.page.goto('/destinations');
  }
}
