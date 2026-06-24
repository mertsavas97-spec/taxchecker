import type { LucideIcon } from 'lucide-react';
import {
  BarChart3Icon,
  BookOpenIcon,
  CalculatorIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  SearchIcon,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export const adminNavItems: AdminNavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboardIcon,
    description: 'Overview and recent activity',
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3Icon,
    description: 'GA4 traffic summary',
  },
  {
    label: 'Content',
    href: '/admin/content',
    icon: FileTextIcon,
    description: 'All content types',
  },
  {
    label: 'Resources',
    href: '/admin/resources',
    icon: BookOpenIcon,
    description: 'Resource articles',
  },
  {
    label: 'Blog',
    href: '/admin/blog',
    icon: BookOpenIcon,
    description: 'Blog posts',
  },
  {
    label: 'Calculators',
    href: '/admin/calculators',
    icon: CalculatorIcon,
    description: 'Calculator metadata',
  },
  {
    label: 'SEO',
    href: '/admin/seo',
    icon: SearchIcon,
    description: 'SEO audit',
  },
];

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === '/admin') {
    return pathname === '/admin';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
