import { getTrustPageBySlug, type TrustPageSlug } from '@/config/trust-pages';
import { generateOgImage } from '@/lib/og/generate-image';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const page = getTrustPageBySlug(slug as TrustPageSlug);

  if (!page) {
    return new Response('Page not found', { status: 404 });
  }

  return generateOgImage({
    title: page.title,
    badge: 'TaxChecker',
    subtitle: 'Federal tax estimates · From IRS publications · Not tax advice',
  });
}
