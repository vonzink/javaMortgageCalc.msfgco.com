/**
 * Schedule D Capital Gains/Losses Income Calculator
 *
 * Formula:
 *   Total = Short-Term Gain/Loss + Long-Term Gain/Loss
 *
 * Year 1 and Year 2, standard Fannie Mae averaging policy.
 */

import { policyCalc, type PolicyResult } from './policyCalc';

export interface ScheduleDParams {
  shortTermYear1: number;
  shortTermYear2: number;
  longTermYear1: number;
  longTermYear2: number;
}

export interface ScheduleDResult {
  totalYear1: number;
  totalYear2: number;
  monthly: number;
  policy: PolicyResult;
}

export function calculateScheduleD(params: ScheduleDParams): ScheduleDResult {
  const totalY1 = params.shortTermYear1 + params.longTermYear1;
  const totalY2 = params.shortTermYear2 + params.longTermYear2;

  const hasYr2 = params.shortTermYear2 !== 0 || params.longTermYear2 !== 0;
  const policy = policyCalc(totalY1, totalY2, hasYr2);

  return {
    totalYear1: totalY1,
    totalYear2: totalY2,
    monthly: policy.monthly,
    policy,
  };
}
