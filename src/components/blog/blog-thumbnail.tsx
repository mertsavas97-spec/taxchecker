'use client';

import { useState } from 'react';

import { DEFAULT_BLOG_THUMBNAIL } from '@/lib/blog/thumbnails';
import { cn } from '@/lib/utils';

export type BlogThumbnailVariant = 'card' | 'hero' | 'featured' | 'related';

const VARIANT_CONTAINER: Record<BlogThumbnailVariant, string> = {
  card: 'relative aspect-[1200/630] w-full overflow-hidden bg-slate-100',
  hero: 'relative mt-8 aspect-[1200/630] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100',
  featured: 'relative aspect-[1200/630] w-full overflow-hidden bg-slate-100',
  related: 'relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-slate-100',
};

function normalizeImageSrc(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return DEFAULT_BLOG_THUMBNAIL.path;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('public/')) return `/${trimmed.slice('public/'.length)}`;
  if (trimmed.startsWith('/public/')) return trimmed.replace('/public/', '/');
  if (trimmed.startsWith('/')) return trimmed;
  return `/images/blog/${trimmed}`;
}

export function BlogThumbnail({
  src,
  alt,
  priority = false,
  variant = 'card',
  className,
  imageClassName,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  variant?: BlogThumbnailVariant;
  className?: string;
  imageClassName?: string;
}) {
  const normalizedSrc = normalizeImageSrc(src);
  const [imageSrc, setImageSrc] = useState(normalizedSrc);

  return (
    <div className={cn(VARIANT_CONTAINER[variant], className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={alt}
        width={variant === 'related' ? 96 : 1200}
        height={variant === 'related' ? 64 : 630}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn('h-full w-full object-cover', imageClassName)}
        onError={() => {
          if (imageSrc !== DEFAULT_BLOG_THUMBNAIL.path) {
            setImageSrc(DEFAULT_BLOG_THUMBNAIL.path);
          }
        }}
      />
    </div>
  );
}
