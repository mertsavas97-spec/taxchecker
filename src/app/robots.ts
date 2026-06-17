import type { MetadataRoute } from 'next';

import { getReadyCalculators } from '@/config/calculators';
import { getPublishableResources } from '@/config/resources';
import { site } from '@/config/site';
import { absoluteUrl } from '@/lib/seo/urls';

const DISALLOWED_PATHS = [
  '/api/',
  '/_next/',
  '/dev/',
  '/preview/',
  '/admin/',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: DISALLOWED_PATHS,
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: site.productionUrl,
  };
}
