import { test, expect } from '../../../fixtures/test.js';
import { HomePage } from '../../../pages/home/home.page.js';
import { changeReply, SETTINGS } from '../../../services/fakeReplies.js';
import { siteSettings } from '../../../services/siteApi.js';

test('TRV-5-HOM01 The hero shows the heading and text from the settings', async ({
  page,
  request,
}) => {
  const settings = await siteSettings(request);
  const home = new HomePage(page);
  await home.open();
  await expect(home.heroHeading).toHaveText(settings.hero_heading);
  await expect(home.heroText).toHaveText(settings.hero_subheading);
});

test('TRV-5-HOM02 Explore Destinations opens Destinations', async ({ page }) => {
  const home = new HomePage(page);
  await home.open();
  await home.exploreDestinations.click();
  // Destinations adds its page number to the address.
  await expect(page).toHaveURL(/\/destinations(\?page=1)?$/);
});

test('TRV-5-HOM03 Get in Touch opens Contact', async ({ page }) => {
  const home = new HomePage(page);
  await home.open();
  await home.getInTouch.click();
  await expect(page).toHaveURL('/contact');
});

test('TRV-5-HOM04 The hero has default texts', async ({ page }) => {
  const home = new HomePage(page);
  await changeReply(page, SETTINGS, (settings) => ({
    ...settings,
    hero_heading: '',
    hero_subheading: '',
  }));
  await home.open();
  await expect(home.heroHeading).toHaveText('Discover Your Next Adventure');
  await expect(home.heroText).toHaveText('Explore breathtaking destinations around the world');
});

test('TRV-5-HOM05 The page description follows the settings', async ({ page, request }) => {
  const settings = await siteSettings(request);
  const home = new HomePage(page);
  await home.open();
  await expect(home.description).toHaveAttribute(
    'content',
    settings.meta_description || settings.hero_subheading,
  );
});
