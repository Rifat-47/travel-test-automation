import { test, expect } from '../../../fixtures/test.js';
import { matchesSearch, names, wordsOf } from '../../../data/destinations.js';
import { addressHas, DestinationsPage } from '../../../pages/destinations/destinations.page.js';
import { destinationDetails } from '../../../services/siteApi.js';

/** Opens Destinations; returns the page and every destination with its details. */
async function openDestinations(page, request) {
  const all = await destinationDetails(request);
  const destinations = new DestinationsPage(page);
  await destinations.open();
  return { destinations, all, matching: (text) => all.filter((d) => matchesSearch(d, text)) };
}

/** The first word of the newest destination's name. */
const nameWord = (all) => wordsOf(all[0].name)[0];

test('TRV-6-DST07 Search by name', async ({ page, request }) => {
  const { destinations, all, matching } = await openDestinations(page, request);
  const word = nameWord(all);
  await destinations.search(word);
  await expect(page).toHaveURL(addressHas('search', word));
  await expect(destinations.cardNames).toHaveText(names(matching(word)));
});

test('TRV-6-DST08 Search by country', async ({ page, request }) => {
  const { destinations, all, matching } = await openDestinations(page, request);
  const { country } = all.at(-1);
  await destinations.search(country);
  await expect(destinations.cardNames).toHaveText(names(matching(country)));
  for (const d of all.filter((x) => x.country === country)) {
    await expect(destinations.cardNames.filter({ hasText: d.name })).toHaveCount(1);
  }
});

test('TRV-6-DST09 Search by a word in the description', async ({ page, request }) => {
  const { destinations, all, matching } = await openDestinations(page, request);
  const inNameOrCountry = (w) =>
    all.some((d) => matchesSearch({ name: d.name, country: d.country }, w));
  const word = all
    .flatMap((d) => wordsOf(d.desc))
    .find((w) => w.length >= 6 && !inNameOrCountry(w) && matching(w).length < all.length);
  expect(word, 'a word found only in descriptions').toBeDefined();
  await destinations.search(word);
  await expect(destinations.cardNames).toHaveText(names(matching(word)));
});

test('TRV-6-DST10 Search ignores letter case', async ({ page, request }) => {
  const { destinations, all, matching } = await openDestinations(page, request);
  const word = nameWord(all);
  await destinations.search(word.toUpperCase());
  await expect(destinations.cardNames).toHaveText(names(matching(word)));
});

test('TRV-6-DST11 Results update after typing stops', async ({ page, request }) => {
  const { destinations, all, matching } = await openDestinations(page, request);
  const word = nameWord(all);
  await destinations.searchBox.fill(word);
  await expect(destinations.cardNames).toHaveText(names(matching(word)), { timeout: 1_500 });
});

test('TRV-6-DST12 Enter searches', async ({ page, request }) => {
  const { destinations, all, matching } = await openDestinations(page, request);
  const word = nameWord(all);
  await destinations.searchBox.fill(word);
  await destinations.searchBox.press('Enter');
  // Sooner than the search that runs on its own after typing stops.
  await expect(page).toHaveURL(addressHas('search', word), { timeout: 400 });
  await expect(destinations.cardNames).toHaveText(names(matching(word)));
});

test('TRV-6-DST13 Spaces around the search are ignored', async ({ page, request }) => {
  const { destinations, all, matching } = await openDestinations(page, request);
  const word = nameWord(all);
  await destinations.search(`   ${word}   `);
  await expect(page).toHaveURL(addressHas('search', word));
  await expect(destinations.cardNames).toHaveText(names(matching(word)));
});

test('TRV-6-DST14 The clear button resets the search', async ({ page, request }) => {
  const { destinations, all, matching } = await openDestinations(page, request);
  const word = nameWord(all);
  await destinations.search(word);
  await expect(destinations.cardNames).toHaveText(names(matching(word)));
  await destinations.clearSearch.click();
  await expect(destinations.searchBox).toHaveValue('');
  await expect(destinations.cardNames).toHaveText(names(all));
  await expect(page).toHaveURL(addressHas('search', null));
});

test('TRV-6-DST15 Search and filters work together', async ({ page, request }) => {
  const { destinations, all } = await openDestinations(page, request);
  const inCategory = (slug) => all.filter((d) => d.category.slug === slug);
  const { category } = all.find((d) => inCategory(d.category.slug).length >= 2);
  const word = wordsOf(inCategory(category.slug)[0].country)[0];
  const expected = inCategory(category.slug).filter((d) => matchesSearch(d, word));
  await destinations.category.selectOption(category.slug);
  await destinations.search(word);
  await expect(destinations.cardNames).toHaveText(names(expected));
});
