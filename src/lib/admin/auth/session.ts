import { createHmac, timingSafeEqual } from 'crypto';

import { getAdminPassword } from '@/lib/admin/auth/constants';

export { createAdminSessionToken, verifyAdminSessionToken } from '@/lib/admin/auth/session-token';

export function validateAdminPassword(password: string): boolean {
  const input = password.trim();
  if (!input) return false;

  const expectedBuffer = Buffer.from(getAdminPassword(), 'utf8');
  const inputBuffer = Buffer.from(input, 'utf8');

  if (expectedBuffer.length !== inputBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, inputBuffer);
}

/** Node-only HMAC helper retained for tests or future sync callers. */
export function signPayloadNode(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}
