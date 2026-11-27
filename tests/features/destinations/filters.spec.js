import { test, expect } from '../../../fixtures/test.js';
import { names } from '../../../data/destinations.js';
import { addressHas, DestinationsPage } from '../../../pages/destinations/destinations.page.js';
import {
  allDestinations,
  destinationCategories,
  destinationCountries,
} from '../../../services/siteApi.js';

/** Opens Destinations; returns the page and every destination, newest first. */
async function openDestinations(page, request) {
  const all = await allDestinations(request);
  const destinations = new DestinationsPage(page);
  await destinations.open();
  return { destinations, all };
}

const price = (d) => Number(d.starting_price);

/** A starting price in the middle of the site's prices, so some are above it and some below. */
const middlePrice = (all) => {
  const prices = all.map(price).toSorted((a, b) => a - b);
  return prices[Math.floor(prices.length / 2)];
};

/** A destination whose category has other destinations too. */
const sharedCategory = (all) =>
  all.find((d) => all.filter((x) => x.category.slug === d.category.slug).length >= 2);

test('TRV-6-DST16 The category list shows every category', async ({ page, request }) => {
  const categories = await destinationCategories(request);
  const { destinations } = await openDestinations(page, request);
  await expect(destinations.category.locator('option')).toHaveText([
    'All categories',
    ...categories.map((c) => c.name),
  ]);
});

test('TRV-6-DST17 Filter by category', async ({ page, request }) => {
  const { destinations, all } = await openDestinations(page, request);
  const { category } = sharedCategory(all);
  await destinations.category.selectOption(category.slug);
  await expect(page).toHaveURL(addressHas('category', category.slug));
  await expect(destinations.cardNames).toHaveText(
    names(all.filter((d) => d.category.slug === category.slug)),
  );
});

test('TRV-6-DST18 The country list shows every country', async ({ page, request }) => {
  const { destinations, all } = await openDestinations(page, request);
  const countries = [...new Set(all.map((d) => d.country))].toSorted();
  await expect(destinations.country.locator('option')).toHaveText(['All countries', ...countries]);
  expect(await destinationCountries(request)).toEqual(countries);
});

test('TRV-6-DST19 Filter by country', async ({ page, request }) => {
  const { destinations, all } = await openDestinations(page, request);
  const { country } = all.at(-1);
  await destinations.country.selectOption(country);
  await expect(destinations.cardNames).toHaveText(names(all.filter((d) => d.country === country)));
});

// Bug 2 in the test case file: the filter compares every price option, not the From price.
test.fail('TRV-6-DST20 Filter by lowest price', async ({ page, request }) => {
  const { destinations, all } = await openDestinations(page, request);
  const lowest = middlePrice(all);
  await destinations.minPrice.fill(String(lowest));
  await expect(page).toHaveURL(addressHas('price_min', String(lowest)));
  await expect(destinations.cardNames).toHaveText(names(all.filter((d) => price(d) >= lowest)));
});

test('TRV-6-DST21 Filter by highest price', async ({ page, request }) => {
  const { destinations, all } = await openDestinations(page, request);
  const highest = middlePrice(all);
  await destinations.maxPrice.fill(String(highest));
  await expect(page).toHaveURL(addressHas('price_max', String(highest)));
  await expect(destinations.cardNames).toHaveText(names(all.filter((d) => price(d) <= highest)));
});

// Bug 3 in the test case file: only "No destinations match your criteria." shows.
test.fail(
  'TRV-6-DST22 A price range with the minimum above the maximum is explained',
  async ({ page, request }) => {
    const { destinations } = await openDestinations(page, request);
    await destinations.minPrice.fill('1000');
    await destinations.maxPrice.fill('500');
    await expect(destinations.noResults).toBeVisible();
    await expect(page.getByRole('main').getByText(/minimum.*maximum/i)).toBeVisible();
  },
);

test('TRV-6-DST23 Featured only', async ({ page, request }) => {
  const { destinations, all } = await openDestinations(page, request);
  await destinations.featuredSwitch.click();
  await expect(page).toHaveURL(addressHas('featured', 'true'));
  await expect(destinations.cardNames).toHaveText(names(all.filter((d) => d.featured)));
});

// Bug 4 in the test case file: only the small switch responds.
test.fail(
  'TRV-6-DST24 Featured only can be used by keyboard and by its text',
  async ({ page, request }) => {
    const { destinations } = await openDestinations(page, request);
    await destinations.maxPrice.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Space');
    await expect(page).toHaveURL(addressHas('featured', 'true'));
    await destinations.featuredText.click();
    await expect(page).toHaveURL(addressHas('featured', null));
  },
);

// Bug 5 in the test case file: the filters have no names for screen readers.
test.fail('TRV-6-DST25 The filters have names', async ({ page, request }) => {
  await openDestinations(page, request);
  const filters = page.getByRole('main').locator('aside');
  for (const name of ['Sort by', 'Category', 'Country']) {
    await expect(filters.getByRole('combobox', { name }), name).toBeVisible();
  }
  const featured = { name: 'Featured only' };
  await expect(
    filters.getByRole('switch', featured).or(filters.getByRole('checkbox', featured)),
  ).toBeVisible();
});

test('TRV-6-DST26 Filters combine', async ({ page, request }) => {
  const { destinations, all } = await openDestinations(page, request);
  const { category, country } = sharedCategory(all);
  await destinations.category.selectOption(category.slug);
  await destinations.country.selectOption(country);
  await expect(page).toHaveURL(addressHas('country', country));
  await expect(destinations.cardNames).toHaveText(
    names(all.filter((d) => d.category.slug === category.slug && d.country === country)),
  );
});

test('TRV-6-DST27 The active filters are counted', async ({ page, request }) => {
  const { destinations, all } = await openDestinations(page, request);
  await destinations.category.selectOption(sharedCategory(all).category.slug);
  await destinations.featuredSwitch.click();
  await expect(destinations.filtersHeading).toHaveText(/^Filters\s*2$/);
});

test('TRV-6-DST28 Clear all filters resets them', async ({ page, request }) => {
  const { destinations, all } = await openDestinations(page, request);
  await destinations.category.selectOption(sharedCategory(all).category.slug);
  await destinations.featuredSwitch.click();
  await expect(destinations.filtersHeading).toHaveText(/^Filters\s*2$/);
  await destinations.clearFilters.click();
  await expect(destinations.sortBy).toHaveValue('');
  await expect(destinations.category).toHaveValue('');
  await expect(destinations.country).toHaveValue('');
  await expect(destinations.minPrice).toHaveValue('');
  await expect(destinations.maxPrice).toHaveValue('');
  await expect(page).toHaveURL(addressHas('featured', null));
  await expect(destinations.cardNames).toHaveText(names(all));
  await expect(destinations.filtersHeading).toHaveText('Filters');
  await expect(destinations.clearFilters).toBeHidden();
});
