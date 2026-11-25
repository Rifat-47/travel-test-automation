import { apiOrigin } from '../config/env.js';
import { testConfig } from '../config/test.config.js';

/** Signs in through the API and returns { access, refresh, user }. */
export async function loginByApi(request, { email, password }) {
  const response = await request.post(`${apiOrigin()}/api/v1/auth/login/`, {
    data: { email, password },
  });
  if (!response.ok()) {
    throw new Error(`Login failed for the configured customer: HTTP ${response.status()}`);
  }
  return response.json();
}

/** Creates an account through the API, for tests that need one to exist already. */
export async function registerByApi(request, { firstName, lastName, email, password }) {
  const response = await request.post(`${apiOrigin()}/api/v1/auth/register/`, {
    data: { first_name: firstName, last_name: lastName, email, password, password2: password },
    timeout: testConfig.timeouts.registration,
  });
  if (!response.ok()) throw new Error(`Account setup failed: HTTP ${response.status()}`);
}
