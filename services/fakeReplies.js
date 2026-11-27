// Fakes the site's replies in one page, for states the site does not have
// (no posts, a destination with reviews, a server failure). Nothing is changed on the server.

const API = '/api/v1/';

const isApi =
  (path, params = {}) =>
  (url) =>
    url.pathname === `${API}${path}` &&
    Object.entries(params).every(([key, value]) => url.searchParams.get(key) === value);

/** The request Home makes for its featured destinations. */
export const FEATURED = isApi('destinations/', { featured: 'true' });
export const SETTINGS = isApi('core/settings/');
export const HOME_FEATURES = isApi('core/home-features/');
export const POSTS = isApi('blog/posts/');

/** Lets the real reply through, after passing its JSON body through change(). */
export function changeReply(page, request, change) {
  return page.route(request, async (route) => {
    try {
      const response = await route.fetch();
      await route.fulfill({ response, json: change(await response.json()) });
    } catch (error) {
      // A reply still on its way when the test ends is dropped with the page.
      if (!page.isClosed()) throw error;
    }
  });
}

/** Answers with this JSON body instead of asking the server. */
export function replyWith(page, request, json) {
  return page.route(request, (route) => route.fulfill({ json }));
}

/** Answers as a failing server would. */
export function failReply(page, request) {
  return page.route(request, (route) =>
    route.fulfill({ status: 500, contentType: 'text/html', body: '<h1>Server Error (500)</h1>' }),
  );
}

/** An empty page of results. */
export const NO_RESULTS = { count: 0, next: null, previous: null, results: [] };
