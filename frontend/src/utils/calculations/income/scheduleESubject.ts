/**
 * Schedule E Subject Property Calculator
 *
 * Same formula as Schedule E Non-Subject, but WITHOUT the monthly payment subtraction.
 *
 * Formula:
 *   Annual = Rents + Royalties + Amort/Casualty + Depreciation + Insurance
 *            + Mortgage Interest + Taxes - Total Expenses
 *
 * Standard Fannie Mae averaging policy, no payment subtraction.
 */

import { policyCalc, type PolicyResult } from './policyCalc';

export interface ScheduleESubjectYear {
  rentsReceived: number;
  royaltiesReceived: number;
  amortCasualty: number;
  totalExpenses: number;
  depreciation: number;
  insurance: number;
  mortgageInterest: number;
  taxes: number;
}

export interface ScheduleESubjectParams {
  year1: ScheduleESubjectYear;
  year2: ScheduleESubjectYear;
}

export interface ScheduleESubjectResult {
  totalYear1: number;
  totalYear2: number;
  monthly: number;
  policy: PolicyResult;
}

function computeYear(yr: ScheduleESubjectYear): number {
  return (
    yr.rentsReceived +
    yr.royaltiesReceived +
    yr.amortCasualty +
    yr.depreciation +
    yr.insurance +
    yr.mortgageInterest +
    yr.taxes
  ) - yr.totalExpenses;
}

function hasYear2Data(yr: ScheduleESubjectYear): boolean {
  return [
    yr.rentsReceived, yr.royaltiesReceived, yr.amortCasualty, yr.totalExpenses,
    yr.depreciation, yr.insurance, yr.mortgageInterest, yr.taxes,
  ].some((v) => v !== 0);
}

export function calculateScheduleESubject(params: ScheduleESubjectParams): ScheduleESubjectResult {
  const totalY1 = computeYear(params.year1);
  const totalY2 = computeYear(params.year2);

  const hasYr2 = hasYear2Data(params.year2);
  const policy = policyCalc(totalY1, totalY2, hasYr2);

  return {
    totalYear1: totalY1,
    totalYear2: totalY2,
    monthly: policy.monthly,
    policy,
  };
}
