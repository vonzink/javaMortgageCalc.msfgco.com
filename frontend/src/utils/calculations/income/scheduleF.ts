/**
 * Schedule F Farm Income Calculator
 *
 * Formula:
 *   Annual = Net Profit + Coop/CCC Payments + Other Income + Depreciation
 *            + Amortization + Business Use of Home - Meals & Entertainment
 *
 * Year 1 and Year 2, standard Fannie Mae averaging policy.
 */

import { policyCalc, type PolicyResult } from './policyCalc';

export interface ScheduleFYear {
  netProfit: number;
  coopPayments: number;
  otherIncome: number;
  depreciation: number;
  amortization: number;
  businessUseOfHome: number;
  mealsEntertainment: number;
}

export interface ScheduleFParams {
  year1: ScheduleFYear;
  year2: ScheduleFYear;
}

export interface ScheduleFResult {
  year1Total: number;
  year2Total: number;
  monthly: number;
  policy: PolicyResult;
}

function computeYear(yr: ScheduleFYear): number {
  return (
    yr.netProfit +
    yr.coopPayments +
    yr.otherIncome +
    yr.depreciation +
    yr.amortization +
    yr.businessUseOfHome -
    yr.mealsEntertainment
  );
}

function hasYear2Data(yr: ScheduleFYear): boolean {
  return [
    yr.netProfit, yr.coopPayments, yr.otherIncome, yr.depreciation,
    yr.amortization, yr.businessUseOfHome, yr.mealsEntertainment,
  ].some((v) => v !== 0);
}

export function calculateScheduleF(params: ScheduleFParams): ScheduleFResult {
  const year1Total = computeYear(params.year1);
  const year2Total = computeYear(params.year2);

  const hasYr2 = hasYear2Data(params.year2);
  const policy = policyCalc(year1Total, year2Total, hasYr2);

  return {
    year1Total,
    year2Total,
    monthly: policy.monthly,
    policy,
  };
}
