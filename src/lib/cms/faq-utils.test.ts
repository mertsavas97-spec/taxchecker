import { describe, expect, it } from 'vitest';

import {
  normalizePublishedFaqs,
  sanitizeCmsFaqsForStorage,
} from '@/lib/cms/faq-utils';

describe('normalizePublishedFaqs', () => {
  it('returns an empty array for non-array input', () => {
    expect(normalizePublishedFaqs(null)).toEqual([]);
    expect(normalizePublishedFaqs(undefined)).toEqual([]);
    expect(normalizePublishedFaqs('invalid')).toEqual([]);
  });

  it('trims and keeps valid FAQ rows', () => {
    expect(
      normalizePublishedFaqs([
        { question: ' What is SE tax? ', answer: ' A self-employment tax. ' },
      ]),
    ).toEqual([
      {
        question: 'What is SE tax?',
        answer: 'A self-employment tax.',
      },
    ]);
  });

  it('drops malformed or empty rows', () => {
    expect(
      normalizePublishedFaqs([
        { question: 'Valid?', answer: 'Yes' },
        { question: '   ', answer: 'No question' },
        { question: 'Missing answer', answer: '' },
        { answer: 'Missing question' },
        null,
        'bad-row',
      ]),
    ).toEqual([{ question: 'Valid?', answer: 'Yes' }]);
  });

  it('dedupes by normalized question', () => {
    expect(
      normalizePublishedFaqs([
        { question: 'What is SE tax?', answer: 'First' },
        { question: ' what is se tax? ', answer: 'Second' },
      ]),
    ).toEqual([{ question: 'What is SE tax?', answer: 'First' }]);
  });
});

describe('sanitizeCmsFaqsForStorage', () => {
  it('keeps partially filled rows for editing and removes fully empty rows', () => {
    expect(
      sanitizeCmsFaqsForStorage([
        { question: ' Q ', answer: '' },
        { question: '', answer: '' },
        { question: 'Done', answer: ' Answer ' },
      ]),
    ).toEqual([
      { question: 'Q', answer: '' },
      { question: 'Done', answer: 'Answer' },
    ]);
  });
});
