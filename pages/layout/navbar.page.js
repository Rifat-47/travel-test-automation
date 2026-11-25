export class Navbar {
  constructor(page) {
    const nav = page.getByRole('navigation').first();
    this.login = nav.getByRole('link', { name: 'Login', exact: true });
    this.register = nav.getByRole('link', { name: 'Register', exact: true });
    this.wishlist = nav.getByRole('link', { name: 'My Wishlist' });
    this.userMenu = nav.getByRole('button', { name: 'User menu' });
    this.logout = nav.getByRole('button', { name: 'Logout' });
  }

  async logOut() {
    await this.userMenu.click();
    await this.logout.click();
  }
}
