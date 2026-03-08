/**
 * Shared Fannie Mae income averaging policy.
 *
 * Standard underwriting guidelines:
 *   IF Year 2 is provided AND Year 1 > Year 2:
 *     Monthly = (Year 1 + Year 2) / 24
 *   ELSE:
 *     Monthly = Year 1 / 12
 */

export type AveragingMethod = 'average' | 'recent';

export interface PolicyResult {
  monthly: number;
  method: AveragingMethod;
}

/**
 * Apply Fannie Mae income averaging policy.
 * @param year1 Most recent year annual total
 * @param year2 Prior year annual total (0 if not provided)
 * @param hasYear2 Whether year 2 data was actually entered (defaults to year2 !== 0)
 */
export function policyCalc(year1: number, year2: number, hasYear2?: boolean): PolicyResult {
  const hasYr2 = hasYear2 !== undefined ? hasYear2 : year2 !== 0;

  if (hasYr2 && year1 > year2) {
    return {
      monthly: (year1 + year2) / 24,
      method: 'average',
    };
  }

  return {
    monthly: year1 / 12,
    method: 'recent',
  };
}
