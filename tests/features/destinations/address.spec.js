import { test, expect } from '../../../fixtures/test.js';
import { matchesSearch, names, wordsOf } from '../../../data/destinations.js';
import { addressHas, DestinationsPage } from '../../../pages/destinations/destinations.page.js';
import { destinationDetails } from '../../../services/siteApi.js';

// The page shows a filter switched on by its colour only.
const SWITCHED_ON = /bg-teal-600/;

const byName = (a, b) => a.name.localeCompare(b.name);

test('TRV-6-DST39 A shared address opens the same results', async ({ page, request }) => {
  const all = await destinationDetails(request);
  const chosen = all.find((d) => d.featured);
  const word = wordsOf(chosen.name)[0];
  const expected = all
    .filter(
      (d) =>
        matchesSearch(d, word) &&
        d.category.slug === chosen.category.slug &&
        d.country === chosen.country &&
        d.featured,
    )
    .toSorted(byName);
  const query = new URLSearchParams({
    search: word,
    category: chosen.category.slug,
    country: chosen.country,
    ordering: 'name',
    featured: 'true',
  });
  const destinations = new DestinationsPage(page);
  await destinations.open(`?${query}`);
  await expect(destinations.searchBox).toHaveValue(word);
  await expect(destinations.category).toHaveValue(chosen.category.slug);
  await expect(destinations.country).toHaveValue(chosen.country);
  await expect(destinations.sortBy).toHaveValue('name');
  await expect(destinations.featuredSwitch).toHaveClass(SWITCHED_ON);
  await expect(destinations.cardNames).toHaveText(names(expected));
});

test('TRV-6-DST40 The choices stay after a reload', async ({ page, request }) => {
  const all = await destinationDetails(request);
  const { category } = all.find(
    (d) => all.filter((x) => x.category.slug === d.category.slug).length >= 2,
  );
  const word = 'a';
  const expected = all
    .filter((d) => d.category.slug === category.slug && matchesSearch(d, word))
    .toSorted(byName)
    .reverse();
  const destinations = new DestinationsPage(page);
  await destinations.open();
  await destinations.category.selectOption(category.slug);
  await destinations.sortBy.selectOption('-name');
  await destinations.search(word);
  await expect(page).toHaveURL(addressHas('search', word));
  await expect(destinations.cardNames).toHaveText(names(expected));

  await page.reload();
  await destinations.settle();
  await expect(destinations.searchBox).toHaveValue(word);
  await expect(destinations.category).toHaveValue(category.slug);
  await expect(destinations.sortBy).toHaveValue('-name');
  await expect(destinations.cardNames).toHaveText(names(expected));
});

test('TRV-6-DST41 Back returns to the earlier choices', async ({ page, request }) => {
  const all = await destinationDetails(request);
  const [first, second] = [...new Set(all.map((d) => d.category.slug))];
  const destinations = new DestinationsPage(page);
  await destinations.open();
  await destinations.category.selectOption(first);
  await expect(page).toHaveURL(addressHas('category', first));
  await destinations.category.selectOption(second);
  await expect(page).toHaveURL(addressHas('category', second));
  await page.goBack();
  await expect(destinations.category).toHaveValue(first);
  await expect(destinations.cardNames).toHaveText(
    names(all.filter((d) => d.category.slug === first)),
  );
});
