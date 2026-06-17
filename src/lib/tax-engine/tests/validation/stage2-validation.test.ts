import { describe, expect, it } from 'vitest';

import { calculate1099Tax } from '../../calculators/1099-tax';
import { calculateEstimatedTax } from '../../calculators/estimated-tax';
import { calculateHsaTax } from '../../calculators/hsa-tax';
import { calculateLlcVsSCorp } from '../../calculators/llc-vs-scorp';
import { calculateQuarterlyTax } from '../../calculators/quarterly-tax';
import { calculateSCorpTax } from '../../calculators/s-corp-tax';
import { calculateSelfEmployedTax } from '../../calculators/self-employed-tax';
import { calculateW2Vs1099 } from '../../calculators/w2-vs-1099';
import {
  STAGE2_1099,
  STAGE2_ESTIMATED,
  STAGE2_HSA,
  STAGE2_LLC_VS_SCORP,
  STAGE2_QUARTERLY,
  STAGE2_S_CORP,
  STAGE2_SELF_EMPLOYED,
  STAGE2_W2_VS_1099,
} from './stage2-scenarios';

describe('Stage 2 validation — Self-Employment Tax', () => {
  it.each(STAGE2_SELF_EMPLOYED)('$id: $label', (scenario) => {
    const result = calculateSelfEmployedTax(scenario.input);
    const { expected } = scenario;

    if ('selfEmploymentTaxCents' in expected) {
      expect(result.details.selfEmploymentTaxCents).toBe(
        expected.selfEmploymentTaxCents,
      );
    }
    if ('federalIncomeTaxCents' in expected) {
      expect(result.details.federalIncomeTaxCents).toBe(
        expected.federalIncomeTaxCents,
      );
    }
    if ('totalEstimatedFederalTaxCents' in expected) {
      expect(result.details.totalEstimatedFederalTaxCents).toBe(
        expected.totalEstimatedFederalTaxCents,
      );
    }
  });
});

describe('Stage 2 validation — 1099 Tax', () => {
  it.each(STAGE2_1099)('$id: $label', (scenario) => {
    const result = calculate1099Tax(scenario.input);
    const { expected } = scenario;

    if ('net1099IncomeCents' in expected) {
      expect(result.details.net1099IncomeCents).toBe(expected.net1099IncomeCents);
    }
    if ('selfEmploymentTaxCents' in expected) {
      expect(result.details.selfEmploymentTaxCents).toBe(
        expected.selfEmploymentTaxCents,
      );
    }
    if ('totalEstimatedFederalTaxCents' in expected) {
      expect(result.details.totalEstimatedFederalTaxCents).toBe(
        expected.totalEstimatedFederalTaxCents,
      );
    }
  });
});

describe('Stage 2 validation — Estimated Tax', () => {
  it.each(STAGE2_ESTIMATED)('$id: $label', (scenario) => {
    const result = calculateEstimatedTax(scenario.input);
    const { expected } = scenario;

    if ('estimatedAnnualFederalTaxCents' in expected) {
      expect(result.details.estimatedAnnualFederalTaxCents).toBe(
        expected.estimatedAnnualFederalTaxCents,
      );
    }
    if ('safeHarborTargetCents' in expected) {
      expect(result.details.safeHarborTargetCents).toBe(
        expected.safeHarborTargetCents,
      );
    }
    if ('remainingTaxCents' in expected) {
      expect(result.details.remainingTaxCents).toBe(expected.remainingTaxCents);
    }
  });

  it('EST-5: mixed income warns that W-2 FICA is excluded from annual liability', () => {
    const result = calculateEstimatedTax(STAGE2_ESTIMATED[4].input);

    expect(result.warnings.some((w) => w.code === 'WITHHOLDING_SIMPLIFIED')).toBe(
      true,
    );
  });
});

describe('Stage 2 validation — Quarterly Tax', () => {
  it.each(STAGE2_QUARTERLY)('$id: $label', (scenario) => {
    const result = calculateQuarterlyTax(scenario.input);
    const { expected } = scenario;

    if ('totalEstimatedFederalTaxCents' in expected) {
      expect(result.details.totalEstimatedFederalTaxCents).toBe(
        expected.totalEstimatedFederalTaxCents,
      );
    }
    if ('recommendedQuarterlyPaymentCents' in expected) {
      expect(result.details.recommendedQuarterlyPaymentCents).toBe(
        expected.recommendedQuarterlyPaymentCents,
      );
    }
    if ('safeHarborTargetCents' in expected) {
      expect(result.details.safeHarborTargetCents).toBe(
        expected.safeHarborTargetCents,
      );
    }
    if ('remainingEstimatedTaxCents' in expected) {
      expect(result.details.remainingEstimatedTaxCents).toBe(
        expected.remainingEstimatedTaxCents,
      );
    }
    if ('monthlyTaxReserveCents' in expected) {
      expect(result.details.monthlyTaxReserveCents).toBe(
        expected.monthlyTaxReserveCents,
      );
    }
    if ('q1DueDate' in expected) {
      expect(result.details.quarterlyDueDates[0]).toBe(expected.q1DueDate);
    }
  });
});

