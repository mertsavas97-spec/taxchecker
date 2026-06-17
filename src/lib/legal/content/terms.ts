import type { LegalPageContent } from '@/lib/legal/types';
import { legalEntity } from '@/config/legal-entity';
import { site } from '@/config/site';

export const termsLegalContent: LegalPageContent = {
  eyebrow: 'Terms of Use',
  summary:
    'The rules governing access to TaxChecker federal tax calculators, educational resources, and website features. By using the site, you agree to these terms.',
  sections: [
    {
      id: 'operator',
      heading: 'Operator',
      paragraphs: [
        `${legalEntity.operatingName} is operated by ${legalEntity.legalName}, organized under the laws of ${legalEntity.jurisdiction}. Contact address: ${legalEntity.contactAddress}.`,
        'TaxChecker provides free online federal tax estimation tools, educational articles, and reference resources for planning and learning purposes—not tax preparation, filing, or professional advisory services.',
      ],
    },
    {
      id: 'service-description',
      heading: 'Service Description',
      paragraphs: [
        'The service is provided on an informational basis. Features, calculators, and content may change as tax years update or the site evolves.',
      ],
    },
    {
      id: 'eligibility',
      heading: 'Eligibility',
      paragraphs: [
        'You must be at least 18 years old, or the age of majority in your jurisdiction, to use TaxChecker.',
        'You are responsible for ensuring your use complies with applicable laws in your location.',
      ],
    },
    {
      id: 'acceptable-use',
      heading: 'Acceptable Use',
      paragraphs: [
        'You agree not to misuse the website, attempt unauthorized access, interfere with site operation, scrape content in violation of these terms, or use automated systems to overwhelm our infrastructure.',
        'You agree not to misrepresent TaxChecker outputs as official IRS determinations, filed returns, or professional advice.',
      ],
    },
    {
      id: 'intellectual-property',
      heading: 'Intellectual Property',
      paragraphs: [
        'TaxChecker content, design, branding, and calculator implementations are protected by applicable intellectual property laws, except where noted.',
        'IRS publications, forms, and related federal reference materials cited on the site are public domain or government materials used for reference.',
      ],
    },
    {
      id: 'no-professional-advice',
      heading: 'No Professional Advice',
      paragraphs: [
        'TaxChecker does not provide tax, legal, accounting, or financial advice. Calculator outputs are educational estimates based on simplified models and user-supplied inputs.',
        'Results may differ from your actual tax liability, withholding, safe harbor amounts, credits, penalties, or filing requirements.',
        'You are responsible for verifying inputs, interpreting results, and consulting qualified professionals before filing returns or making tax or business decisions.',
      ],
    },
    {
      id: 'no-warranty',
      heading: 'No Warranty',
      paragraphs: [
        'TaxChecker is provided "as is" and "as available" without warranties of any kind, whether express or implied, including implied warranties of merchantability, fitness for a particular purpose, or non-infringement.',
        'We do not warrant that the website will be uninterrupted, error-free, or free of harmful components.',
      ],
    },
    {
      id: 'limitation-of-liability',
      heading: 'Limitation of Liability',
      paragraphs: [
        `To the fullest extent permitted by law, ${legalEntity.legalName}, ${legalEntity.operatingName}, and their owners, operators, affiliates, and suppliers shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the website or reliance on any estimate, article, or tool.`,
        'Your sole remedy for dissatisfaction with the service is to stop using the website.',
      ],
    },
    {
      id: 'liability-cap',
      heading: 'Liability Cap',
      paragraphs: [
        `To the extent permitted by applicable law, the total aggregate liability of ${legalEntity.legalName} and ${legalEntity.operatingName} for any claim arising out of or relating to these Terms or your use of the website shall not exceed the greater of (a) one hundred U.S. dollars (US $100) or (b) the amount you paid to use TaxChecker in the twelve (12) months before the event giving rise to the claim. Because TaxChecker is currently offered without charge, the cap is one hundred U.S. dollars (US $100) unless a paid feature applies to your use.`,
        'Some jurisdictions do not allow certain limitations of liability; in those jurisdictions, our liability is limited to the maximum extent permitted by law.',
      ],
    },
    {
      id: 'indemnification',
      heading: 'Indemnification',
      paragraphs: [
        `You agree to defend, indemnify, and hold harmless ${legalEntity.legalName}, ${legalEntity.operatingName}, and their owners, operators, and suppliers from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising from your use of the website, your violation of these Terms, your misuse of calculator outputs, or your violation of any law or third-party right.`,
      ],
    },
    {
      id: 'disputes',
      heading: 'Disputes',
      paragraphs: [
        'If you have a concern about the website, please contact us through our contact form first so we can try to resolve it informally.',
        'Except where prohibited by law, any dispute that cannot be resolved informally shall be brought in the courts located in the venue described below, and you consent to personal jurisdiction in those courts.',
      ],
    },
    {
      id: 'governing-law',
      heading: 'Governing Law',
      paragraphs: [
        `These Terms are governed by the laws of ${legalEntity.governingLawState}, without regard to conflict-of-law principles, except where mandatory consumer protection laws in your state of residence apply.`,
      ],
    },
    {
      id: 'venue',
      heading: 'Venue',
      paragraphs: [
        `Subject to applicable law, you agree that exclusive venue for disputes relating to these Terms or the website shall be in ${legalEntity.venue}.`,
      ],
    },
    {
      id: 'changes-to-terms',
      heading: 'Changes To Terms',
      paragraphs: [
        'We may modify these Terms of Use at any time. Material changes will be reflected on this page with an updated date.',
        'Continued use of TaxChecker after changes become effective constitutes acceptance of the revised terms.',
      ],
    },
    {
      id: 'contact',
      heading: 'Contact',
      paragraphs: [
        'Questions about these Terms of Use may be submitted through our contact form. We do not publish a public legal support email address on this website.',
      ],
    },
  ],
  footer: site.disclaimer,
};
