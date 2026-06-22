import { site } from '@/config/site';

export const CANONICAL_HOSTNAME = new URL(site.productionUrl).hostname;
export const CANONICAL_ORIGIN = site.productionUrl;

export const NON_CANONICAL_ROBOTS_HEADER = 'noindex, nofollow';
export const CANONICAL_REDIRECT_STATUS = 308;

const APEX_HOSTNAME = site.domain;
const VERCEL_PRODUCTION_ALIAS = 'taxchecker.vercel.app';

export type HostPolicyAction = 'pass' | 'redirect' | 'noindex';

export interface HostPolicy {
  action: HostPolicyAction;
}

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().split(':')[0] ?? '';
}

export function isLocalDevHost(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized.endsWith('.local')
  );
}

export function isCanonicalHost(hostname: string): boolean {
  return normalizeHostname(hostname) === CANONICAL_HOSTNAME;
}

export function isVercelAppHost(hostname: string): boolean {
  return normalizeHostname(hostname).endsWith('.vercel.app');
}

export function isVercelPreviewHost(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  if (!normalized.endsWith('.vercel.app')) {
    return false;
  }
  return normalized !== VERCEL_PRODUCTION_ALIAS;
}

export function resolveHostPolicy(hostname: string): HostPolicy {
  const normalized = normalizeHostname(hostname);

  if (!normalized || isLocalDevHost(normalized) || normalized === CANONICAL_HOSTNAME) {
    return { action: 'pass' };
  }

  if (isVercelPreviewHost(normalized)) {
    return { action: 'noindex' };
  }

  return { action: 'redirect' };
}

export function shouldRedirectToCanonical(hostname: string): boolean {
  return resolveHostPolicy(hostname).action === 'redirect';
}

export function shouldNoIndexHost(hostname: string): boolean {
  const action = resolveHostPolicy(hostname).action;
  return action === 'noindex' || action === 'redirect';
}

export function buildCanonicalRedirectUrl(requestUrl: string): URL {
  const source = new URL(requestUrl);
  const target = new URL(source.pathname + source.search, CANONICAL_ORIGIN);
  return target;
}

export function nonCanonicalRedirectHeaders(location: string | URL): HeadersInit {
  return {
    Location: typeof location === 'string' ? location : location.toString(),
    'X-Robots-Tag': NON_CANONICAL_ROBOTS_HEADER,
  };
}

export function getRequestHostname(request: { headers: Headers; nextUrl: URL }): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const hostHeader = request.headers.get('host');
  const rawHost = forwardedHost?.split(',')[0]?.trim() || hostHeader || request.nextUrl.host;
  return normalizeHostname(rawHost);
}

export { APEX_HOSTNAME, VERCEL_PRODUCTION_ALIAS };
