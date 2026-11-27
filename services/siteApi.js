import { baseUrl } from '../config/env.js';

const api = (path) => `${baseUrl()}/api/v1/${path}`;

async function getJson(request, path, params) {
  const response = await request.get(api(path), { params });
  if (!response.ok()) throw new Error(`GET ${path} failed: HTTP ${response.status()}`);
  return response.json();
}

/** The site settings the pages show: site name, headings, contact details and so on. */
export function siteSettings(request) {
  return getJson(request, 'core/settings/');
}

/** The first page of published destinations. */
export async function destinations(request) {
  return (await getJson(request, 'destinations/')).results;
}

/** Every featured destination, in the site's order. */
export async function featuredDestinations(request) {
  return (await getJson(request, 'destinations/', { featured: 'true', page_size: 500 })).results;
}

/** The "Why Travel With Us?" items, in the site's order. */
export async function homeFeatures(request) {
  const items = await getJson(request, 'core/home-features/');
  return items.toSorted((a, b) => a.order - b.order);
}

/** Every published blog post, newest first. */
export async function posts(request) {
  const { results } = await getJson(request, 'blog/posts/', { page_size: 100 });
  return results.toSorted((a, b) => new Date(b.published_at) - new Date(a.published_at));
}

/** Every published destination as the list shows them, newest first unless params say otherwise. */
export async function allDestinations(request, params = {}) {
  return (await getJson(request, 'destinations/', { page_size: 500, ...params })).results;
}

/** Every published destination with its full details (description, creation time), newest first. */
export async function destinationDetails(request) {
  const list = await allDestinations(request);
  // One at a time: the local server fails when asked for all of them at once.
  const details = [];
  for (const d of list) details.push(await getJson(request, `destinations/${d.slug}/`));
  return details;
}

/** The destination categories, in the site's order. */
export function destinationCategories(request) {
  return getJson(request, 'core/categories/');
}

/** The countries that have a destination, A to Z. */
export function destinationCountries(request) {
  return getJson(request, 'core/countries/');
}