describe('Stage 2 validation — LLC vs S Corp', () => {
  it.each(STAGE2_LLC_VS_SCORP.filter((s) => 'input' in s))(
    '$id: $label',
    (scenario) => {
      if (!('input' in scenario)) return;

      const result = calculateLlcVsSCorp(scenario.input);
      const { expected } = scenario;

      if ('llcFederalTaxBurdenCents' in expected) {
        expect(result.details.llcFederalTaxBurdenCents).toBe(
          expected.llcFederalTaxBurdenCents,
        );
      }
      if ('sCorpFederalTaxBurdenCents' in expected) {
        expect(result.details.sCorpFederalTaxBurdenCents).toBe(
          expected.sCorpFederalTaxBurdenCents,
        );
      }
      if ('taxBurdenDifferenceCents' in expected) {
        expect(result.details.taxBurdenDifferenceCents).toBe(
          expected.taxBurdenDifferenceCents,
        );
      }
      if ('sCorpDistributionCents' in expected) {
        expect(result.details.sCorpDistributionCents).toBe(
          expected.sCorpDistributionCents,
        );
      }
    },
  );

  it('LLC-3: compliance costs reduce S Corp net value', () => {
    const scenario = STAGE2_LLC_VS_SCORP[2];
    if (!('baseInput' in scenario)) {
      throw new Error('LLC-3 scenario missing baseInput');
    }

    const withoutCosts = calculateLlcVsSCorp(scenario.baseInput);
    const withCosts = calculateLlcVsSCorp({
      ...scenario.baseInput,
      ...scenario.complianceInput,
    });

    expect(
      withoutCosts.details.sCorpAfterTaxValueCents -
        withCosts.details.sCorpAfterTaxValueCents,
    ).toBe(scenario.expected.netValueReductionCents);
  });
});

describe('Stage 2 validation — S Corp Tax', () => {
  it.each(STAGE2_S_CORP)('$id: $label', (scenario) => {
    const result = calculateSCorpTax(scenario.input);
    const { expected } = scenario;

    if ('totalFederalTaxBurdenCents' in expected) {
      expect(result.details.totalFederalTaxBurdenCents).toBe(
        expected.totalFederalTaxBurdenCents,
      );
    }
    if ('employeeFicaCents' in expected) {
      expect(result.details.employeeFicaCents).toBe(expected.employeeFicaCents);
    }
    if ('soleProprietorTaxBurdenCents' in expected) {
      expect(result.details.soleProprietorTaxBurdenCents).toBe(
        expected.soleProprietorTaxBurdenCents,
      );
    }
    if ('employerFicaCents' in expected) {
      expect(result.details.employerFicaCents).toBe(expected.employerFicaCents);
    }
    if ('federalIncomeTaxCents' in expected) {
      expect(result.details.federalIncomeTaxCents).toBe(
        expected.federalIncomeTaxCents,
      );
    }
  });
});

describe('Stage 2 validation — HSA Tax Savings', () => {
  it.each(STAGE2_HSA)('$id: $label', (scenario) => {
    const result = calculateHsaTax(scenario.input);
    const { expected } = scenario;

    if ('contributionLimitCents' in expected) {
      expect(result.details.contributionLimitCents).toBe(
        expected.contributionLimitCents,
      );
    }
    if ('federalIncomeTaxSavingsCents' in expected) {
      expect(result.details.federalIncomeTaxSavingsCents).toBe(
        expected.federalIncomeTaxSavingsCents,
      );
    }
    if ('payrollTaxSavingsCents' in expected) {
      expect(result.details.payrollTaxSavingsCents).toBe(
        expected.payrollTaxSavingsCents,
      );
    }
  });
});

describe('Stage 2 validation — W-2 vs 1099', () => {
  it.each(STAGE2_W2_VS_1099)('$id: $label', (scenario) => {
    const result = calculateW2Vs1099(scenario.input);
    const { expected } = scenario;

    if ('employeeFicaCents' in expected) {
      expect(result.details.employeeFicaCents).toBe(expected.employeeFicaCents);
    }
    if ('contractorTotalTaxCents' in expected) {
      expect(
        result.details.selfEmploymentTaxCents +
          result.details.contractorFederalIncomeTaxCents,
      ).toBe(expected.contractorTotalTaxCents);
    }
    if ('w2AfterTaxIncomeCents' in expected) {
      expect(result.details.w2AfterTaxIncomeCents).toBe(
        expected.w2AfterTaxIncomeCents,
      );
    }
    if ('w2TotalEstimatedValueCents' in expected) {
      expect(result.details.w2TotalEstimatedValueCents).toBe(
        expected.w2TotalEstimatedValueCents,
      );
    }
  });
});

describe('Stage 2 validation — scenario coverage', () => {
  it('includes 40 validation scenarios across 8 calculators', () => {
    const scenarioCount =
      STAGE2_SELF_EMPLOYED.length +
      STAGE2_1099.length +
      STAGE2_ESTIMATED.length +
      STAGE2_QUARTERLY.length +
      STAGE2_LLC_VS_SCORP.length +
      STAGE2_S_CORP.length +
      STAGE2_HSA.length +
      STAGE2_W2_VS_1099.length;

    expect(scenarioCount).toBe(40);
  });
});
