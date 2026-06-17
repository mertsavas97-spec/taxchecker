import {
  calculateSelfEmployedTax,
  dollarsToCents,
  formatCurrency,
  type ResultCard,
} from '@/lib/tax-engine';

export const HERO_PREVIEW_INCOME_DOLLARS = 75_000;

function cardValue(cards: ResultCard[], id: string): number {
  const card = cards.find((item) => item.id === id);
  return card ? Number(card.value) : 0;
}

export function getHomeHeroPreview() {
  const result = calculateSelfEmployedTax({
    taxYear: 2025,
    filingStatus: 'single',
    netSelfEmploymentIncomeCents: dollarsToCents(HERO_PREVIEW_INCOME_DOLLARS),
    otherIncomeCents: 0,
    estimatedPaymentsMadeCents: 0,
  });

  return {
    taxYear: 2025,
    incomeLabel: formatCurrency(dollarsToCents(HERO_PREVIEW_INCOME_DOLLARS)),
    totalFederalTax: formatCurrency(
      cardValue(result.summary, 'total-federal-tax'),
    ),
    quarterlyPayment: formatCurrency(cardValue(result.summary, 'quarterly-payment')),
    monthlyReserve: formatCurrency(cardValue(result.summary, 'monthly-reserve')),
  };
}
