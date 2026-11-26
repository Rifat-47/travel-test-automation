export class Navbar {
  constructor(page) {
    const nav = page.getByRole('navigation').first();
    this.login = nav.getByRole('link', { name: 'Login', exact: true });
    this.register = nav.getByRole('link', { name: 'Register', exact: true });
    this.wishlist = nav.getByRole('link', { name: 'My Wishlist' });
    this.userMenu = nav.getByRole('button', { name: 'User menu' });
    // The open account menu: the button's wrapper holds the dropdown.
    this.accountMenu = this.userMenu.locator('xpath=..');
    this.dashboard = nav.getByRole('link', { name: /Staff/ });
    this.logout = nav.getByRole('button', { name: 'Logout' });
    // The phone menu's button has no label; it is the last button of the phone-only bar.
    this.phoneMenu = nav.locator('.md\\:hidden').getByRole('button').last();
    this.logoutMessage = page.getByText('Logged out successfully', { exact: true });
  }

  async logOut() {
    await this.userMenu.click();
    await this.logout.click();
  }
}
