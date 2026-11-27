import { test, expect } from '../../../fixtures/test.js';
import { HomePage } from '../../../pages/home/home.page.js';
import { HOME_FEATURES, NO_RESULTS, POSTS, replyWith } from '../../../services/fakeReplies.js';
import { homeFeatures, posts, siteSettings } from '../../../services/siteApi.js';

/** Opens Home and returns its sections, under the headings in the site settings. */
async function openHome(page, request) {
  const settings = await siteSettings(request);
  const home = new HomePage(page);
  await home.open();
  return {
    home,
    featured: home.featured(settings.home_featured_heading),
    features: home.features(),
    blog: home.blog(settings.home_blog_heading),
  };
}

test('TRV-5-HOM18 The section shows each item', async ({ page, request }) => {
  const items = await homeFeatures(request);
  const { features } = await openHome(page, request);
  await expect(features.titles).toHaveText(items.map((item) => item.title));
  for (const item of items) {
    await expect(features.section.getByText(item.icon, { exact: true })).toBeVisible();
    await expect(features.section.getByText(item.description, { exact: true })).toBeVisible();
  }
});

test('TRV-5-HOM19 The section hides when there are no items', async ({ page, request }) => {
  await replyWith(page, HOME_FEATURES, []);
  const { featured, features } = await openHome(page, request);
  await expect(featured.cards.first()).toBeVisible();
  await expect(features.section).toHaveCount(0);
});

test('TRV-5-HOM20 The section shows the newest posts', async ({ page, request }) => {
  const newest = (await posts(request)).slice(0, 3);
  const { blog } = await openHome(page, request);
  await expect(blog.viewAll).toBeVisible();
  await expect(blog.cards).toHaveCount(newest.length);
  await expect(blog.cards.getByRole('heading', { level: 3 })).toHaveText(
    newest.map((post) => post.title),
  );
});

test("TRV-5-HOM21 A post card shows the post's details", async ({ page, request }) => {
  const [post] = await posts(request);
  const { blog } = await openHome(page, request);
  const card = blog.cards.first();
  await expect(card).toHaveAttribute('href', `/blog/${post.slug}`);
  await expect(card.getByRole('img')).toHaveAttribute('alt', post.title);
  await expect(card.getByText(post.category.name, { exact: true })).toBeVisible();
  await expect(card.getByRole('heading', { level: 3 })).toHaveText(post.title);
  await expect(card.getByText(post.excerpt, { exact: true })).toBeVisible();
  const date = new Date(post.published_at).toLocaleDateString('en-US');
  await expect(card.getByText(date, { exact: true })).toBeVisible();
});

test('TRV-5-HOM22 A post card opens the post', async ({ page, request }) => {
  const { blog } = await openHome(page, request);
  const card = blog.cards.first();
  const href = await card.getAttribute('href');
  await card.click();
  await expect(page).toHaveURL(href);
});

test('TRV-5-HOM23 View all opens the blog', async ({ page, request }) => {
  const { blog } = await openHome(page, request);
  await blog.viewAll.click();
  await expect(page).toHaveURL('/blog');
});

test('TRV-5-HOM24 The section hides when there are no posts', async ({ page, request }) => {
  await replyWith(page, POSTS, NO_RESULTS);
  const { featured, blog } = await openHome(page, request);
  await expect(featured.cards.first()).toBeVisible();
  await expect(blog.section).toHaveCount(0);
});
