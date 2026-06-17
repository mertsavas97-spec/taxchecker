import Image from 'next/image';
import Link from 'next/link';

import { siteConfig } from '@/config/site-navigation';
import { cn } from '@/lib/utils';

const LOGO_ASSETS = {
  header: {
    src: '/brand/taxchecker-logo-trimmed.png',
    width: 1028,
    height: 219,
    imageClassName: 'h-7 w-auto sm:h-8',
  },
  footer: {
    src: '/brand/taxchecker-logo-footer.png',
    width: 1036,
    height: 227,
    imageClassName: 'h-7 w-auto sm:h-[34px]',
  },
} as const;

export function Logo({
  className,
  variant = 'header',
  showTagline = false,
}: {
  className?: string;
  variant?: keyof typeof LOGO_ASSETS;
  showTagline?: boolean;
}) {
  const asset = LOGO_ASSETS[variant];

  return (
    <Link
      href="/"
      className={cn(
        'group inline-flex shrink-0 flex-col gap-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 rounded-md',
        className,
      )}
    >
      <Image
        src={asset.src}
        alt="TaxChecker"
        width={asset.width}
        height={asset.height}
        priority={variant === 'header'}
        className={asset.imageClassName}
      />
      {showTagline ? (
        <span className="text-[10px] font-medium leading-tight text-muted-foreground">
          {siteConfig.tagline}
        </span>
      ) : null}
    </Link>
  );
}
