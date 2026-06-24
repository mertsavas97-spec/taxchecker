'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useState } from 'react';

import {
  buildGa4InitScript,
  hasAnalyticsInternalCookie,
  shouldSkipGa4Tracking,
  shouldTagGa4InternalTraffic,
} from '@/lib/analytics/internal-traffic';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function GoogleAnalytics({
  hasAdminSession = false,
}: {
  hasAdminSession?: boolean;
}) {
  const pathname = usePathname() ?? '/';
  const [hasInternalCookie, setHasInternalCookie] = useState(false);

  useEffect(() => {
    setHasInternalCookie(hasAnalyticsInternalCookie(document.cookie));
  }, [pathname, hasAdminSession]);

  if (!GA_ID) {
    return null;
  }

  const skipTracking = shouldSkipGa4Tracking({
    pathname,
    hasAdminSession,
    hasInternalCookie,
  });

  if (skipTracking) {
    return null;
  }

  const tagInternalTraffic = shouldTagGa4InternalTraffic({
    pathname,
    hasAdminSession,
    hasInternalCookie,
  });

  const initScript = buildGa4InitScript({
    measurementId: GA_ID,
    tagInternalTraffic,
  });

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {initScript}
      </Script>
    </>
  );
}
