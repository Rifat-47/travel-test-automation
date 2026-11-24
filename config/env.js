import 'dotenv/config';

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. Copy .env.example to .env and fill it in.`);
  return value;
}

export const baseUrl = () => process.env.BASE_URL || 'http://localhost:5173';
export const apiOrigin = () => process.env.API_ORIGIN || baseUrl();
