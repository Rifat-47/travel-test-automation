import { test, expect } from '../../../fixtures/test.js';
import { Navbar } from '../../../pages/layout/navbar.page.js';
import { PHONE } from '../../../data/viewports.js';

// The button shows the theme a click switches to: the sun in dark, the moon in light.
const SUN = 'path[d^="M12 3v1"]';
const MOON = 'path[d^="M21 12.79"]';

const expectTheme = (page, theme) =>
  theme === 'dark'
    ? expect(page.locator('html')).toHaveClass(/\bdark\b/)
    : expect(page.locator('html')).not.toHaveClass(/\bdark\b/);

/** Opens Home on a device set to light, then switches to dark with the button. */
async function switchToDark(page) {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expectTheme(page, 'light');
  await new Navbar(page).themeButton.click();
  await expectTheme(page, 'dark');
}

test("TRV-4-NAV26 The first visit follows the device's setting", async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expectTheme(page, 'dark');
  await expect(new Navbar(page).themeButton.locator(SUN)).toBeVisible();
});

test('TRV-4-NAV27 The first visit follows a light device', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expectTheme(page, 'light');
  await expect(new Navbar(page).themeButton.locator(MOON)).toBeVisible();
});

test('TRV-4-NAV28 The button switches the theme', async ({ page }) => {
  await switchToDark(page);
  await new Navbar(page).themeButton.click();
  await expectTheme(page, 'light');
});

test('TRV-4-NAV29 The chosen theme stays after a reload', async ({ page }) => {
  await switchToDark(page);
  await page.reload();
  await expectTheme(page, 'dark');
});

test("TRV-4-NAV30 The chosen theme beats the device's setting", async ({ page }) => {
  await switchToDark(page);
  await page.goto('/about');
  await expectTheme(page, 'dark');
});

test('TRV-4-NAV31 The chosen theme is kept in a new tab', async ({ page, context }) => {
  await switchToDark(page);
  const other = await context.newPage();
  await other.emulateMedia({ colorScheme: 'light' });
  await other.goto('/');
  await expectTheme(other, 'dark');
});

test('TRV-4-NAV32 The theme button works on a phone', async ({ page }) => {
  await page.setViewportSize(PHONE);
  await switchToDark(page);
  await expect(page.locator('html')).toHaveClass(/\bdark\b/);
});
