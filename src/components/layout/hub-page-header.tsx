import { Breadcrumbs, type BreadcrumbItem } from '@/components/navigation/breadcrumbs';
import { cn } from '@/lib/utils';

export function HubPageHeader({
  breadcrumbs,
  eyebrow,
  title,
  description,
  className,
}: {
  breadcrumbs: BreadcrumbItem[];
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <header className={cn('max-w-3xl space-y-2', className)}>
      <Breadcrumbs items={breadcrumbs} />
      <div className="space-y-1.5">
        <p className="tc-overline">{eyebrow}</p>
        <h1 className="tc-heading-page text-foreground">{title}</h1>
        <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </header>
  );
}
