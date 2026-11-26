/**
 * A short-lived sign-in that the app reads as expired (exp in 1970).
 * The app checks the expiry itself before calling the server, so the signature does not matter.
 */
export const expiredAccessToken = () =>
  ['e30', Buffer.from(JSON.stringify({ exp: 1 })).toString('base64'), 'expired'].join('.');

/** A long-lived sign-in the server will never accept. */
export const invalidRefreshToken = () => 'not-a-valid-refresh-token';
