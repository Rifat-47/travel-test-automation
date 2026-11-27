import { randomUUID } from 'node:crypto';
import { test, expect } from '../../../fixtures/test.js';
import { Footer } from '../../../pages/layout/footer.page.js';
import { Navbar } from '../../../pages/layout/navbar.page.js';
import { destinations, siteSettings } from '../../../services/siteApi.js';

/** The tab title each top bar page should have, from the headings in the site settings. */
function pageTitles(settings) {
  const withSite = (title) => `${title} | ${settings.site_name}`;
  return [
    {
      name: 'Destinations',
      path: '/destinations',
      title: withSite(settings.destinations_heading || 'Destinations'),
    },
    { name: 'Blog', path: '/blog', title: withSite(settings.blog_heading || 'Travel Blog') },
    { name: 'About', path: '/about', title: withSite('About Us') },
    {
      name: 'Contact',
      path: '/contact',
      title: withSite(settings.contact_heading || 'Contact Us'),
    },
  ];
}

test("TRV-4-NAV33 Home's tab title is the site name", async ({ page, request }) => {
  const { site_name: siteName } = await siteSettings(request);
  await page.goto('/');
  await expect(page).toHaveTitle(siteName);
});

test('TRV-4-NAV34 Pages opened from the top bar have their own tab title', async ({
  page,
  request,
}) => {
  const navbar = new Navbar(page);
  await page.goto('/');
  for (const { name, title } of pageTitles(await siteSettings(request))) {
    await navbar.link(name).click();
    await expect(page).toHaveTitle(title);
  }
});

// Bug 1 in the test case file: a page opened by its address shows only the site name.
test.fail(
  'TRV-4-NAV35 Pages opened directly have their own tab title',
  async ({ page, request }) => {
    for (const { path, title } of pageTitles(await siteSettings(request))) {
      await page.goto(path);
      await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page, path).toHaveTitle(title);
    }
  },
);

// Bug 4 in the test case file: the country is repeated after a name that includes it.
test.fail("TRV-4-NAV39 A destination's tab title names it once", async ({ page, request }) => {
  const destination = (await destinations(request)).find(
    (d) => d.country && d.name.includes(d.country),
  );
  expect(destination, 'Needs a destination whose name includes its country').toBeDefined();
  const { site_name: siteName } = await siteSettings(request);
  await page.goto(`/destinations/${destination.slug}`);
  await expect(page).toHaveTitle(`${destination.name} | ${siteName}`);
});

// Bug 2 in the test case file: an unknown address shows an empty page.
test.fail('TRV-4-NAV36 An unknown address shows a not-found page', async ({ page }) => {
  await page.goto(`/no-such-page-${randomUUID()}`);
  const main = page.getByRole('main');
  await expect(main.getByText(/not found/i).first()).toBeVisible();
  await expect(main.locator('a[href="/"]').first()).toBeVisible();
  await expect(new Navbar(page).siteName).toBeVisible();
  await expect(new Footer(page).copyright).toBeVisible();
});

test('TRV-4-NAV37 Losing the connection is reported', async ({ page, context }) => {
  await page.goto('/');
  await expect(new Navbar(page).siteName).toBeVisible();
  await context.setOffline(true);
  await expect(page.getByRole('alert')).toHaveText(
    "You're offline — changes won't be saved until you reconnect.",
  );
});

test('TRV-4-NAV38 Coming back online is reported', async ({ page, context }) => {
  const banner = page.getByRole('alert').filter({ hasText: /online|offline/ });
  await page.goto('/');
  await expect(new Navbar(page).siteName).toBeVisible();
  await context.setOffline(true);
  await expect(banner).toContainText("You're offline");
  await context.setOffline(false);
  await expect(banner).toHaveText('Back online!');
  // The message is meant to stay about 3 seconds.
  await expect(banner).toBeHidden({ timeout: 6_000 });
});
