/**
 * Form 1065 Partnership Income Calculator
 *
 * Formula per partnership:
 *   Subtotal = Ordinary + Farm Profit + Gain/Loss + Other Income
 *              + Depreciation + Depletion + Amortization
 *   Annual = (Subtotal - Mortgages Payable - Meals) x Ownership %
 *
 * Supports 2 partnerships, each with Year 1 and Year 2.
 * Uses standard Fannie Mae averaging policy.
 */

import { policyCalc, type PolicyResult } from './policyCalc';

export interface Form1065PartnershipYear {
  ordinaryIncome: number;
  netFarmProfit: number;
  netGainLoss: number;
  otherIncomeLoss: number;
  depreciation: number;
  depletion: number;
  amortization: number;
  mortgagesPayable: number;
  mealsEntertainment: number;
}

export interface Form1065PartnershipParams {
  year1: Form1065PartnershipYear;
  year2: Form1065PartnershipYear;
  ownershipPercent: number; // e.g. 50 for 50%
}

export interface Form1065PartnershipResult {
  subtotal1: number;
  subtotal2: number;
  total1: number;
  total2: number;
  monthly: number;
  policy: PolicyResult;
  ownershipPercent: number;
}

export interface Form1065Params {
  partnership1: Form1065PartnershipParams;
  partnership2: Form1065PartnershipParams;
}

export interface Form1065Result {
  partnership1: Form1065PartnershipResult;
  partnership2: Form1065PartnershipResult;
  combinedMonthly: number;
}

function computeSubtotal(yr: Form1065PartnershipYear): number {
  return (
    yr.ordinaryIncome +
    yr.netFarmProfit +
    yr.netGainLoss +
    yr.otherIncomeLoss +
    yr.depreciation +
    yr.depletion +
    yr.amortization
  );
}

function hasYear2Data(yr: Form1065PartnershipYear): boolean {
  return [
    yr.ordinaryIncome, yr.netFarmProfit, yr.netGainLoss, yr.otherIncomeLoss,
    yr.depreciation, yr.depletion, yr.amortization, yr.mortgagesPayable,
    yr.mealsEntertainment,
  ].some((v) => v !== 0);
}

function computePartnership(params: Form1065PartnershipParams): Form1065PartnershipResult {
  const own = params.ownershipPercent / 100;
  const sub1 = computeSubtotal(params.year1);
  const sub2 = computeSubtotal(params.year2);
  const total1 = (sub1 - params.year1.mortgagesPayable - params.year1.mealsEntertainment) * own;
  const total2 = (sub2 - params.year2.mortgagesPayable - params.year2.mealsEntertainment) * own;

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

export function calculateForm1065(params: Form1065Params): Form1065Result {
  const p1 = computePartnership(params.partnership1);
  const p2 = computePartnership(params.partnership2);

  return {
    partnership1: p1,
    partnership2: p2,
    combinedMonthly: p1.monthly + p2.monthly,
  };
}
