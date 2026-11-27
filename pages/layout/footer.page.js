export class Footer {
  constructor(page) {
    this.root = page.getByRole('contentinfo');
    this.socialLinks = this.root.locator('a[target="_blank"]');
    this.copyright = this.root.getByText(/^©/);
  }

  link(name) {
    return this.root.getByRole('link', { name, exact: true });
  }
}

/** The footer's Quick Links, with where they lead. */
export const FOOTER_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Destinations', path: '/destinations' },
  { name: 'Blog', path: '/blog' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact', path: '/contact' },
];
