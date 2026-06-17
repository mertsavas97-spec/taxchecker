import { calculators, getReadyCalculators } from '@/config/calculators';
import { calculatorJourneys } from '@/config/calculator-journeys';
import { getPublishedResources } from '@/config/resources';
import { getSitemapTrustPages } from '@/config/trust-pages';
import { footerNav } from '@/config/site-navigation';
import { buildCalculatorPageRelatedContent } from '@/lib/conversion/related-content';

export interface InternalLinkAuditPage {
  route: string;
  title: string;
  inboundLinks: number;
  outboundLinks: string[];
}

export interface InternalLinkAuditReport {
  pages: InternalLinkAuditPage[];
  orphanPages: InternalLinkAuditPage[];
  weaklyConnectedPages: InternalLinkAuditPage[];
  missingLinkOpportunities: string[];
}

function addEdge(graph: Map<string, Set<string>>, from: string, to: string) {
  if (from === to) return;
  const edges = graph.get(from) ?? new Set<string>();
  edges.add(to);
  graph.set(from, edges);

  const inbound = graph.get(`__inbound__${to}`) ?? new Set<string>();
  inbound.add(from);
  graph.set(`__inbound__${to}`, inbound);
}

function collectStaticRoutes(): Array<{ route: string; title: string }> {
  const routes: Array<{ route: string; title: string }> = [
    { route: '/', title: 'Home' },
    { route: '/calculators', title: 'Calculators hub' },
    { route: '/resources', title: 'Resources hub' },
    { route: '/blog', title: 'Blog hub' },
  ];

  for (const calculator of getReadyCalculators()) {
    routes.push({ route: calculator.route, title: calculator.shortTitle });
  }

  for (const resource of getPublishedResources()) {
    if (resource.route.startsWith('/resources/')) {
      routes.push({ route: resource.route, title: resource.shortTitle });
    }
  }

  for (const page of getSitemapTrustPages()) {
    routes.push({ route: page.route, title: page.shortTitle });
  }

  return routes;
}

export function runInternalLinkAudit(): InternalLinkAuditReport {
  const graph = new Map<string, Set<string>>();
  const pages = collectStaticRoutes();

  const register = (from: string, to: string) => addEdge(graph, from, to);

  register('/', '/calculators');
  register('/', '/resources');
  register('/', '/methodology');
  register('/', '/sources');

  for (const link of footerNav.calculators) register('/', link.href);
  for (const link of footerNav.resources) register('/', link.href);
  for (const link of footerNav.company) register('/', link.href);
  for (const link of footerNav.legal) register('/', link.href);

  for (const journey of calculatorJourneys) {
    const related = buildCalculatorPageRelatedContent(journey.id);
    const fromRoute =
      calculators.find((calculator) => calculator.engineId === journey.id)?.route ??
      '';

    if (!fromRoute) continue;

    for (const link of [
      ...related.calculators,
      ...related.resources,
      ...related.articles,
    ]) {
      register(fromRoute, link.href);
    }
  }

  for (const resource of getPublishedResources()) {
    for (const slug of resource.relatedCalculatorSlugs) {
      const calculator = calculators.find((item) => item.slug === slug);
      if (calculator) register(resource.route, calculator.route);
    }
    for (const slug of resource.relatedResourceSlugs) {
      const related = getPublishedResources().find((item) => item.slug === slug);
      if (related) register(resource.route, related.route);
    }
  }

  const auditPages: InternalLinkAuditPage[] = pages.map((page) => {
    const outbound = [...(graph.get(page.route) ?? [])];
    const inbound = graph.get(`__inbound__${page.route}`)?.size ?? 0;

    return {
      route: page.route,
      title: page.title,
      inboundLinks: inbound,
      outboundLinks: outbound.sort(),
    };
  });

  const orphanPages = auditPages.filter(
    (page) => page.route !== '/' && page.inboundLinks === 0,
  );
  const weaklyConnectedPages = auditPages.filter(
    (page) =>
      page.route !== '/' &&
      page.inboundLinks > 0 &&
      page.inboundLinks <= 1 &&
      page.outboundLinks.length <= 1,
  );

  const missingLinkOpportunities = [
    'Blog posts have no published inbound links until posts ship.',
    'Planned calculators (SEP IRA, Solo 401k) are not linked from ready journeys.',
    'Guides hub (/guides) is placeholder and excluded from primary navigation.',
    'Contact page receives footer links only — no calculator next-step paths.',
  ];

  return {
    pages: auditPages.sort((a, b) => a.route.localeCompare(b.route)),
    orphanPages,
    weaklyConnectedPages,
    missingLinkOpportunities,
  };
}

export function formatInternalLinkAuditReport(report: InternalLinkAuditReport): string {
  const lines = [
    '# Internal Linking Audit',
    '',
    `Pages analyzed: ${report.pages.length}`,
    `Orphan pages: ${report.orphanPages.length}`,
    `Weakly connected pages: ${report.weaklyConnectedPages.length}`,
    '',
    '## Orphan pages',
    ...(report.orphanPages.length > 0
      ? report.orphanPages.map((page) => `- ${page.route} (${page.title})`)
      : ['- None']),
    '',
    '## Weakly connected pages (≤1 inbound, ≤1 outbound)',
    ...(report.weaklyConnectedPages.length > 0
      ? report.weaklyConnectedPages.map(
          (page) =>
            `- ${page.route} — inbound ${page.inboundLinks}, outbound ${page.outboundLinks.length}`,
        )
      : ['- None']),
    '',
    '## Remaining opportunities',
    ...report.missingLinkOpportunities.map((item) => `- ${item}`),
  ];

  return lines.join('\n');
}
