import { test, expect } from '../../../fixtures/test.js';
import { Footer, FOOTER_LINKS } from '../../../pages/layout/footer.page.js';
import { siteSettings } from '../../../services/siteApi.js';

const DEFAULT_TAGLINE = 'Discover the world, one destination at a time.';
const SOCIAL = ['facebook_url', 'instagram_url', 'twitter_url', 'youtube_url'];

let footer;

test.beforeEach(async ({ page }) => {
  footer = new Footer(page);
  await page.goto('/');
});

/** The texts the footer should show for these settings, and those it should not. */
function footerTexts(settings) {
  const contact = ['contact_email', 'contact_phone', 'contact_address']
    .map((key) => settings[key])
    .filter(Boolean);
  const noContact = !settings.contact_email && !settings.contact_phone;
  const fee = `Service fee: ${settings.service_fee_percent}%`;
  const hasFee = Number(settings.service_fee_percent) > 0;
  return {
    shown: [
      settings.site_tagline || DEFAULT_TAGLINE,
      ...contact,
      ...(noContact ? ['Not configured'] : []),
      ...(hasFee ? [fee] : []),
    ],
    absent: hasFee ? [] : [fee],
  };
}

test('TRV-4-NAV22 The footer shows the site details', async ({ request }) => {
  const settings = await siteSettings(request);
  const { root } = footer;
  const { shown, absent } = footerTexts(settings);
  await expect(root.getByRole('heading', { name: settings.site_name, exact: true })).toBeVisible();
  for (const text of shown) await expect(root.getByText(text, { exact: true })).toBeVisible();
  for (const text of absent) await expect(root.getByText(text, { exact: true })).toBeHidden();
  await expect(root).toContainText(
    `All prices in ${settings.currency_code} (${settings.currency_symbol})`,
  );
});

test('TRV-4-NAV23 The footer links open their pages', async ({ page }) => {
  await page.goto('/about');
  for (const { name, path } of FOOTER_LINKS) {
    await footer.link(name).click();
    await expect(page).toHaveURL(path);
  }
});

test('TRV-4-NAV24 The copyright shows this year', async ({ request }) => {
  const { site_name: siteName } = await siteSettings(request);
  await expect(footer.copyright).toHaveText(
    `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`,
  );
});

test('TRV-4-NAV25 Social links show only when set', async ({ request }) => {
  const settings = await siteSettings(request);
  const set = SOCIAL.map((key) => settings[key]).filter(Boolean);
  await expect(footer.copyright).toBeVisible();
  await expect(footer.socialLinks).toHaveCount(set.length);
  for (const [i, url] of set.entries()) {
    await expect(footer.socialLinks.nth(i)).toHaveAttribute('href', url);
  }
});
