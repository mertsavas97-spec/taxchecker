import { describe, expect, it } from 'vitest';

import {
  mapCmsBlogPostToDb,
  mapDbBlogPostToCms,
  type DbCmsBlogPost,
} from '@/lib/admin/content/storage/mappers';
import { seedCmsBlogPosts } from '@/lib/admin/content/seed';
import type { CmsBlogPost } from '@/lib/admin/content/types';

describe('blog mapper round trip', () => {
  it('preserves CMS FAQ fields through db mapping', () => {
    const seed = seedCmsBlogPosts()[0]!;
    const withFaqs: CmsBlogPost = {
      ...seed,
      faqs: [
        { question: 'What is quarterly tax?', answer: 'An IRS estimated payment schedule.' },
        { question: 'Who needs it?', answer: 'Many taxpayers with non-withheld income.' },
      ],
    };

    const dbRow = {
      ...mapCmsBlogPostToDb(withFaqs),
      id: '22222222-2222-2222-2222-222222222222',
      updated_at: '2026-06-16T12:00:00.000Z',
      faqs: withFaqs.faqs,
    } as DbCmsBlogPost;

    const restored = mapDbBlogPostToCms(dbRow);

    expect(restored.faqs).toEqual(withFaqs.faqs);
  });
});
