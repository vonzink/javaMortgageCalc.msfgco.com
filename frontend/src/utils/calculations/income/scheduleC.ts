/**
 * Schedule C Sole Proprietorship Income Calculator
 *
 * Formula per business:
 *   Annual = Net Profit + Other Income + Depletion + Depreciation
 *            + Business Use of Home + Mileage Depreciation + Amortization
 *            - Meals & Entertainment
 *
 * Supports 2 businesses, each with Year 1 and Year 2.
 * Uses standard Fannie Mae averaging policy.
 */

import { policyCalc, type PolicyResult } from './policyCalc';

export interface ScheduleCBusinessYear {
  netProfit: number;
  otherIncome: number;
  depletion: number;
  depreciation: number;
  businessUseOfHome: number;
  mileageDepreciation: number;
  amortization: number;
  mealsEntertainment: number;
}

export interface ScheduleCBusinessParams {
  year1: ScheduleCBusinessYear;
  year2: ScheduleCBusinessYear;
}

export interface ScheduleCBusinessResult {
  year1Total: number;
  year2Total: number;
  monthly: number;
  policy: PolicyResult;
}

export interface ScheduleCParams {
  business1: ScheduleCBusinessParams;
  business2: ScheduleCBusinessParams;
}

export interface ScheduleCResult {
  business1: ScheduleCBusinessResult;
  business2: ScheduleCBusinessResult;
  combinedMonthly: number;
}

function computeBusinessYear(yr: ScheduleCBusinessYear): number {
  return (
    yr.netProfit +
    yr.otherIncome +
    yr.depletion +
    yr.depreciation +
    yr.businessUseOfHome +
    yr.mileageDepreciation +
    yr.amortization -
    yr.mealsEntertainment
  );
}

function hasYear2Data(yr: ScheduleCBusinessYear): boolean {
  return [
    yr.netProfit, yr.otherIncome, yr.depletion, yr.depreciation,
    yr.mealsEntertainment, yr.businessUseOfHome, yr.mileageDepreciation, yr.amortization,
  ].some((v) => v !== 0);
}

function computeBusiness(params: ScheduleCBusinessParams): ScheduleCBusinessResult {
  const year1Total = computeBusinessYear(params.year1);
  const year2Total = computeBusinessYear(params.year2);
  const hasYr2 = hasYear2Data(params.year2);
  const policy = policyCalc(year1Total, year2Total, hasYr2);

  return { year1Total, year2Total, monthly: policy.monthly, policy };
}

export function calculateScheduleC(params: ScheduleCParams): ScheduleCResult {
  const b1 = computeBusiness(params.business1);
  const b2 = computeBusiness(params.business2);

  return {
    business1: b1,
    business2: b2,
    combinedMonthly: b1.monthly + b2.monthly,
  };
}
