import { createHmac, timingSafeEqual } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const COOKIE_NAME = 'nailab_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} ortam değişkeni tanımlanmamış.`);
  return value;
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function signature(payload: string): string {
  const secret = requiredEnvironment('ADMIN_SESSION_SECRET');
  if (Buffer.byteLength(secret) < 32) {
    throw new Error('ADMIN_SESSION_SECRET en az 32 bayt olmalıdır.');
  }
  return createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');
}

export function verifyAdminCredentials(email: unknown, password: unknown): boolean {
  if (typeof email !== 'string' || typeof password !== 'string') return false;
  return safeEqual(email.trim().toLowerCase(), requiredEnvironment('ADMIN_EMAIL').trim().toLowerCase())
    && safeEqual(password, requiredEnvironment('ADMIN_PASSWORD'));
}

export function setAdminSessionCookie(res: VercelResponse): void {
  const payload = Buffer.from(JSON.stringify({
    email: requiredEnvironment('ADMIN_EMAIL').trim().toLowerCase(),
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  })).toString('base64url');
  const token = `${payload}.${signature(payload)}`;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_DURATION_SECONDS}${secure}`,
  );
}

export function clearAdminSessionCookie(res: VercelResponse): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`);
}

export function hasAdminSession(req: VercelRequest): boolean {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return false;
  const token = cookieHeader.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!token) return false;

  const [payload, providedSignature] = token.split('.');
  if (!payload || !providedSignature) return false;

  try {
    if (!safeEqual(providedSignature, signature(payload))) return false;
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      email?: unknown;
      expiresAt?: unknown;
    };
    return session.email === requiredEnvironment('ADMIN_EMAIL').trim().toLowerCase()
      && typeof session.expiresAt === 'number'
      && session.expiresAt > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function updateGlobalConfigItems(
  items: Array<{ key: string; value: unknown }>,
): Promise<void> {
  const configId = requiredEnvironment('VERCEL_GLOBAL_CONFIG_ID');
  const token = requiredEnvironment('VERCEL_TOKEN');
  const url = new URL(`https://api.vercel.com/v1/global-config/${encodeURIComponent(configId)}/items`);
  if (process.env.VERCEL_TEAM_ID) url.searchParams.set('teamId', process.env.VERCEL_TEAM_ID);

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: items.map(({ key, value }) => ({ operation: 'upsert', key, value })),
    }),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Vercel Global Config güncellenemedi (${response.status}): ${message}`);
  }
}

export function readRequestBody(req: VercelRequest): Record<string, unknown> | null {
  if (typeof req.body === 'string') {
    try {
      const parsed: unknown = JSON.parse(req.body);
      return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
        ? parsed as Record<string, unknown>
        : null;
    } catch {
      return null;
    }
  }
  return typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)
    ? req.body as Record<string, unknown>
    : null;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
