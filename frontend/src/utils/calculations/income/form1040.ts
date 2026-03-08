/**
 * Form 1040 Page 1 Income Calculator
 *
 * Sections:
 *   - W-2 wages (up to 4 employers)
 *   - Alimony received
 *   - Pension/annuity (up to 3 sources, IRA + pensions each)
 *   - Unemployment
 *   - Social Security
 *
 * Each section uses the standard Fannie Mae averaging policy.
 */

import { policyCalc, type PolicyResult } from './policyCalc';

export interface Form1040Params {
  // W-2 wages per employer (up to 4)
  w2Year1: number[];   // e.g. [emp1_y1, emp2_y1, emp3_y1, emp4_y1]
  w2Year2: number[];
  // Alimony
  alimonyYear1: number;
  alimonyYear2: number;
  // Pension/annuity: each source has IRA (line 15) + pensions (line 16)
  pensionIRAYear1: number[];   // [src1_15_y1, src2_15_y1, src3_15_y1]
  pensionIRAYear2: number[];
  pensionAnnYear1: number[];   // [src1_16_y1, src2_16_y1, src3_16_y1]
  pensionAnnYear2: number[];
  // Unemployment
  unemploymentYear1: number;
  unemploymentYear2: number;
  // Social Security
  socialSecurityYear1: number;
  socialSecurityYear2: number;
}

export interface Form1040SectionResult {
  year1: number;
  year2: number;
  policy: PolicyResult;
}

export interface Form1040Result {
  w2: Form1040SectionResult;
  alimony: Form1040SectionResult;
  pension: Form1040SectionResult;
  unemployment: Form1040SectionResult;
  socialSecurity: Form1040SectionResult;
  combinedMonthly: number;
}

function sumArray(arr: number[]): number {
  return arr.reduce((s, v) => s + (v || 0), 0);
}

export function calculateForm1040(params: Form1040Params): Form1040Result {
  // W-2
  const w2Y1 = sumArray(params.w2Year1);
  const w2Y2 = sumArray(params.w2Year2);
  const w2Policy = policyCalc(w2Y1, w2Y2);

  // Alimony
  const alY1 = params.alimonyYear1;
  const alY2 = params.alimonyYear2;
  const alPolicy = policyCalc(alY1, alY2);

  // Pension/annuity
  const penY1 = sumArray(params.pensionIRAYear1) + sumArray(params.pensionAnnYear1);
  const penY2 = sumArray(params.pensionIRAYear2) + sumArray(params.pensionAnnYear2);
  const penPolicy = policyCalc(penY1, penY2);

  // Unemployment
  const unY1 = params.unemploymentYear1;
  const unY2 = params.unemploymentYear2;
  const unPolicy = policyCalc(unY1, unY2);

  // Social Security
  const ssY1 = params.socialSecurityYear1;
  const ssY2 = params.socialSecurityYear2;
  const ssPolicy = policyCalc(ssY1, ssY2);

  const combinedMonthly =
    w2Policy.monthly +
    alPolicy.monthly +
    penPolicy.monthly +
    unPolicy.monthly +
    ssPolicy.monthly;

  return {
    w2: { year1: w2Y1, year2: w2Y2, policy: w2Policy },
    alimony: { year1: alY1, year2: alY2, policy: alPolicy },
    pension: { year1: penY1, year2: penY2, policy: penPolicy },
    unemployment: { year1: unY1, year2: unY2, policy: unPolicy },
    socialSecurity: { year1: ssY1, year2: ssY2, policy: ssPolicy },
    combinedMonthly,
  };
}
