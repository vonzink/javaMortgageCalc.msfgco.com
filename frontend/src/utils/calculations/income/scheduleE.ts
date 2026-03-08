/**
 * Schedule E Non-Subject Property Income Calculator
 *
 * Formula:
 *   Annual = (Rents + Royalties + Amortization + Depreciation + Insurance
 *             + Mortgage Interest + Taxes) - Total Expenses
 *
 *   Standard Fannie Mae averaging to get monthly average,
 *   then SUBTRACT the monthly payment (from credit report).
 *
 *   Final = Monthly Average - Monthly Payment
 *
 *   Positive = add to qualifying income
 *   Negative = count as monthly expense (liability)
 */

import { policyCalc, type PolicyResult } from './policyCalc';

export interface ScheduleEPropertyYear {
  rentsReceived: number;
  royaltiesReceived: number;
  amortization: number;
  totalExpenses: number;
  depreciation: number;
  insurance: number;
  mortgageInterest: number;
  taxes: number;
}

export interface ScheduleEParams {
  year1: ScheduleEPropertyYear;
  year2: ScheduleEPropertyYear;
  monthlyPayment: number; // from credit report
}

export interface ScheduleEResult {
  totalYear1: number;
  totalYear2: number;
  monthlyAverage: number;
  monthlyPayment: number;
  finalResult: number;
  policy: PolicyResult;
}

function computeYear(yr: ScheduleEPropertyYear): number {
  return (
    yr.rentsReceived +
    yr.royaltiesReceived +
    yr.amortization +
    yr.depreciation +
    yr.insurance +
    yr.mortgageInterest +
    yr.taxes
  ) - yr.totalExpenses;
}

function hasYear2Data(yr: ScheduleEPropertyYear): boolean {
  return [
    yr.rentsReceived, yr.royaltiesReceived, yr.amortization, yr.totalExpenses,
    yr.depreciation, yr.insurance, yr.mortgageInterest, yr.taxes,
  ].some((v) => v !== 0);
}

export function calculateScheduleE(params: ScheduleEParams): ScheduleEResult {
  const totalY1 = computeYear(params.year1);
  const totalY2 = computeYear(params.year2);

  const hasYr2 = hasYear2Data(params.year2);
  const policy = policyCalc(totalY1, totalY2, hasYr2);

  const finalResult = policy.monthly - params.monthlyPayment;

  return {
    totalYear1: totalY1,
    totalYear2: totalY2,
    monthlyAverage: policy.monthly,
    monthlyPayment: params.monthlyPayment,
    finalResult,
    policy,
  };
}
