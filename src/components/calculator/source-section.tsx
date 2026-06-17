import { ExternalLinkIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface SourceReferenceItem {
  title: string;
  url: string;
  taxYear?: number;
  dateAccessed?: string;
  note?: string;
}

export function SourceSection({
  title = 'Sources',
  description = 'Primary references used for this estimate.',
  sources,
  className,
}: {
  title?: string;
  description?: string;
  sources: SourceReferenceItem[];
  className?: string;
}) {
  return (
    <Card className={cn('shadow-tc-xs', className)}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {sources.map((source) => (
            <li key={source.url} className="border-b border-border/70 pb-4 last:border-0 last:pb-0">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-start gap-1.5 text-sm font-medium text-foreground hover:text-tc-link"
              >
                {source.title}
                <ExternalLinkIcon className="mt-0.5 size-3.5 opacity-60 transition-opacity group-hover:opacity-100" />
              </a>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 tc-caption">
                {source.taxYear ? <span>Tax year {source.taxYear}</span> : null}
                {source.dateAccessed ? (
                  <span>Accessed {source.dateAccessed}</span>
                ) : null}
              </div>
              {source.note ? (
                <p className="mt-2 text-sm text-muted-foreground">{source.note}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
