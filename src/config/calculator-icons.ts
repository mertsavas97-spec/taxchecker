import type { LucideIcon } from 'lucide-react';
import {
  BriefcaseBusiness,
  Building2,
  Calculator,
  CalendarDays,
  FileText,
  GitCompareArrows,
  HeartPulse,
  UsersRound,
} from 'lucide-react';

import { getCalculatorByRoute, getCalculatorBySlug } from '@/config/calculators';

/**
 * Per-calculator topic icons — single source of truth for calculator UI.
 * Keys match `CalculatorDefinition.slug` in the calculators registry.
 */
export const calculatorIcons = {
  'self-employed-tax-calculator': BriefcaseBusiness,
  '1099-tax-calculator': FileText,
  'quarterly-tax-calculator': CalendarDays,
  'estimated-tax-calculator': Calculator,
  's-corp-tax-calculator': Building2,
  'llc-vs-scorp-calculator': GitCompareArrows,
  'hsa-tax-savings-calculator': HeartPulse,
  'w2-vs-1099-calculator': UsersRound,
} as const satisfies Record<string, LucideIcon>;

export type CalculatorIconSlug = keyof typeof calculatorIcons;

const DEFAULT_CALCULATOR_ICON = Calculator;

export function getCalculatorIcon(slug: string): LucideIcon {
  return calculatorIcons[slug as CalculatorIconSlug] ?? DEFAULT_CALCULATOR_ICON;
}

export function getCalculatorIconByRoute(route: string): LucideIcon {
  const calculator = getCalculatorByRoute(route);
  return calculator ? getCalculatorIcon(calculator.slug) : DEFAULT_CALCULATOR_ICON;
}

export function getCalculatorIconByHref(href: string): LucideIcon {
  const normalized = href.split('?')[0]?.replace(/\/$/, '') ?? href;
  return getCalculatorIconByRoute(normalized);
}

/** Representative calculator icon for a hub category card (first calculator in group). */
export function getCalculatorIconForHubCategory(leadSlug: string): LucideIcon {
  return getCalculatorIcon(leadSlug);
}

export function isRegisteredCalculatorIconSlug(
  slug: string,
): slug is CalculatorIconSlug {
  return slug in calculatorIcons;
}
