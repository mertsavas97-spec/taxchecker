import Link from 'next/link';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

function isSafeHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return false;
  return !/^(javascript|data|vbscript):/i.test(trimmed);
}

function MarkdownLink({
  href,
  children,
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  if (!href || !isSafeHref(href)) {
    return <span>{children}</span>;
  }

  if (href.startsWith('/')) {
    return (
      <Link
        href={href}
        className="font-medium text-tc-link no-underline hover:underline"
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className="font-medium text-tc-link no-underline hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

const markdownComponents: Components = {
  h1: ({ children }) => <h2 className="tc-heading-subsection">{children}</h2>,
  h2: ({ children }) => <h2 className="tc-heading-subsection">{children}</h2>,
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-foreground sm:text-lg">{children}</h3>
  ),
  p: ({ children }) => <p>{children}</p>,
  ul: ({ children }) => <ul className="list-disc space-y-1.5 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal space-y-1.5 pl-5">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  a: ({ href, children }) => <MarkdownLink href={href}>{children}</MarkdownLink>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="my-6 border-border" />,
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full min-w-[20rem] border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-b border-border">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-border/60">{children}</tr>,
  th: ({ children }) => (
    <th className="px-3 py-2 text-left align-top font-semibold text-foreground">{children}</th>
  ),
  td: ({ children }) => <td className="px-3 py-2 align-top">{children}</td>,
};

export function MarkdownContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const trimmed = content.trim();
  if (!trimmed) {
    return null;
  }

  const markdown = (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {trimmed}
    </ReactMarkdown>
  );

  if (!className) {
    return markdown;
  }

  return <div className={cn(className)}>{markdown}</div>;
}
