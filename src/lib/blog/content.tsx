import Link from 'next/link';
import { Fragment } from 'react';

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

function renderInlineLinks(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = LINK_PATTERN.exec(text)) !== null) {
    const [full, label, href] = match;
    const start = match.index;

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    const isInternal = href.startsWith('/');
    nodes.push(
      isInternal ? (
        <Link
          key={`${href}-${start}`}
          href={href}
          className="font-medium text-tc-link no-underline hover:underline"
        >
          {label}
        </Link>
      ) : (
        <a
          key={`${href}-${start}`}
          href={href}
          className="font-medium text-tc-link no-underline hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
        </a>
      ),
    );

    lastIndex = start + full.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

export function renderBlogContentParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function BlogContentParagraph({ text }: { text: string }) {
  return <p>{renderInlineLinks(text).map((node, index) => <Fragment key={index}>{node}</Fragment>)}</p>;
}
