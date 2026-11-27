import { test, expect } from '../../../fixtures/test.js';
import { Footer } from '../../../pages/layout/footer.page.js';
import { Navbar, PAGE_LINKS, pageAddress } from '../../../pages/layout/navbar.page.js';
import { destinations, siteSettings } from '../../../services/siteApi.js';

// Read in the browser; the string form keeps browser globals out of the test code.
const scrollY = (page) => page.evaluate('window.scrollY');

let navbar;

test.beforeEach(async ({ page }) => {
  navbar = new Navbar(page);
  await page.goto('/');
});

test('TRV-4-NAV01 The top bar shows the main links', async ({ request }) => {
  const { site_name: siteName } = await siteSettings(request);
  await expect(navbar.siteName).toHaveText(siteName);
  for (const { name } of PAGE_LINKS) await expect(navbar.link(name)).toBeVisible();
  await expect(navbar.themeButton).toBeVisible();
  await expect(navbar.login).toBeVisible();
  await expect(navbar.register).toBeVisible();
});

test('TRV-4-NAV02 Each link opens its page', async ({ page }) => {
  for (const { name, path } of PAGE_LINKS) {
    await navbar.link(name).click();
    await expect(page).toHaveURL(pageAddress(path));
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible();
  }
});

test('TRV-4-NAV03 The site name returns to Home', async ({ page }) => {
  await page.goto('/about');
  await navbar.siteName.click();
  await expect(page).toHaveURL('/');
});

test("TRV-4-NAV04 The current page's link is marked", async ({ page }) => {
  await page.goto('/blog');
  await expect(navbar.currentPageLink).toHaveCount(1);
  await expect(navbar.currentPageLink).toHaveText('Blog');
});

test('TRV-4-NAV05 Login and Register open their pages', async ({ page }) => {
  await navbar.login.click();
  await expect(page).toHaveURL('/login');
  await page.goBack();
  await navbar.register.click();
  await expect(page).toHaveURL('/register');
});

test('TRV-4-NAV06 The top bar stays in view when scrolling', async ({ page }) => {
  await new Footer(page).copyright.scrollIntoViewIfNeeded();
  await expect.poll(() => scrollY(page)).toBeGreaterThan(0);
  await expect(navbar.bar).toBeInViewport();
  expect((await navbar.bar.boundingBox()).y).toBe(0);
});

test('TRV-4-NAV07 A new page opens at the top', async ({ page }) => {
  const footer = new Footer(page);
  await footer.copyright.scrollIntoViewIfNeeded();
  await expect.poll(() => scrollY(page)).toBeGreaterThan(0);
  await footer.link('Blog').click();
  await expect(page).toHaveURL('/blog');
  await expect.poll(() => scrollY(page)).toBe(0);
});

test('TRV-4-NAV08 The top bar and footer are on every page', async ({ page, request }) => {
  const [destination] = await destinations(request);
  const paths = [
    '/',
    '/destinations',
    `/destinations/${destination.slug}`,
    '/blog',
    '/about',
    '/contact',
    '/login',
    '/register',
  ];
  const footer = new Footer(page);
  for (const path of paths) {
    await page.goto(path);
    await expect(navbar.siteName, path).toBeVisible();
    await expect(footer.copyright, path).toBeVisible();
  }
});
