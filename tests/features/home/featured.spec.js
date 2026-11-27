import { customerTest, test, expect } from '../../../fixtures/test.js';
import { destinationCard, HomePage } from '../../../pages/home/home.page.js';
import {
  changeReply,
  failReply,
  FEATURED,
  NO_RESULTS,
  replyWith,
  SETTINGS,
} from '../../../services/fakeReplies.js';
import { featuredDestinations, siteSettings } from '../../../services/siteApi.js';

/** Opens Home and returns its featured section, under the heading in the site settings. */
async function openFeatured(page, request) {
  const settings = await siteSettings(request);
  const home = new HomePage(page);
  await home.open();
  return { home, settings, featured: home.featured(settings.home_featured_heading) };
}

/** Changes the first featured destination in the reply Home gets. */
const changeFirst = (page, change) =>
  changeReply(page, FEATURED, (reply) => ({
    ...reply,
    results: reply.results.map((d, i) => (i === 0 ? { ...d, ...change } : d)),
  }));

test('TRV-5-HOM06 The section shows its heading', async ({ page, request }) => {
  const { featured } = await openFeatured(page, request);
  await expect(featured.section).toBeVisible();
  await expect(featured.viewAll).toBeVisible();
});

test('TRV-5-HOM07 Only featured destinations are shown', async ({ page, request }) => {
  const { settings, featured } = await openFeatured(page, request);
  const expected = (await featuredDestinations(request)).slice(0, settings.featured_count);
  await expect(featured.cards).toHaveCount(expected.length);
  const hrefs = await featured.cards.evaluateAll((cards) =>
    cards.map((c) => c.getAttribute('href')),
  );
  expect(hrefs.toSorted()).toEqual(expected.map((d) => `/destinations/${d.slug}`).toSorted());
  for (const card of await featured.cards.all()) {
    await expect(destinationCard(card).featuredBadge).toBeVisible();
  }
});

// Bug 3 in the test case file: Home ignores the featured count in the site settings.
test.fail('TRV-5-HOM08 No more than the featured count is shown', async ({ page, request }) => {
  const all = await featuredDestinations(request);
  const count = all.length - 1;
  expect(count, 'Needs at least two featured destinations').toBeGreaterThan(0);
  await changeReply(page, SETTINGS, (settings) => ({ ...settings, featured_count: count }));
  const { featured } = await openFeatured(page, request);
  await expect(featured.cards.first()).toBeVisible();
  await expect(featured.cards).toHaveCount(count);
});

test("TRV-5-HOM09 A card shows the destination's details", async ({ page, request }) => {
  const { settings, featured } = await openFeatured(page, request);
  const card = featured.cards.first();
  const slug = (await card.getAttribute('href')).split('/').pop();
  const destination = (await featuredDestinations(request)).find((d) => d.slug === slug);
  const parts = destinationCard(card);
  const price = `${settings.currency_symbol}${Number(destination.starting_price).toLocaleString('en-US')}`;

  await expect(parts.picture).toHaveAttribute('alt', destination.name);
  await expect(parts.name).toHaveText(destination.name);
  await expect(card.getByText(destination.category.name, { exact: true })).toBeVisible();
  await expect(card.getByText(`📍 ${destination.country}`, { exact: true })).toBeVisible();
  await expect(card.getByText(destination.demo, { exact: true })).toBeVisible();
  await expect(card).toContainText(`From ${price}`);
  await expect(card).toContainText('/ guest');
  // The photo count includes the main picture.
  await expect(
    card.getByText(String(destination.gallery_count + 1), { exact: true }),
  ).toBeVisible();
});

test('TRV-5-HOM10 A card opens the destination', async ({ page, request }) => {
  const { featured } = await openFeatured(page, request);
  const card = featured.cards.first();
  const href = await card.getAttribute('href');
  await card.click();
  await expect(page).toHaveURL(href);
});

test('TRV-5-HOM11 View all opens Destinations', async ({ page, request }) => {
  const { featured } = await openFeatured(page, request);
  await featured.viewAll.click();
  // Destinations adds its page number to the address.
  await expect(page).toHaveURL(/\/destinations(\?page=1)?$/);
});

test('TRV-5-HOM12 A card shows the rating when there are reviews', async ({ page, request }) => {
  await changeFirst(page, { review_count: 7, average_rating: 4.36 });
  const { featured } = await openFeatured(page, request);
  const card = featured.cards.first();
  await expect(card.getByText('★ 4.4', { exact: true })).toBeVisible();
  await expect(card.getByText('(7)', { exact: true })).toBeVisible();
});

test('TRV-5-HOM13 A card shows no rating without reviews', async ({ page, request }) => {
  await changeFirst(page, { review_count: 0, average_rating: null });
  const { featured } = await openFeatured(page, request);
  await expect(featured.cards.first()).toBeVisible();
  await expect(featured.cards.first().getByText(/★/)).toHaveCount(0);
});

test('TRV-5-HOM14 A card copes with a missing picture and price', async ({ page, request }) => {
  await changeFirst(page, { img: null, starting_price: null });
  const { featured } = await openFeatured(page, request);
  const card = featured.cards.first();
  await expect(destinationCard(card).picture).toHaveCount(0);
  await expect(card.getByText('✈', { exact: true })).toBeVisible();
  await expect(card.getByText('—', { exact: true })).toBeVisible();
});

// Bug 4 in the test case file: the save button covers the edge of the Featured badge.
customerTest.fail(
  'TRV-5-HOM15 A customer sees a save button on each card',
  async ({ page, request }) => {
    const { featured } = await openFeatured(page, request);
    await expect(featured.cards.first()).toBeVisible();
    for (const card of await featured.cards.all()) {
      const { saveButton, featuredBadge } = destinationCard(card);
      await expect(saveButton).toBeVisible();
      const button = await saveButton.boundingBox();
      const badge = await featuredBadge.boundingBox();
      // The badge ends left of the button, or sits wholly below or above it.
      const apart =
        badge.x + badge.width <= button.x ||
        badge.y >= button.y + button.height ||
        badge.y + badge.height <= button.y;
      expect(apart, 'The save button covers the Featured badge').toBe(true);
    }
  },
);

// Bug 1 in the test case file: no featured destinations leaves an empty section.
test.fail('TRV-5-HOM16 No featured destinations is explained', async ({ page, request }) => {
  await replyWith(page, FEATURED, NO_RESULTS);
  const { featured } = await openFeatured(page, request);
  await expect(featured.section).toBeVisible();
  await expect(featured.section.getByText(/no featured destinations/i)).toBeVisible();
});

// Bug 2 in the test case file: a failure to load the featured destinations is not reported.
test.fail('TRV-5-HOM17 A failure to load is reported', async ({ page, request }) => {
  await failReply(page, FEATURED);
  const { home, featured } = await openFeatured(page, request);
  await expect(home.heroHeading).toBeVisible();
  // The site retries a failed request a few times before giving up.
  await expect(
    featured.section.getByText(/could not be loaded|couldn't load|failed to load/i),
  ).toBeVisible({
    timeout: 20_000,
  });
});
