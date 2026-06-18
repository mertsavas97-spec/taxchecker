import { describe, expect, it } from 'vitest';

import { mapDbFaqs } from '@/lib/admin/content/storage/mappers';

describe('mapDbFaqs', () => {
  it('returns an empty array for missing values', () => {
    expect(mapDbFaqs(undefined)).toEqual([]);
    expect(mapDbFaqs(null)).toEqual([]);
  });

  it('parses JSON string payloads', () => {
    expect(
      mapDbFaqs(
        JSON.stringify([{ question: 'Question?', answer: 'Answer.' }]),
      ),
    ).toEqual([{ question: 'Question?', answer: 'Answer.' }]);
  });
});
