import type { LegalPageContent } from '@/lib/legal/types';
import { legalEntity } from '@/config/legal-entity';
import { site } from '@/config/site';

export const privacyLegalContent: LegalPageContent = {
  eyebrow: 'Privacy Policy',
  summary:
    'How TaxChecker handles information when you use our federal tax calculators, resources, and website. Calculator inputs stay in your browser during normal use.',
  sections: [
    {
      id: 'operator',
      heading: 'Operator',
      paragraphs: [
        `${legalEntity.operatingName} is operated by ${legalEntity.legalName} (${legalEntity.jurisdiction}). Contact address: ${legalEntity.contactAddress}.`,
      ],
    },
    {
      id: 'information-we-collect',
      heading: 'Information We Collect',
      paragraphs: [
        'TaxChecker is designed to minimize personal data collection. We do not require an account to use calculators or read educational content.',
        'We may process limited technical information through our hosting infrastructure, such as IP address, browser type, referring URL, and request timestamps, to operate and secure the website.',
        'If you submit our contact form, we collect the name, email address, topic, and message you provide solely to respond to your inquiry or process a privacy request.',
      ],
    },
    {
      id: 'calculator-inputs',
      heading: 'Calculator Inputs',
      paragraphs: [
        'Federal tax calculator inputs are processed locally in your browser to produce estimates. TaxChecker does not store your calculator inputs on our servers as part of standard calculator operation.',
        'TaxChecker does not provide tax filing services and does not receive return data, W-2s, 1099s, or other filing documents through the calculators.',
        'Do not submit Social Security numbers, bank account details, full tax returns, or other highly sensitive tax documents through our contact form.',
      ],
    },
    {
      id: 'cookies',
      heading: 'Cookies',
      paragraphs: [
        'TaxChecker may use essential cookies required for site functionality, security, and session management where applicable.',
        'We do not use advertising cookies, affiliate tracking cookies, or cross-site profiling cookies.',
      ],
    },
    {
      id: 'analytics',
      heading: 'Analytics',
      paragraphs: [
        'We may introduce privacy-conscious analytics in the future to understand aggregate traffic patterns, such as page views and general device categories. If we enable analytics, we will update this policy to name the provider, describe what is collected, and explain any choices available to you.',
        'Analytics, if enabled, would be used to improve content and site performance—not to sell personal information or provide individualized tax guidance.',
        'As of the last updated date on this page, TaxChecker does not use third-party marketing or behavioral advertising analytics on the public website.',
      ],
    },
    {
      id: 'third-party-services',
      heading: 'Third-Party Services',
      paragraphs: [
        'TaxChecker relies on infrastructure and service providers for hosting, content management in administrative environments, and related operational services.',
        'When you submit our contact form, your message is delivered by Resend, Inc. (resend.com), an email delivery service. Resend processes the name, email address, topic, and message you provide so we can receive and respond to your inquiry. Resend operates under its own privacy policy and terms.',
        'Calculator and resource pages may link to IRS.gov and other external reference sites. Those sites operate under their own privacy policies.',
        'We do not sell personal information to third parties for money. We do not share personal information for cross-context behavioral advertising.',
      ],
    },
    {
      id: 'data-retention',
      heading: 'Data Retention',
      paragraphs: [
        'Contact form submissions are retained only as long as needed to respond to your inquiry, fulfill a privacy request, and maintain reasonable operational records.',
        'Server logs may be retained for a limited period for security and troubleshooting, then rotated or deleted according to hosting provider practices.',
      ],
    },
    {
      id: 'childrens-privacy',
      heading: "Children's Privacy",
      paragraphs: [
        'TaxChecker is not directed to children under 13 years of age, and we do not knowingly collect personal information from children under 13.',
        'If you believe a child under 13 has submitted personal information through our contact form, please contact us and we will take reasonable steps to delete it.',
      ],
    },
    {
      id: 'california-privacy-rights',
      heading: 'California Privacy Rights (CPRA / CCPA)',
      paragraphs: [
        'If you are a California resident, you may have the right to know what personal information we collect, request access to or deletion of personal information we maintain about you, request correction of inaccurate personal information, and not be discriminated against for exercising these rights.',
        'TaxChecker does not sell personal information. We do not share personal information for cross-context behavioral advertising as those terms are commonly defined under California law.',
        'To submit a privacy request, use our contact form and select "Privacy Request." We may need to verify your identity before fulfilling a request. Authorized agents may submit requests on your behalf where permitted by law.',
      ],
    },
    {
      id: 'other-us-state-rights',
      heading: 'Other U.S. State Privacy Rights',
      paragraphs: [
        'Residents of certain other U.S. states may have similar rights regarding access, deletion, correction, and opt-out of certain processing. Because TaxChecker does not sell personal information or use targeted advertising cookies, many opt-out mechanisms may not apply today.',
        'You may contact us using the Privacy Request topic on our contact form to ask about rights that may apply in your state.',
      ],
    },
    {
      id: 'international-users',
      heading: 'International Users',
      paragraphs: [
        'TaxChecker is intended primarily for users in the United States researching U.S. federal tax topics. If you access the website from outside the United States, you understand that your information may be processed in the United States where our service providers operate.',
        'We do not represent that this policy satisfies all legal requirements outside the United States, and we have not implemented a separate GDPR compliance program at this time.',
      ],
    },
    {
      id: 'professional-relationships',
      heading: 'No Professional Relationship',
      paragraphs: [
        'Use of TaxChecker does not create an attorney-client relationship, accountant-client relationship, enrolled-agent-client relationship, or any other professional advisory relationship.',
        'TaxChecker does not provide tax filing services and does not prepare, review, or transmit tax returns on your behalf.',
      ],
    },
    {
      id: 'contact',
      heading: 'Contact',
      paragraphs: [
        'For privacy-related questions, access or deletion requests, or other privacy rights inquiries, use our contact form and select "Privacy Request." We do not publish a public support email address on this website.',
      ],
    },
  ],
  footer: site.disclaimer,
};
