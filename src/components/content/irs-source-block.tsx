import Link from 'next/link';
import { ExternalLinkIcon } from 'lucide-react';

import { InfoCallout } from '@/components/calculator/info-callout';
import { SourceSection, type SourceReferenceItem } from '@/components/calculator/source-section';
import {
  IRS_SOURCES_DESCRIPTION,
  IRS_SOURCES_TITLE,
} from '@/config/related-content';
import { cn } from '@/lib/utils';

export function IrsSourceBlock({
  title = IRS_SOURCES_TITLE,
  description = IRS_SOURCES_DESCRIPTION,
  sources,
  notice,
  className,
}: {
  title?: string;
  description?: string;
  sources: SourceReferenceItem[];
  notice?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      <SourceSection
        title={title}
        description={description}
        sources={sources}
      />
      {notice ? (
        <InfoCallout variant="neutral" title="Verification note">
          {notice.includes('methodology page') ? (
            <>
              {notice.replace(' methodology page.', '')}{' '}
              <Link href="/methodology" className="font-medium text-tc-link no-underline hover:underline">
                methodology page
              </Link>
              .
            </>
          ) : (
            notice
          )}
        </InfoCallout>
      ) : null}
      <p className="tc-caption flex items-center gap-1.5">
        <ExternalLinkIcon className="size-3.5" aria-hidden />
        TaxChecker is not affiliated with the Internal Revenue Service.
      </p>
    </div>
  );
}
