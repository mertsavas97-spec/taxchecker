import type { CmsFaqItem } from '@/lib/admin/content/types';
import { normalizePublishedFaqs } from '@/lib/cms/faq-utils';

const MAX_RECOMMENDED_ANSWER_LENGTH = 500;
const PERSONALIZED_ADVICE_PATTERN =
  /\b(you should|you must|your specific|for your situation|contact me|hire me|i recommend you)\b/i;

export interface CmsFaqEditorGuidanceCheck {
  id: string;
  label: string;
  passed: boolean;
}

export function getCmsFaqEditorGuidance(faqs: CmsFaqItem[]): CmsFaqEditorGuidanceCheck[] {
  const normalized = normalizePublishedFaqs(faqs);

  return [
    {
      id: 'faq-count',
      label: '3+ FAQs recommended for rich results',
      passed: normalized.length >= 3,
    },
    {
      id: 'faq-concise',
      label: 'FAQ answers should be concise',
      passed:
        normalized.length === 0 ||
        normalized.every((item) => item.answer.length <= MAX_RECOMMENDED_ANSWER_LENGTH),
    },
    {
      id: 'faq-no-advice',
      label: 'Avoid personalized tax advice in answers',
      passed:
        normalized.length === 0 ||
        !normalized.some(
          (item) =>
            PERSONALIZED_ADVICE_PATTERN.test(item.question) ||
            PERSONALIZED_ADVICE_PATTERN.test(item.answer),
        ),
    },
  ];
}
