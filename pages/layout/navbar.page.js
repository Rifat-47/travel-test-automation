export class Navbar {
  constructor(page) {
    const nav = page.getByRole('navigation').first();
    this.bar = nav;
    // The site name, always the bar's first link.
    this.siteName = nav.getByRole('link').first();
    this.login = nav.getByRole('link', { name: 'Login', exact: true });
    this.register = nav.getByRole('link', { name: 'Register', exact: true });
    this.wishlist = nav.getByRole('link', { name: 'My Wishlist' });
    this.userMenu = nav.getByRole('button', { name: 'User menu' });
    // The open account menu: the button's wrapper holds the dropdown.
    this.accountMenu = this.userMenu.locator('xpath=..');
    this.dashboard = nav.getByRole('link', { name: /Staff/ });
    this.profile = nav.getByRole('link', { name: 'Profile', exact: true });
    this.myBookings = nav.getByRole('link', { name: 'My Bookings', exact: true });
    this.logout = nav.getByRole('button', { name: 'Logout' });
    // The desktop and phone bars each have one; only the one for the window size is shown.
    this.themeButton = nav.getByRole('button', { name: 'Toggle theme' });
    this.currentPageLink = nav.locator('a[aria-current="page"]');
    // The phone menu's button has no label; it is the last button of the phone-only bar.
    this.phoneMenu = nav.locator('.md\\:hidden').getByRole('button').last();
    this.namedPhoneMenu = nav.getByRole('button', { name: /menu/i });
    this.logoutMessage = page.getByText('Logged out successfully', { exact: true });
  }

  /** A page link (Destinations, Blog, About, Contact) in the bar or the open phone menu. */
  link(name) {
    return this.bar.getByRole('link', { name, exact: true });
  }

  async logOut() {
    await this.userMenu.click();
    await this.logout.click();
  }
}

/** The page links in the top bar, with where they lead. */
export const PAGE_LINKS = [
  { name: 'Destinations', path: '/destinations' },
  { name: 'Blog', path: '/blog' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];
