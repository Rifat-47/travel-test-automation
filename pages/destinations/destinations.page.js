/** The list that follows a filter's heading in the filter panel. */
const listUnder = (panel, heading) =>
  panel.getByText(heading, { exact: true }).locator('xpath=following-sibling::select');

export class DestinationsPage {
  constructor(page) {
    this.page = page;
    const main = page.getByRole('main');
    this.firstDestination = page.locator('main a[href^="/destinations/"]').first();
    // On a destination's details page.
    this.registerPrompt = page.getByRole('link', { name: "Don't have an account? Register" });
    this.loginToBook = page.getByRole('link', { name: 'Login to Book' });

    this.heading = main.getByRole('heading', { level: 1 });
    this.subheading = this.heading.locator('xpath=following-sibling::p');
    this.listButton = main.getByRole('button', { name: 'List', exact: true });
    this.mapButton = main.getByRole('button', { name: 'Map', exact: true });

    this.searchBox = main.getByPlaceholder('Search destinations...');
    this.searchButton = main.getByRole('button', { name: 'Search', exact: true });
    this.clearSearch = main.getByRole('button', { name: 'Clear search' });

    this.filters = main.locator('aside');
    // Desktop shows a heading; a phone shows a button that folds the filters.
    this.filtersHeading = this.filters.getByRole('heading', { name: /^Filters/ });
    this.filtersToggle = this.filters.getByRole('button', { name: /^Filters/ });
    this.sortBy = listUnder(this.filters, 'Sort by');
    this.category = listUnder(this.filters, 'Category');
    this.country = listUnder(this.filters, 'Country');
    this.minPrice = this.filters.getByPlaceholder('Min');
    this.maxPrice = this.filters.getByPlaceholder('Max');
    this.featuredText = this.filters.getByText('Featured only', { exact: true });
    // The small switch next to the words.
    this.featuredSwitch = this.featuredText.locator('xpath=preceding-sibling::div');
    this.clearFilters = this.filters.getByRole('button', { name: 'Clear all filters' });

    this.resultCount = main.getByText(/^(\d+ destinations? found|Loading…)$/);
    this.noResults = main.getByText('No destinations match your criteria.');
    this.loadError = main.getByText('Failed to load destinations. Please try again.');
    this.cards = main.locator('a[href^="/destinations/"]').filter({ has: page.locator('h3') });
    this.cardNames = this.cards.locator('h3');

    this.previous = main.getByRole('button', { name: 'Previous', exact: true });
    this.next = main.getByRole('button', { name: 'Next', exact: true });
    this.pagination = this.previous.locator('..');
    this.pageButtons = this.pagination.getByRole('button', { name: /^\d+$/ });

    this.map = main.locator('.leaflet-container');
    this.pins = main.locator('.leaflet-marker-icon');
    this.popup = main.locator('.leaflet-popup-content');
    this.popupName = this.popup.locator('p').first();
  }

  /** A page button, by its number. */
  numberButton(number) {
    return this.pagination.getByRole('button', { name: String(number), exact: true });
  }

  /**
   * Opens Destinations with this address query (for example '?category=beach') and waits
   * until it has settled: shortly after loading, the page adds page=1 to the address.
   */
  async open(query = '') {
    await this.page.goto(`/destinations${query}`);
    await this.settle();
  }

  async settle() {
    await this.page.waitForURL(/[?&]page=1(&|$)/);
    await this.page
      .getByRole('main')
      .getByText(/^\d+ destinations? found$/)
      .waitFor();
  }

  /** Types a search and clicks Search. */
  async search(text) {
    await this.searchBox.fill(text);
    await this.searchButton.click();
  }
}

/** For toHaveURL: the address has key set to value, or no key when value is null. */
export const addressHas = (key, value) => (url) => url.searchParams.get(key) === value;
