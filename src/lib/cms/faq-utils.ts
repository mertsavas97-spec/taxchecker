import type { CmsFaqItem } from '@/lib/admin/content/types';

export interface NormalizedFaqItem {
  question: string;
  answer: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeQuestionKey(question: string): string {
  return question.trim().toLowerCase();
}

export function normalizePublishedFaqs(input: unknown): NormalizedFaqItem[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const seen = new Set<string>();
  const items: NormalizedFaqItem[] = [];

  for (const row of input) {
    if (!isRecord(row)) continue;

    const question = typeof row.question === 'string' ? row.question.trim() : '';
    const answer = typeof row.answer === 'string' ? row.answer.trim() : '';

    if (!question || !answer) continue;

    const key = normalizeQuestionKey(question);
    if (seen.has(key)) continue;

    seen.add(key);
    items.push({ question, answer });
  }

  return items;
}

/** Strip invalid rows before persisting CMS FAQ drafts. */
export function sanitizeCmsFaqsForStorage(faqs: CmsFaqItem[]): CmsFaqItem[] {
  return faqs
    .map((item) => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter((item) => item.question.length > 0 || item.answer.length > 0);
}
