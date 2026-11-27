import { test, expect } from '../../../fixtures/test.js';
import { PHONE } from '../../../data/viewports.js';
import { DestinationsPage } from '../../../pages/destinations/destinations.page.js';
import { allDestinations } from '../../../services/siteApi.js';

test.use({ viewport: PHONE });

test('TRV-6-DST48 The filters fold away on a phone', async ({ page }) => {
  const destinations = new DestinationsPage(page);
  await destinations.open();
  await expect(destinations.filtersToggle).toBeVisible();
  await expect(destinations.sortBy).toBeHidden();
  await expect(destinations.category).toBeHidden();
  await destinations.filtersToggle.click();
  await expect(destinations.sortBy).toBeVisible();
  await expect(destinations.category).toBeVisible();
  await expect(destinations.country).toBeVisible();
});

test('TRV-6-DST49 The folded filters show how many are on', async ({ page, request }) => {
  const [{ category }] = await allDestinations(request);
  const destinations = new DestinationsPage(page);
  await destinations.open(`?category=${category.slug}`);
  await expect(destinations.category).toBeHidden();
  await expect(destinations.filtersToggle).toHaveText(/^Filters\s*1$/);
});
