import { getPublishedBlogPostBySlugPublic } from '@/lib/cms/public-read';
import { generateOgImage } from '@/lib/og/generate-image';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const post = await getPublishedBlogPostBySlugPublic(slug);

  if (!post) {
    return new Response('Blog post not found', { status: 404 });
  }

  return generateOgImage({
    title: post.seoTitle || post.title,
    badge: post.category,
    subtitle: 'Federal tax planning · From IRS publications · Not tax advice',
  });
}
