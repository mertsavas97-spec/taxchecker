import { LegalPageLayout } from '@/components/legal/legal-page-layout';
import { termsLegalContent } from '@/lib/legal/content/terms';
import { getTrustPageBySlug } from '@/config/trust-pages';
import { createTrustPageMetadata } from '@/lib/trust-pages/create-trust-page';

export const generateMetadata = () => createTrustPageMetadata('terms');

export default function TermsPage() {
  return (
    <LegalPageLayout page={getTrustPageBySlug('terms')!} content={termsLegalContent} />
  );
}
