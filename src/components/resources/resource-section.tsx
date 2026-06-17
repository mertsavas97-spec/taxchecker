import { cn } from '@/lib/utils';
import { slugifyResourceHeading } from '@/lib/resources/toc';

export function ResourceSection({
  title,
  description,
  children,
  className,
  id,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const sectionId = id ?? slugifyResourceHeading(title);

  return (
    <section
      id={sectionId}
      data-toc-section
      data-toc-label={title}
      className={cn('scroll-mt-24 space-y-3', className)}
    >
      <div className="space-y-0.5">
        <h2 className="tc-heading-subsection">{title}</h2>
        {description ? <p className="tc-caption">{description}</p> : null}
      </div>
      <div className="tc-prose-muted space-y-3">
        {children}
      </div>
    </section>
  );
}

export function ResourceProse({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}

export function ResourceParagraph({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

export function ResourceList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function ResourceTocSection({
  id,
  label,
  children,
  className,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      id={id}
      data-toc-section
      data-toc-label={label}
      className={cn('scroll-mt-24', className)}
    >
      {children}
    </div>
  );
}
