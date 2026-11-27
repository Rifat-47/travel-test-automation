import { test, expect } from '../../../fixtures/test.js';
import { manyDestinations, names } from '../../../data/destinations.js';
import { addressHas, DestinationsPage } from '../../../pages/destinations/destinations.page.js';
import { DESTINATION_LIST, replyWithPages } from '../../../services/fakeReplies.js';
import { allDestinations } from '../../../services/siteApi.js';

// The page marks the current page button by its colour only.
const CURRENT = /bg-teal-600/;

/** Opens Destinations; returns the page and every destination, newest first. */
async function openDestinations(page, request) {
  const all = await allDestinations(request);
  const destinations = new DestinationsPage(page);
  await destinations.open();
  return { destinations, all };
}

/** Opens Destinations with 30 made-up results; returns the page and the names on each page. */
async function openThirty(page, request) {
  const [real] = await allDestinations(request);
  const thirty = names(manyDestinations(real));
  await replyWithPages(page, DESTINATION_LIST, manyDestinations(real));
  const destinations = new DestinationsPage(page);
  await destinations.open();
  const onPage = (n) => thirty.slice((n - 1) * 12, n * 12);
  return { destinations, onPage };
}

const byName = (a, b) => a.name.localeCompare(b.name);

test('TRV-6-DST29 The sort options', async ({ page, request }) => {
  const { destinations } = await openDestinations(page, request);
  await expect(destinations.sortBy.locator('option')).toHaveText([
    'Newest first',
    'Name A–Z',
    'Name Z–A',
    'Top rated',
  ]);
  await expect(destinations.sortBy.locator('option:checked')).toHaveText('Newest first');
});

test('TRV-6-DST30 Sort by name A to Z', async ({ page, request }) => {
  const { destinations, all } = await openDestinations(page, request);
  await destinations.sortBy.selectOption({ label: 'Name A–Z' });
  await expect(page).toHaveURL(addressHas('ordering', 'name'));
  await expect(destinations.cardNames).toHaveText(names(all.toSorted(byName)));
});

test('TRV-6-DST31 Sort by name Z to A', async ({ page, request }) => {
  const { destinations, all } = await openDestinations(page, request);
  await destinations.sortBy.selectOption({ label: 'Name Z–A' });
  await expect(destinations.cardNames).toHaveText(names(all.toSorted(byName).reverse()));
});

test('TRV-6-DST32 Sort by rating', async ({ page, request }) => {
  const { destinations } = await openDestinations(page, request);
  const topRated = await allDestinations(request, { ordering: '-average_rating' });
  const ratings = topRated.map((d) => Number(d.average_rating ?? 0));
  expect(ratings).toEqual(ratings.toSorted((a, b) => b - a));
  await destinations.sortBy.selectOption({ label: 'Top rated' });
  await expect(destinations.cardNames).toHaveText(names(topRated));
});

test('TRV-6-DST33 One page shows no page buttons', async ({ page, request }) => {
  const { destinations, all } = await openDestinations(page, request);
  expect(all.length, 'this case needs 12 or fewer destinations').toBeLessThanOrEqual(12);
  await expect(destinations.cards.first()).toBeVisible();
  await expect(destinations.previous).toHaveCount(0);
  await expect(destinations.next).toHaveCount(0);
});

test('TRV-6-DST34 More than 12 results are split into pages', async ({ page, request }) => {
  const { destinations, onPage } = await openThirty(page, request);
  await expect(destinations.cardNames).toHaveText(onPage(1));
  await expect(destinations.previous).toBeDisabled();
  await expect(destinations.pageButtons).toHaveText(['1', '2', '3']);
  await expect(destinations.numberButton(1)).toHaveClass(CURRENT);
  await expect(destinations.next).toBeEnabled();
});

test('TRV-6-DST35 A page button opens that page', async ({ page, request }) => {
  const { destinations, onPage } = await openThirty(page, request);
  await destinations.numberButton(3).click();
  await expect(page).toHaveURL(addressHas('page', '3'));
  await expect(destinations.cardNames).toHaveText(onPage(3));
  await expect(destinations.numberButton(3)).toHaveClass(CURRENT);
  await expect(destinations.next).toBeDisabled();
});

test('TRV-6-DST36 Previous and Next move one page', async ({ page, request }) => {
  const { destinations, onPage } = await openThirty(page, request);
  await destinations.numberButton(2).click();
  await expect(destinations.cardNames).toHaveText(onPage(2));
  await destinations.next.click();
  await expect(destinations.cardNames).toHaveText(onPage(3));
  await destinations.previous.click();
  await expect(destinations.cardNames).toHaveText(onPage(2));
  await destinations.previous.click();
  await expect(destinations.cardNames).toHaveText(onPage(1));
  await expect(destinations.previous).toBeDisabled();
});

test('TRV-6-DST37 A new search starts at page 1', async ({ page, request }) => {
  const { destinations, onPage } = await openThirty(page, request);
  await destinations.numberButton(3).click();
  await expect(destinations.cardNames).toHaveText(onPage(3));
  await destinations.search('test');
  await expect(page).toHaveURL(addressHas('page', '1'));
  await expect(destinations.cardNames).toHaveText(onPage(1));
  await expect(destinations.numberButton(1)).toHaveClass(CURRENT);
});

// Bug 1 in the test case file: about half a second after loading, the page jumps to page 1.
test.fail('TRV-6-DST38 A link to a later page opens that page', async ({ page, request }) => {
  const [real] = await allDestinations(request);
  await replyWithPages(page, DESTINATION_LIST, manyDestinations(real));
  const destinations = new DestinationsPage(page);
  await page.goto('/destinations?page=2');
  await expect(destinations.cardNames.first()).toHaveText(manyDestinations(real)[12].name);
  // Nothing on the page signals the moment the jump would happen, so wait past it.
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(1_500);
  await expect(page).toHaveURL(addressHas('page', '2'));
  await expect(destinations.numberButton(2)).toHaveClass(CURRENT);
});
