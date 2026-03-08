/**
 * Variable Income Calculator
 *
 * Multi-employer variable income analysis following Fannie Mae B3-3.1 guidelines.
 *
 * Pay periods: WEEKLY (52), BIWEEKLY (26), SEMIMONTHLY (24), MONTHLY (12)
 *
 * Trend evaluation:
 *   - STABLE_OR_UP: Current year >= prior year
 *   - DECLINED_THEN_STABLE: Decline happened but has stabilized
 *   - DECLINING: Continued downward trend
 *
 * YTD sanity check ensures current pace is consistent with prior years.
 */

export type PayFrequency = 'WEEKLY' | 'BIWEEKLY' | 'SEMIMONTHLY' | 'MONTHLY';

export type IncomeTrend = 'STABLE_OR_UP' | 'DECLINED_THEN_STABLE' | 'DECLINING';

export const PAY_PERIODS_PER_YEAR: Record<PayFrequency, number> = {
  WEEKLY: 52,
  BIWEEKLY: 26,
  SEMIMONTHLY: 24,
  MONTHLY: 12,
};

export interface EmployerPaystub {
  ytdGross: number;
  payDate: string; // ISO date
  payFrequency: PayFrequency;
  periodsWorked: number; // number of pay periods in this YTD
}

export interface EmployerW2 {
  year: number;
  wages: number;
}

export interface EmployerData {
  name: string;
  paystub?: EmployerPaystub;
  w2s: EmployerW2[]; // most recent first, up to 2
}

export interface VariableIncomeParams {
  employers: EmployerData[];
}

export interface EmployerResult {
  name: string;
  ytdAnnualized: number;
  ytdMonthly: number;
  w2Year1: number;
  w2Year2: number;
  trend: IncomeTrend;
  qualifyingMonthly: number;
  method: string;
}

export interface VariableIncomeResult {
  employers: EmployerResult[];
  combinedMonthly: number;
}

/**
 * Evaluate income trend between two years.
 */
export function evaluateTrend(current: number, prior: number): IncomeTrend {
  if (prior === 0) return 'STABLE_OR_UP';
  if (current >= prior) return 'STABLE_OR_UP';

  // Decline threshold: 10% or more considered declining
  const declinePercent = ((prior - current) / prior) * 100;
  if (declinePercent > 10) return 'DECLINING';

  return 'DECLINED_THEN_STABLE';
}

/**
 * Annualize YTD earnings based on pay frequency and periods worked.
 */
function annualizeYTD(paystub: EmployerPaystub): number {
  if (!paystub.periodsWorked || paystub.periodsWorked <= 0) return 0;

  const periodsPerYear = PAY_PERIODS_PER_YEAR[paystub.payFrequency] || 12;
  const perPeriod = paystub.ytdGross / paystub.periodsWorked;
  return perPeriod * periodsPerYear;
}

function computeEmployer(employer: EmployerData): EmployerResult {
  const w2Year1 = employer.w2s.length > 0 ? employer.w2s[0].wages : 0;
  const w2Year2 = employer.w2s.length > 1 ? employer.w2s[1].wages : 0;

  // Annualize YTD
  const ytdAnnualized = employer.paystub ? annualizeYTD(employer.paystub) : 0;
  const ytdMonthly = ytdAnnualized / 12;

  // Determine trend
  const compareValue = ytdAnnualized > 0 ? ytdAnnualized : w2Year1;
  const trend = evaluateTrend(compareValue, w2Year1 > 0 && ytdAnnualized > 0 ? w2Year1 : w2Year2);

  // Qualifying income calculation
  let qualifyingMonthly: number;
  let method: string;

  if (trend === 'DECLINING') {
    // Use most recent (lowest) figure
    qualifyingMonthly = ytdMonthly > 0 ? ytdMonthly : w2Year1 / 12;
    method = 'Most recent (declining trend)';
  } else if (w2Year2 > 0 && w2Year1 > w2Year2) {
    // 2-year average
    const twoYearTotal = w2Year1 + w2Year2;
    qualifyingMonthly = twoYearTotal / 24;
    method = '2-year average (Year 1 > Year 2)';
  } else if (w2Year1 > 0) {
    // Most recent year
    qualifyingMonthly = w2Year1 / 12;
    method = 'Most recent year / 12';
  } else {
    // YTD only
    qualifyingMonthly = ytdMonthly;
    method = 'YTD annualized';
  }

  return {
    name: employer.name,
    ytdAnnualized,
    ytdMonthly,
    w2Year1,
    w2Year2,
    trend,
    qualifyingMonthly,
    method,
  };
}

export function calculateVariableIncome(params: VariableIncomeParams): VariableIncomeResult {
  const employers = params.employers.map(computeEmployer);
  const combinedMonthly = employers.reduce((sum, e) => sum + e.qualifyingMonthly, 0);

  return { employers, combinedMonthly };
}
