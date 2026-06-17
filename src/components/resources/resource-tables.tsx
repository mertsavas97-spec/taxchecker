import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { BracketTableRow, StandardDeductionRow } from '@/lib/resources/reference-data';
import { cn } from '@/lib/utils';

export function StandardDeductionTable({
  rows,
  className,
}: {
  rows: StandardDeductionRow[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-lg border border-border bg-card shadow-tc-sm',
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Filing status</TableHead>
            <TableHead className="text-right">2025 standard deduction</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.status}>
              <TableCell className="font-medium text-foreground">{row.label}</TableCell>
              <TableCell className="text-right tabular-nums">{row.amountLabel}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function BracketTable({
  title,
  rows,
  className,
}: {
  title: string;
  rows: BracketTableRow[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-lg border border-border bg-card shadow-tc-sm',
        className,
      )}
    >
      <div className="border-b border-border bg-muted/30 px-3 py-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Taxable income</TableHead>
            <TableHead className="text-right">Marginal rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`${row.taxableIncomeRange}-${row.rateLabel}`}>
              <TableCell className="tabular-nums">{row.taxableIncomeRange}</TableCell>
              <TableCell className="text-right tabular-nums font-medium text-foreground">
                {row.rateLabel}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function DueDatesTable({
  rows,
  className,
}: {
  rows: Array<{
    quarter: string;
    incomePeriod: string;
    dueDateLabel: string;
  }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-lg border border-border bg-card shadow-tc-sm',
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead>Income earned</TableHead>
            <TableHead className="text-right">2025 federal due date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.quarter}>
              <TableCell className="font-medium text-foreground">{row.quarter}</TableCell>
              <TableCell>{row.incomePeriod}</TableCell>
              <TableCell className="text-right tabular-nums">{row.dueDateLabel}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
