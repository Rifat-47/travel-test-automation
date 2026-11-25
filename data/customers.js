import { randomUUID } from 'node:crypto';
import { requireEnv } from '../config/env.js';

const uniqueTag = () => randomUUID().replaceAll('-', '').slice(0, 16);

/** An unused plus alias of the customer's mailbox. */
export function newEmail() {
  const [name, domain] = requireEnv('CUSTOMER_EMAIL').toLowerCase().split('@');
  return `${name}+${uniqueTag()}@${domain}`;
}

/** Valid registration details: an unused email and a strong password, new on each call. */
export function newCustomer(overrides = {}) {
  return {
    firstName: 'Test',
    lastName: 'Customer',
    email: newEmail(),
    password: `Trv!${uniqueTag()}`,
    ...overrides,
  };
}
