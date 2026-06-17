'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdminEmptyState } from '@/components/admin/admin-empty-state';
import { cn } from '@/lib/utils';

export interface AdminDataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

export function AdminDataTable<T extends { id: string }>({
  columns,
  rows,
  emptyTitle = 'No results',
  emptyDescription,
  className,
}: {
  columns: AdminDataTableColumn<T>[];
  rows: T[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}) {
  if (rows.length === 0) {
    return (
      <AdminEmptyState title={emptyTitle} description={emptyDescription} />
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-card shadow-tc-sm',
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
