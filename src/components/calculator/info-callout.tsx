import { InfoIcon, LightbulbIcon, ShieldCheckIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type InfoCalloutVariant = 'info' | 'tip' | 'neutral';

const variantConfig: Record<
  InfoCalloutVariant,
  { icon: typeof InfoIcon; container: string; iconColor: string }
> = {
  info: {
    icon: InfoIcon,
    container: 'border-tc-info/25 bg-tc-info-muted/40',
    iconColor: 'text-tc-info',
  },
  tip: {
    icon: LightbulbIcon,
    container: 'border-tc-savings/25 bg-tc-savings-muted/40',
    iconColor: 'text-tc-savings',
  },
  neutral: {
    icon: ShieldCheckIcon,
    container: 'border-border bg-muted/40',
    iconColor: 'text-muted-foreground',
  },
};

export function InfoCallout({
  title,
  children,
  variant = 'info',
  className,
}: {
  title?: string;
  children: ReactNode;
  variant?: InfoCalloutVariant;
  className?: string;
}) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border px-4 py-3 shadow-tc-xs',
        config.container,
        className,
      )}
      role="note"
    >
      <Icon className={cn('mt-0.5 size-4 shrink-0', config.iconColor)} aria-hidden />
      <div className="min-w-0 space-y-1">
        {title ? (
          <p className="text-sm font-semibold text-foreground">{title}</p>
        ) : null}
        <div className="text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}
