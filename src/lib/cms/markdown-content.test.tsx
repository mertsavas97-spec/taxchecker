import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { FaqBlock } from '@/components/content/faq-block';
import { MarkdownContent } from '@/components/content/markdown-content';
import { getPublishedBlogFaqs } from '@/lib/blog/blog-faq-public';
import type { CmsBlogPost } from '@/lib/admin/content/types';

const SAMPLE_MARKDOWN = `## Who pays self-employment tax

Plain paragraph with **bold** and *italic* text.

* First bullet item
* Second bullet item

1. First ordered item
2. Second ordered item

| Tax type | Rate |
| --- | --- |
| Social Security | 12.4% |
| Medicare | 2.9% |

[Internal link](/calculators/self-employed-tax) and [external link](https://www.irs.gov).

---

Final paragraph after a rule.`;

function renderMarkdown(content: string = SAMPLE_MARKDOWN) {
  return renderToStaticMarkup(<MarkdownContent content={content} className="tc-prose" />);
}

describe('MarkdownContent', () => {
  it('renders markdown headings instead of literal hash characters', () => {
    const html = renderMarkdown('## Section title\n\nBody copy.');

    expect(html).toContain('<h2');
    expect(html).toContain('Section title');
    expect(html).not.toContain('## Section title');
  });

  it('renders unordered lists as ul/li elements', () => {
    const html = renderMarkdown('* Alpha\n* Beta');

    expect(html).toContain('<ul');
    expect(html).toContain('<li');
    expect(html).toContain('Alpha');
    expect(html).toContain('Beta');
    expect(html).not.toMatch(/\* Alpha/);
  });

  it('renders markdown tables as table markup', () => {
    const html = renderMarkdown('| Col A | Col B |\n| --- | --- |\n| One | Two |');

    expect(html).toContain('<table');
    expect(html).toContain('<th');
    expect(html).toContain('<td');
    expect(html).toContain('Col A');
    expect(html).toContain('Two');
    expect(html).not.toContain('| --- |');
  });

  it('renders markdown links with safe hrefs', () => {
    const html = renderMarkdown('[TaxChecker](/blog) and [IRS](https://www.irs.gov)');

    expect(html).toContain('href="/blog"');
    expect(html).toContain('href="https://www.irs.gov"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain('[TaxChecker](/blog)');
  });

  it('renders plain text content as readable paragraphs', () => {
    const html = renderMarkdown('Single paragraph plain text.\n\nSecond paragraph.');

    expect(html).toContain('<p>Single paragraph plain text.</p>');
    expect(html).toContain('<p>Second paragraph.</p>');
  });

  it('does not leave raw markdown artifacts in rendered output', () => {
    const html = renderMarkdown();

    expect(html).not.toContain('## Who pays');
    expect(html).not.toContain('| --- |');
    expect(html).not.toMatch(/^\* First bullet/m);
    expect(html).not.toContain('[Internal link](/calculators/self-employed-tax)');
  });

  it('keeps FAQ rendering separate from markdown body content', () => {
    const post: CmsBlogPost = {
      type: 'blog',
      id: 'blog-faq',
      slug: 'faq-example',
      title: 'FAQ example',
      excerpt: 'Excerpt',
      content: '## Body heading\n\nBody paragraph.',
      status: 'published',
      category: 'Guides',
      tags: [],
      authorId: null,
      authorName: 'TaxChecker',
      publishedAt: '2026-06-16',
      updatedAt: '2026-06-16',
      seoTitle: 'FAQ example',
      seoDescription: 'Example description',
      canonicalUrl: null,
      ogImage: null,
      taxYear: 2025,
      readingTime: '3 min read',
      featured: false,
      relatedCalculators: [],
      relatedResources: [],
      relatedBlogPosts: [],
      revision: 1,
      faqs: [{ question: 'What is SE tax?', answer: 'Tax on self-employment income.' }],
    };

    const bodyHtml = renderMarkdown(post.content);
    const faqs = getPublishedBlogFaqs(post);
    const faqHtml = renderToStaticMarkup(
      <FaqBlock title="FAQ" items={faqs} defaultOpenIndexes={[0]} />,
    );

    expect(bodyHtml).toContain('<h2');
    expect(bodyHtml).not.toContain('What is SE tax?');
    expect(faqHtml).toContain('What is SE tax?');
    expect(faqHtml).not.toContain('## Body heading');
  });
});
