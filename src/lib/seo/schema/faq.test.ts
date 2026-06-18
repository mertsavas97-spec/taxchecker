import { describe, expect, it } from 'vitest';

import { buildFaqSchema } from '@/lib/seo/schema/faq';

describe('buildFaqSchema', () => {
  it('returns null for empty or invalid FAQ input', () => {
    expect(buildFaqSchema([])).toBeNull();
    expect(buildFaqSchema(null)).toBeNull();
    expect(buildFaqSchema([{ question: ' ', answer: 'Nope' }])).toBeNull();
  });

  it('builds FAQPage schema for valid FAQs', () => {
    const schema = buildFaqSchema([
      { question: 'What is SE tax?', answer: 'A federal self-employment tax.' },
      { question: 'Who pays it?', answer: 'Many self-employed taxpayers.' },
    ]);

    expect(schema).toMatchObject({
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is SE tax?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A federal self-employment tax.',
          },
        },
        {
          '@type': 'Question',
          name: 'Who pays it?',
        },
      ],
    });
  });
});
