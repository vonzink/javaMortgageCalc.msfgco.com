/**
 * Form 1120 C-Corporation Income Calculator
 *
 * Formula:
 *   Subtotal = Capital Gain + Net Gain/Loss + Other Income + Depreciation
 *              + Depletion + Domestic Production + Amortization + NOL + Taxable Income
 *   Annual = (Subtotal - Total Tax - Mortgages - Meals) x Ownership % - Dividends Paid
 *
 * Single entity with Year 1 and Year 2.
 * Uses standard Fannie Mae averaging policy.
 */

import { policyCalc, type PolicyResult } from './policyCalc';

export interface Form1120Year {
  capitalGain: number;
  netGainLoss: number;
  otherIncome: number;
  depreciation: number;
  depletion: number;
  domesticProduction: number;
  amortization: number;
  nolDeduction: number;
  taxableIncome: number;
  totalTax: number;
  mortgagesPayable: number;
  mealsEntertainment: number;
  dividendsPaid: number;
}

export interface Form1120Params {
  year1: Form1120Year;
  year2: Form1120Year;
  ownershipPercent: number; // e.g. 100 for 100%
}

export interface Form1120Result {
  subtotal1: number;
  subtotal2: number;
  total1: number;
  total2: number;
  monthly: number;
  policy: PolicyResult;
  ownershipPercent: number;
}

function computeSubtotal(yr: Form1120Year): number {
  return (
    yr.capitalGain +
    yr.netGainLoss +
    yr.otherIncome +
    yr.depreciation +
    yr.depletion +
    yr.domesticProduction +
    yr.amortization +
    yr.nolDeduction +
    yr.taxableIncome
  );
}

function hasYear2Data(yr: Form1120Year): boolean {
  return [
    yr.capitalGain, yr.netGainLoss, yr.otherIncome, yr.depreciation,
    yr.depletion, yr.domesticProduction, yr.amortization, yr.nolDeduction,
    yr.taxableIncome, yr.totalTax, yr.mortgagesPayable, yr.mealsEntertainment,
    yr.dividendsPaid,
  ].some((v) => v !== 0);
}

export function calculateForm1120(params: Form1120Params): Form1120Result {
  const own = params.ownershipPercent / 100;
  const sub1 = computeSubtotal(params.year1);
  const sub2 = computeSubtotal(params.year2);

  const total1 =
    (sub1 - params.year1.totalTax - params.year1.mortgagesPayable - params.year1.mealsEntertainment) * own -
    params.year1.dividendsPaid;
  const total2 =
    (sub2 - params.year2.totalTax - params.year2.mortgagesPayable - params.year2.mealsEntertainment) * own -
    params.year2.dividendsPaid;

  const hasYr2 = hasYear2Data(params.year2);
  const policy = policyCalc(total1, total2, hasYr2);

  return {
    subtotal1: sub1,
    subtotal2: sub2,
    total1,
    total2,
    monthly: policy.monthly,
    policy,
    ownershipPercent: params.ownershipPercent,
  };
}
