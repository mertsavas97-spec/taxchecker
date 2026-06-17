import { generateOgImage } from '@/lib/og/generate-image';
import { getHubOgContent } from '@/lib/og/paths';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ hub: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { hub } = await context.params;
  const content = getHubOgContent(hub);

  if (!content) {
    return new Response('Hub not found', { status: 404 });
  }

  return generateOgImage({
    title: content.title,
    badge: content.badge,
    subtitle: 'Federal tax estimates · From IRS publications · Not tax advice',
  });
}
