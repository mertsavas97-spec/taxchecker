import type { ResultCard } from '@/lib/tax-engine';
import { formatCurrency, percentFromRatio } from '@/lib/tax-engine';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

const variantStyles: Record<
  ResultCard['variant'],
  { card: string; value: string }
> = {
  default: {
    card: 'bg-card',
    value: 'text-foreground',
  },
  highlight: {
    card: 'border-tc-info/20 bg-tc-info-muted/40',
    value: 'text-tc-info',
  },
  savings: {
    card: 'border-tc-savings/20 bg-tc-savings-muted/50',
    value: 'text-tc-savings',
  },
  liability: {
    card: 'border-tc-liability/20 bg-tc-liability-muted/50',
    value: 'text-tc-liability',
  },
  informational: {
    card: 'bg-muted/40',
    value: 'text-muted-foreground',
  },
};

function formatResultValue(card: ResultCard): string {
  if (card.format === 'text') {
    return String(card.value);
  }
  if (card.format === 'percent') {
    return percentFromRatio(Number(card.value));
  }
  return formatCurrency(Number(card.value));
}

function ResultCardItem({ card }: { card: ResultCard }) {
  const styles = variantStyles[card.variant];

  return (
    <Card
      size="sm"
      className={cn('shadow-tc-xs', styles.card)}
      title={card.tooltip}
    >
      <CardHeader className="pb-2">
        <CardDescription className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {card.label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className={cn('tc-tabular text-2xl font-semibold', styles.value)}>
          {formatResultValue(card)}
        </p>
      </CardContent>
    </Card>
  );
}

export function ResultPanel({
  title = 'Results',
  description = 'Estimated values based on your inputs.',
  cards,
  className,
  columns = 2,
}: {
  title?: string;
  description?: string;
  cards: ResultCard[];
  className?: string;
  columns?: 1 | 2 | 3;
}) {
  const columnClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 3
        ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2';

  return (
    <Card className={cn('shadow-tc-sm', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={cn('grid gap-3', columnClass)}>
          {cards.map((card) => (
            <ResultCardItem key={card.id} card={card} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
