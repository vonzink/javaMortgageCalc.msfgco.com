import { calcMonthlyPayment } from '@/utils/formatters';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface AmortizationParams {
  loanAmount: number;
  rate: number; // annual rate as decimal (e.g. 0.065)
  termYears: number;
  startMonth: number; // 0-11
  startYear: number;
  monthlyTax: number;
  monthlyIns: number;
  monthlyPMI: number;
  extraAmount: number;
  extraFreq: 'monthly' | 'annually' | 'one-time';
  extraStartMonth: number;
  extraStartYear: number;
  propertyValue: number;
}

export interface AmortizationRow {
  paymentNum: number;
  month: number;
  year: number;
  schedYear: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  extra: number;
  balance: number;
  ltv: number;
  pmiActive: boolean;
  pmiThisMonth: number;
  monthlyTax: number;
  monthlyIns: number;
  totalMonthly: number;
}

export interface AmortizationSummary {
  monthlyPI: number;
  totalMonthly: number;
  totalInterest: number;
  totalCost: number;
  payoffDate: string;
  interestSaved: number;
  timeSaved: number; // months
}

export function generateAmortizationSchedule(
  params: AmortizationParams,
  includeExtras: boolean = true
): AmortizationRow[] {
  const {
    loanAmount, rate, termYears, startMonth, startYear,
    propertyValue, monthlyTax, monthlyIns, monthlyPMI,
    extraAmount, extraFreq, extraStartMonth, extraStartYear,
  } = params;

  if (loanAmount <= 0 || termYears <= 0) return [];

  const monthlyRate = rate / 12;
  const totalPayments = termYears * 12;
  const basePayment = calcMonthlyPayment(loanAmount, rate, termYears);

  const schedule: AmortizationRow[] = [];
  let balance = loanAmount;

  for (let i = 1; i <= totalPayments && balance > 0.005; i++) {
    const month = (startMonth + i - 1) % 12;
    const year = startYear + Math.floor((startMonth + i - 1) / 12);
    const schedYear = Math.ceil(i / 12);

    const interestPmt = balance * monthlyRate;
    let principalPmt = Math.min(basePayment - interestPmt, balance);
    const payment = interestPmt + principalPmt;

    let extra = 0;
    if (includeExtras && extraAmount > 0) {
      const extraStartDate = new Date(extraStartYear, extraStartMonth, 1);
      const thisDate = new Date(year, month, 1);

      if (thisDate >= extraStartDate) {
        if (extraFreq === 'monthly') {
          extra = extraAmount;
        } else if (extraFreq === 'annually') {
          if (month === extraStartMonth) {
            extra = extraAmount;
          }
        } else if (extraFreq === 'one-time') {
          if (month === extraStartMonth && year === extraStartYear) {
            extra = extraAmount;
          }
        }
      }
    }

    extra = Math.min(extra, balance - principalPmt);
    if (extra < 0) extra = 0;

    balance -= (principalPmt + extra);
    if (balance < 0.005) balance = 0;

    const ltv = propertyValue > 0 ? (balance / propertyValue) * 100 : 0;
    const pmiActive = ltv > 80 && monthlyPMI > 0;
    const pmiThisMonth = pmiActive ? monthlyPMI : 0;

    schedule.push({
      paymentNum: i,
      month,
      year,
      schedYear,
      date: `${MONTHS[month]} ${year}`,
      payment: payment + extra,
      principal: principalPmt,
      interest: interestPmt,
      extra,
      balance,
      ltv,
      pmiActive,
      pmiThisMonth,
      monthlyTax,
      monthlyIns,
      totalMonthly: payment + extra + monthlyTax + monthlyIns + pmiThisMonth,
    });
  }

  return schedule;
}

export function calculateAmortizationSummary(
  params: AmortizationParams,
  schedule: AmortizationRow[],
  baseSchedule: AmortizationRow[]
): AmortizationSummary {
  if (schedule.length === 0) {
    return { monthlyPI: 0, totalMonthly: 0, totalInterest: 0, totalCost: 0, payoffDate: '', interestSaved: 0, timeSaved: 0 };
  }

  const monthlyPI = calcMonthlyPayment(params.loanAmount, params.rate, params.termYears);
  const firstRow = schedule[0];
  const lastRow = schedule[schedule.length - 1];

  const totalInterest = schedule.reduce((sum, r) => sum + r.interest, 0);
  const totalPaid = schedule.reduce((sum, r) => sum + r.payment, 0);
  const totalPMI = schedule.reduce((s, r) => s + r.pmiThisMonth, 0);
  const totalMonthly = monthlyPI + params.monthlyTax + params.monthlyIns +
    (firstRow.pmiActive ? params.monthlyPMI : 0);

  const totalCost = totalPaid + (schedule.length * (params.monthlyTax + params.monthlyIns)) + totalPMI;

  const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const payoffDate = `${MONTH_FULL[lastRow.month]} ${lastRow.year}`;

  let interestSaved = 0;
  let timeSaved = 0;
  if (baseSchedule.length > schedule.length) {
    const baseInterest = baseSchedule.reduce((sum, r) => sum + r.interest, 0);
    interestSaved = baseInterest - totalInterest;
    timeSaved = baseSchedule.length - schedule.length;
  }

  return { monthlyPI, totalMonthly, totalInterest, totalCost, payoffDate, interestSaved, timeSaved };
}
