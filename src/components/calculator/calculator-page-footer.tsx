import type { CalculatorDefinition } from '@/config/calculators';
import { formatCalculatorMetadataLine } from '@/lib/calculators/metadata-labels';

export function CalculatorPageFooter({
  calculator,
}: {
  calculator: Pick<CalculatorDefinition, 'lastReviewed' | 'taxYear'>;
}) {
  return (
    <p className="tc-caption">{formatCalculatorMetadataLine(calculator)}</p>
  );
}
