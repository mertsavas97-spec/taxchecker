import { LegalPageLayout } from '@/components/legal/legal-page-layout';
import { disclaimerLegalContent } from '@/lib/legal/content/disclaimer';
import { getTrustPageBySlug } from '@/config/trust-pages';
import { createTrustPageMetadata } from '@/lib/trust-pages/create-trust-page';

export const generateMetadata = () => createTrustPageMetadata('disclaimer');

export default function DisclaimerPage() {
  return (
    <LegalPageLayout
      page={getTrustPageBySlug('disclaimer')!}
      content={disclaimerLegalContent}
    />
  );
}
