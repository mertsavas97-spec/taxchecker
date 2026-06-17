import { getCalculatorByEngineId } from '@/config/calculators';
import { generateOgImage } from '@/lib/og/generate-image';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ engineId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { engineId } = await context.params;
  const calculator = getCalculatorByEngineId(engineId);

  if (!calculator) {
    return new Response('Calculator not found', { status: 404 });
  }

  return generateOgImage({
    title: calculator.title,
    badge: 'Federal tax calculator',
    subtitle: `Tax year ${calculator.taxYear} · From IRS publications · Not tax advice`,
  });
}
