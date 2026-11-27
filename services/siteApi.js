import { baseUrl } from '../config/env.js';

const api = (path) => `${baseUrl()}/api/v1/${path}`;

/** The site settings the pages show: site name, headings, contact details and so on. */
export async function siteSettings(request) {
  const response = await request.get(api('core/settings/'));
  if (!response.ok()) throw new Error(`Site settings failed: HTTP ${response.status()}`);
  return response.json();
}

/** The first page of published destinations. */
export async function destinations(request) {
  const response = await request.get(api('destinations/'));
  if (!response.ok()) throw new Error(`Destinations failed: HTTP ${response.status()}`);
  return (await response.json()).results;
}
