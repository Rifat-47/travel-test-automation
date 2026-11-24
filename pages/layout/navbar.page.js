export class Navbar {
  constructor(page) {
    const nav = page.getByRole('navigation').first();
    this.login = nav.getByRole('link', { name: 'Login', exact: true });
    this.register = nav.getByRole('link', { name: 'Register', exact: true });
    this.wishlist = nav.getByRole('link', { name: 'My Wishlist' });
  }
}
