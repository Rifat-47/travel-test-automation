/** A section of Home, found by its second-level heading. */
function sectionTitled(page, heading) {
  return page
    .getByRole('main')
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: heading, level: 2, exact: true }) });
}

export class HomePage {
  constructor(page) {
    this.page = page;
    const main = page.getByRole('main');
    this.heroHeading = main.getByRole('heading', { level: 1 });
    // The line under the hero heading.
    this.heroText = main.locator('section').first().locator('p').first();
    this.exploreDestinations = main.getByRole('link', { name: 'Explore Destinations' });
    this.getInTouch = main.getByRole('link', { name: 'Get in Touch' });
    this.description = page.locator('head meta[name="description"]');
  }

  async open() {
    await this.page.goto('/');
  }

  /** The featured destinations section, under the heading from the site settings. */
  featured(heading) {
    const section = sectionTitled(this.page, heading);
    return {
      section,
      viewAll: section.getByRole('link', { name: 'View all →' }),
      cards: section.locator('a[href^="/destinations/"]'),
    };
  }

  /** The "Why Travel With Us?" section. */
  features() {
    const section = sectionTitled(this.page, 'Why Travel With Us?');
    return { section, titles: section.getByRole('heading', { level: 3 }) };
  }

  /** The latest posts section, under the heading from the site settings. */
  blog(heading) {
    const section = sectionTitled(this.page, heading);
    return {
      section,
      viewAll: section.getByRole('link', { name: 'View all →' }),
      cards: section.locator('a[href^="/blog/"]'),
    };
  }
}

/** The parts of a destination card. */
export function destinationCard(card) {
  return {
    picture: card.locator('img'),
    name: card.getByRole('heading', { level: 3 }),
    featuredBadge: card.getByText('Featured', { exact: true }),
    saveButton: card.getByRole('button', { name: /wishlist/ }),
  };
}
