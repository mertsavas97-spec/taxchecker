import { generateOgImage } from '@/lib/og/generate-image';

export const runtime = 'nodejs';

export async function GET() {
  return generateOgImage({
    title: 'Federal Tax Calculators',
    badge: 'TaxChecker',
    subtitle: 'Free federal tax estimates from IRS publications — not tax advice',
  });
}
