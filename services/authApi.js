import { apiOrigin } from '../config/env.js';

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
