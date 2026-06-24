/** GA4 `traffic_type` value matched by the Internal Traffic data filter. */
export const GA4_INTERNAL_TRAFFIC_TYPE = 'internal';

/** Non-sensitive marker cookie set for authenticated admin sessions. */
export const ANALYTICS_INTERNAL_COOKIE = 'tc_analytics_internal';

export function isAdminAnalyticsPath(pathname: string): boolean {
  const normalized = pathname.trim();
  return normalized === '/admin' || normalized.startsWith('/admin/');
}

export function hasAnalyticsInternalCookie(cookieHeader: string | undefined): boolean {
  if (!cookieHeader) {
    return false;
  }

  return cookieHeader
    .split(';')
    .some((part) => part.trim().startsWith(`${ANALYTICS_INTERNAL_COOKIE}=1`));
}

export function shouldSkipGa4Tracking(options: {
  pathname: string;
  hasAdminSession: boolean;
  hasInternalCookie?: boolean;
}): boolean {
  if (isAdminAnalyticsPath(options.pathname)) {
    return true;
  }

  return options.hasAdminSession || options.hasInternalCookie === true;
}

export function shouldTagGa4InternalTraffic(options: {
  pathname: string;
  hasAdminSession: boolean;
  hasInternalCookie?: boolean;
}): boolean {
  if (isAdminAnalyticsPath(options.pathname)) {
    return false;
  }

  return options.hasAdminSession || options.hasInternalCookie === true;
}

export function buildGa4InitScript({
  measurementId,
  tagInternalTraffic,
}: {
  measurementId: string;
  tagInternalTraffic: boolean;
}): string {
  const internalConfig = tagInternalTraffic
    ? `{ traffic_type: '${GA4_INTERNAL_TRAFFIC_TYPE}' }`
    : '{}';

  const internalSet = tagInternalTraffic
    ? `gtag('set', { traffic_type: '${GA4_INTERNAL_TRAFFIC_TYPE}' });`
    : '';

  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    ${internalSet}
    gtag('config', '${measurementId}', ${internalConfig});
  `.trim();
}
