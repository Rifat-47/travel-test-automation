import { test, expect } from '../../../fixtures/test.js';
import { matchesSearch, names, wordsOf } from '../../../data/destinations.js';
import { DestinationsPage } from '../../../pages/destinations/destinations.page.js';
import { DESTINATION_LIST, failReply } from '../../../services/fakeReplies.js';
import { allDestinations, destinationDetails, siteSettings } from '../../../services/siteApi.js';

test('TRV-6-DST01 The page shows its heading', async ({ page, request }) => {
  const settings = await siteSettings(request);
  const destinations = new DestinationsPage(page);
  await destinations.open();
  await expect(destinations.heading).toHaveText(settings.destinations_heading || 'Destinations');
  await expect(destinations.subheading).toHaveText(settings.destinations_subheading);
  await expect(destinations.listButton).toBeVisible();
  await expect(destinations.mapButton).toBeVisible();
  await expect(destinations.searchBox).toBeVisible();
  await expect(destinations.sortBy).toBeVisible();
  await expect(destinations.category).toBeVisible();
  await expect(destinations.country).toBeVisible();
});

test('TRV-6-DST02 Every destination is listed, newest first', async ({ page, request }) => {
  const all = await destinationDetails(request);
  expect(all.length, 'this case needs 12 or fewer destinations').toBeLessThanOrEqual(12);
  const newestFirst = all.toSorted((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const destinations = new DestinationsPage(page);
  await destinations.open();
  await expect(destinations.cardNames).toHaveText(names(newestFirst));
  await expect(destinations.resultCount).toHaveText(`${all.length} destinations found`);
});

test('TRV-6-DST03 A card opens the destination', async ({ page, request }) => {
  const [first] = await allDestinations(request);
  const destinations = new DestinationsPage(page);
  await destinations.open();
  await destinations.cards.first().click();
  await expect(page).toHaveURL(`/destinations/${first.slug}`);
});

test('TRV-6-DST04 One result is counted in the singular', async ({ page, request }) => {
  const all = await destinationDetails(request);
  const word = all
    .flatMap((d) => wordsOf(d.name))
    .find((w) => all.filter((d) => matchesSearch(d, w)).length === 1);
  expect(word, 'a word only one destination has').toBeDefined();
  const destinations = new DestinationsPage(page);
  await destinations.open();
  await destinations.search(word);
  await expect(destinations.resultCount).toHaveText('1 destination found');
  await expect(destinations.cards).toHaveCount(1);
});

test('TRV-6-DST05 No results is explained', async ({ page }) => {
  const destinations = new DestinationsPage(page);
  await destinations.open();
  await destinations.search(`nomatch${Date.now()}`);
  await expect(destinations.resultCount).toHaveText('0 destinations found');
  await expect(destinations.noResults).toBeVisible();
  await expect(destinations.cards).toHaveCount(0);
  await expect(destinations.previous).toHaveCount(0);
});

test('TRV-6-DST06 A failure to load is reported', async ({ page }) => {
  test.slow();
  await failReply(page, DESTINATION_LIST);
  const destinations = new DestinationsPage(page);
  await page.goto('/destinations');
  // The site tries again three times before giving up.
  await expect(destinations.loadError).toBeVisible({ timeout: 25_000 });
  await expect(destinations.searchBox).toBeVisible();
  await expect(destinations.category).toBeVisible();
});
