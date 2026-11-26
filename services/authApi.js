import { baseUrl } from '../config/env.js';
import { testConfig } from '../config/test.config.js';

const api = (path) => `${baseUrl()}/api/v1/auth/${path}`;

/** Signs in through the API and returns { access, refresh, user }. */
export async function loginByApi(request, { email, password }) {
  const response = await request.post(api('login/'), { data: { email, password } });
  if (!response.ok()) throw new Error(`Login failed: HTTP ${response.status()}`);
  return response.json();
}

/** Signs in through the API and returns the raw response, for checks on refused sign-ins. */
export function tryLoginByApi(request, { email, password }) {
  return request.post(api('login/'), { data: { email, password } });
}

/**
 * Creates an account through the API, for tests that need one to exist already.
 * Returns { access, refresh, user } for the new account.
 */
export async function registerByApi(request, { firstName, lastName, email, password }) {
  const response = await request.post(api('register/'), {
    data: { first_name: firstName, last_name: lastName, email, password, password2: password },
    timeout: testConfig.timeouts.registration,
  });
  if (!response.ok()) throw new Error(`Account setup failed: HTTP ${response.status()}`);
  return response.json();
}

/** Asks for a new sign-in with a refresh token. Returns the raw response. */
export function refreshByApi(request, refresh) {
  return request.post(api('token/refresh/'), { data: { refresh } });
}

/** Asks for a password reset email. Each call sends a real email for a registered address. */
export async function requestResetByApi(request, email) {
  const response = await request.post(api('password/forgot/'), { data: { email } });
  if (!response.ok()) throw new Error(`Reset request failed: HTTP ${response.status()}`);
}

/** Sets a new password with a reset link's uid and token. */
export async function resetPasswordByApi(request, { uid, token }, password) {
  const response = await request.post(api('password/reset/'), {
    data: { uid, token, new_password: password, new_password2: password },
  });
  if (!response.ok()) throw new Error(`Password reset failed: HTTP ${response.status()}`);
}
