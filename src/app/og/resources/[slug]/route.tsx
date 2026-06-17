import { getResourceBySlug } from '@/config/resources';
import { generateOgImage } from '@/lib/og/generate-image';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const resource = getResourceBySlug(slug);

  if (!resource) {
    return new Response('Resource not found', { status: 404 });
  }

  return generateOgImage({
    title: resource.title,
    badge: 'Federal tax guide',
    subtitle: `Tax year ${resource.taxYear ?? 2025} · Planning reference · Not tax advice`,
  });
}
