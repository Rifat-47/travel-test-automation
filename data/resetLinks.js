import { randomUUID } from 'node:crypto';

/** The link's account part, as the site writes it: the account number in URL-safe base64. */
export const accountPart = (userId) => Buffer.from(String(userId)).toString('base64url');

/** A reset code the site never issued. */
export const madeUpCode = () => `${randomUUID().slice(0, 6)}-${randomUUID().replaceAll('-', '')}`;

/** A reset link for an account that does not exist. */
export const madeUpLink = () => ({ uid: accountPart(2_000_000_000), token: madeUpCode() });
