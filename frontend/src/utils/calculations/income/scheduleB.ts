/**
 * Schedule B Interest & Dividend Income Calculator
 *
 * Formula per institution:
 *   Annual = Interest + Tax-Exempt Interest + Dividends
 *
 * Supports up to 3 institutions.
 * Totals across all institutions, then applies Fannie Mae averaging.
 */

import { policyCalc, type PolicyResult } from './policyCalc';

export interface ScheduleBInstitution {
  interestYear1: number;
  interestYear2: number;
  taxExemptInterestYear1: number;
  taxExemptInterestYear2: number;
  dividendsYear1: number;
  dividendsYear2: number;
}

export interface ScheduleBParams {
  institutions: ScheduleBInstitution[]; // up to 3
}

export interface ScheduleBInstitutionResult {
  year1Total: number;
  year2Total: number;
}

export interface ScheduleBResult {
  institutions: ScheduleBInstitutionResult[];
  totalYear1: number;
  totalYear2: number;
  monthly: number;
  policy: PolicyResult;
}

export function calculateScheduleB(params: ScheduleBParams): ScheduleBResult {
  let totalY1 = 0;
  let totalY2 = 0;

  const institutions = params.institutions.map((inst) => {
    const y1 = inst.interestYear1 + inst.taxExemptInterestYear1 + inst.dividendsYear1;
    const y2 = inst.interestYear2 + inst.taxExemptInterestYear2 + inst.dividendsYear2;
    totalY1 += y1;
    totalY2 += y2;
    return { year1Total: y1, year2Total: y2 };
  });

  const policy = policyCalc(totalY1, totalY2);

  return {
    institutions,
    totalYear1: totalY1,
    totalYear2: totalY2,
    monthly: policy.monthly,
    policy,
  };
}
