import { test, expect } from '../../../fixtures/test.js';
import { names } from '../../../data/destinations.js';
import { addressHas, DestinationsPage } from '../../../pages/destinations/destinations.page.js';
import { changeReply, SETTINGS } from '../../../services/fakeReplies.js';
import { allDestinations, siteSettings } from '../../../services/siteApi.js';

const onMap = (d) => d.latitude != null && d.longitude != null;

/** Opens Destinations on the map; returns the page and every destination, newest first. */
async function openMap(page, request) {
  const all = await allDestinations(request);
  const destinations = new DestinationsPage(page);
  await destinations.open();
  await destinations.mapButton.click();
  await expect(destinations.map).toBeVisible();
  return { destinations, all, mapped: all.filter(onMap) };
}

test('TRV-6-DST42 Map shows the destinations on a map', async ({ page, request }) => {
  const { destinations, mapped } = await openMap(page, request);
  await expect(page).toHaveURL(addressHas('view', 'map'));
  await expect(destinations.pins).toHaveCount(mapped.length);
  await expect(destinations.cards).toHaveCount(0);
});

test('TRV-6-DST43 A pin shows the destination', async ({ page, request }) => {
  const settings = await siteSettings(request);
  const { destinations, mapped } = await openMap(page, request);
  await destinations.pins.first().click();
  await expect(destinations.popup).toBeVisible();
  const name = await destinations.popupName.textContent();
  const shown = mapped.find((d) => d.name === name);
  expect(shown, `the pin's destination, ${name}`).toBeDefined();
  const price = Number(shown.starting_price).toLocaleString('en-US');
  await expect(destinations.popup).toContainText(shown.country);
  await expect(destinations.popup).toContainText(`${settings.currency_symbol}${price} / guest`);
  const view = destinations.popup.getByRole('link', { name: 'View', exact: true });
  await expect(view).toHaveAttribute('href', `/destinations/${shown.slug}`);
});

test('TRV-6-DST44 The map follows the filters', async ({ page, request }) => {
  const { destinations, mapped } = await openMap(page, request);
  const inCategory = (slug) => mapped.filter((d) => d.category.slug === slug);
  const { category } = mapped.find((d) => inCategory(d.category.slug).length < mapped.length);
  await destinations.category.selectOption(category.slug);
  await expect(page).toHaveURL(addressHas('category', category.slug));
  await expect(destinations.pins).toHaveCount(inCategory(category.slug).length);
});

test('TRV-6-DST45 List returns to the cards', async ({ page, request }) => {
  const { destinations, all } = await openMap(page, request);
  await destinations.listButton.click();
  await expect(page).toHaveURL(addressHas('view', null));
  await expect(destinations.map).toHaveCount(0);
  await expect(destinations.cardNames).toHaveText(names(all));
});

// Bug 6 in the test case file: the map tells customers to add coordinates in the Django admin.
test.fail(
  'TRV-6-DST46 Results without coordinates are explained to customers',
  async ({ page, request }) => {
    const { destinations, all } = await openMap(page, request);
    const { country } = all.find((d) => !all.some((x) => x.country === d.country && onMap(x)));
    await destinations.country.selectOption(country);
    await expect(destinations.pins).toHaveCount(0);
    const main = page.getByRole('main');
    await expect(main.getByText(/won't appear on the map|not on the map/i)).toBeVisible();
    await expect(main).not.toContainText(/Django admin|Add coordinates/i);
  },
);

test('TRV-6-DST47 The map can be turned off', async ({ page }) => {
  await changeReply(page, SETTINGS, (settings) => ({ ...settings, map_view_enabled: false }));
  const destinations = new DestinationsPage(page);
  await destinations.open('?view=map');
  await expect(destinations.cards.first()).toBeVisible();
  await expect(destinations.listButton).toHaveCount(0);
  await expect(destinations.mapButton).toHaveCount(0);
  await expect(destinations.map).toHaveCount(0);
});
