/**
 * Form 1120S S-Corporation Income Calculator
 *
 * Formula per S-Corp:
 *   Annual = Net Gain/Loss + Other Income + Depreciation + Depletion + Amortization
 *            - Mortgages Payable - Meals & Entertainment
 *
 *   IF Year 2 provided AND Year 1 > Year 2:
 *     Monthly = ((Year 1 + Year 2) / 24) x Ownership %
 *   ELSE:
 *     Monthly = (Year 1 / 12) x Ownership %
 *
 * Supports 2 S-Corporations, each with Year 1 and Year 2.
 */

import { type PolicyResult } from './policyCalc';

export interface Form1120SCorpYear {
  netGainLoss: number;
  otherIncome: number;
  depreciation: number;
  depletion: number;
  amortization: number;
  mortgagesPayable: number;
  mealsEntertainment: number;
}

export interface Form1120SCorpParams {
  year1: Form1120SCorpYear;
  year2: Form1120SCorpYear;
  ownershipPercent: number; // e.g. 100 for 100%
}

export interface Form1120SCorpResult {
  year1Total: number;
  year2Total: number;
  monthly: number;
  policy: PolicyResult;
  ownershipPercent: number;
}

export interface Form1120SParams {
  corp1: Form1120SCorpParams;
  corp2: Form1120SCorpParams;
}

export interface Form1120SResult {
  corp1: Form1120SCorpResult;
  corp2: Form1120SCorpResult;
  combinedMonthly: number;
}

function computeCorpYear(yr: Form1120SCorpYear): number {
  return (
    yr.netGainLoss +
    yr.otherIncome +
    yr.depreciation +
    yr.depletion +
    yr.amortization -
    yr.mortgagesPayable -
    yr.mealsEntertainment
  );
}

function hasYear2Data(yr: Form1120SCorpYear): boolean {
  return [
    yr.netGainLoss, yr.otherIncome, yr.depreciation, yr.depletion,
    yr.amortization, yr.mortgagesPayable, yr.mealsEntertainment,
  ].some((v) => v !== 0);
}

function computeCorp(params: Form1120SCorpParams): Form1120SCorpResult {
  const own = params.ownershipPercent / 100;
  const year1Total = computeCorpYear(params.year1);
  const year2Total = computeCorpYear(params.year2);

  const hasYr2 = hasYear2Data(params.year2);

  let monthly: number;
  let method: 'average' | 'recent';

  if (hasYr2 && year1Total > year2Total) {
    monthly = ((year1Total + year2Total) / 24) * own;
    method = 'average';
  } else {
    monthly = (year1Total / 12) * own;
    method = 'recent';
  }

  return {
    year1Total,
    year2Total,
    monthly,
    policy: { monthly, method },
    ownershipPercent: params.ownershipPercent,
  };
}

export function calculateForm1120S(params: Form1120SParams): Form1120SResult {
  const c1 = computeCorp(params.corp1);
  const c2 = computeCorp(params.corp2);

  return {
    corp1: c1,
    corp2: c2,
    combinedMonthly: c1.monthly + c2.monthly,
  };
}
