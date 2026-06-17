import { LegalPageLayout } from '@/components/legal/legal-page-layout';
import { privacyLegalContent } from '@/lib/legal/content/privacy';
import { getTrustPageBySlug } from '@/config/trust-pages';
import { createTrustPageMetadata } from '@/lib/trust-pages/create-trust-page';

export const generateMetadata = () => createTrustPageMetadata('privacy');

export default function PrivacyPage() {
  return (
    <LegalPageLayout page={getTrustPageBySlug('privacy')!} content={privacyLegalContent} />
  );
}
