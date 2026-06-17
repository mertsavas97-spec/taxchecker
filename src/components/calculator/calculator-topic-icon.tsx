import type { LucideIcon } from 'lucide-react';

import {
  getCalculatorIcon,
  getCalculatorIconByHref,
  getCalculatorIconByRoute,
} from '@/config/calculator-icons';
import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: {
    box: 'size-8 rounded-md',
    icon: 'size-3.5',
  },
  md: {
    box: 'size-9 rounded-lg',
    icon: 'size-4',
  },
  lg: {
    box: 'size-10 rounded-lg',
    icon: 'size-5',
  },
} as const;

export function CalculatorTopicIcon({
  slug,
  route,
  href,
  icon: IconOverride,
  size = 'md',
  className,
  iconClassName,
}: {
  slug?: string;
  route?: string;
  href?: string;
  icon?: LucideIcon;
  size?: keyof typeof sizeClasses;
  className?: string;
  iconClassName?: string;
}) {
  const Icon =
    IconOverride ??
    (slug
      ? getCalculatorIcon(slug)
      : route
        ? getCalculatorIconByRoute(route)
        : href
          ? getCalculatorIconByHref(href)
          : getCalculatorIcon('estimated-tax-calculator'));

  const sizes = sizeClasses[size];

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center border border-tc-brand/15 bg-tc-brand/5 text-tc-brand',
        sizes.box,
        className,
      )}
      aria-hidden
    >
      <Icon className={cn(sizes.icon, iconClassName)} strokeWidth={1.75} />
    </span>
  );
}
