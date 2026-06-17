'use client';

import Link from 'next/link';
import { ChevronDownIcon } from 'lucide-react';

import { calculatorNavGroups, calculatorsHubLink } from '@/config/site-navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function CalculatorsDropdown({ className }: { className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('gap-1 font-medium text-foreground', className)}
        >
          Calculators
          <ChevronDownIcon className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80 border-border p-2 shadow-tc-md">
        <Link
          href={calculatorsHubLink.href}
          className="mb-2 flex flex-col gap-0.5 rounded-lg border border-tc-brand/15 bg-tc-brand/5 px-3 py-2.5 text-sm no-underline transition-colors hover:bg-tc-brand/10"
        >
          <span className="font-semibold text-foreground">
            {calculatorsHubLink.label}
          </span>
          {calculatorsHubLink.description ? (
            <span className="text-xs leading-snug text-muted-foreground">
              {calculatorsHubLink.description}
            </span>
          ) : null}
        </Link>
        {calculatorNavGroups.map((group, index) => (
          <DropdownMenuGroup key={group.label}>
            {index > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuLabel className="tc-overline px-2">
              {group.label}
            </DropdownMenuLabel>
            {group.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col gap-0.5 rounded-md px-2 py-2 text-sm no-underline outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
              >
                <span className="font-medium text-foreground">{link.label}</span>
                {link.description ? (
                  <span className="text-xs leading-snug text-muted-foreground">
                    {link.description}
                  </span>
                ) : null}
              </Link>
            ))}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
