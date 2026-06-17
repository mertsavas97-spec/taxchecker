import { cn } from '@/lib/utils';

type ContentWidthVariant = 'page' | 'calculator' | 'prose' | 'content' | 'narrow' | 'full';

const widthClasses: Record<ContentWidthVariant, string> = {
  page: 'max-w-page',
  calculator: 'max-w-calculator',
  prose: 'max-w-prose',
  content: 'max-w-content',
  narrow: 'max-w-narrow',
  full: 'max-w-none',
};

export function PageContainer({
  className,
  children,
  as: Component = 'div',
  width = 'page',
}: {
  className?: string;
  children: React.ReactNode;
  as?: 'div' | 'main' | 'section' | 'article';
  width?: ContentWidthVariant;
}) {
  return (
    <Component
      className={cn(
        'mx-auto w-full px-gutter lg:px-gutter-lg',
        widthClasses[width],
        className,
      )}
    >
      {children}
    </Component>
  );
}

export function ContentWidth({
  className,
  children,
  as: Component = 'div',
  variant = 'prose',
}: {
  className?: string;
  children: React.ReactNode;
  as?: 'div' | 'section' | 'article';
  variant?: Exclude<ContentWidthVariant, 'page' | 'full'>;
}) {
  return (
    <Component className={cn('w-full', widthClasses[variant], className)}>
      {children}
    </Component>
  );
}

export function Section({
  className,
  children,
  spacing = 'default',
  as: Component = 'section',
  id,
}: {
  className?: string;
  children: React.ReactNode;
  spacing?: 'none' | 'xs' | 'sm' | 'default' | 'lg';
  as?: 'section' | 'div';
  id?: string;
}) {
  const spacingClass =
    spacing === 'none'
      ? ''
      : spacing === 'xs'
        ? 'py-5 md:py-7'
      : spacing === 'sm'
        ? 'py-6 md:py-9'
        : spacing === 'lg'
          ? 'py-section-lg'
          : 'py-section';

  return (
    <Component id={id} className={cn(spacingClass, className)}>
      {children}
    </Component>
  );
}
