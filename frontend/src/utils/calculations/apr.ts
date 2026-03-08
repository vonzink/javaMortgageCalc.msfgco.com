import { calcMonthlyPayment } from '@/utils/formatters';

export interface APRParams {
  loanAmount: number;
  rate: number; // annual as decimal
  termYears: number;
  discountPoints: number; // as decimal (e.g. 0.01 = 1%)
  financedFees: number;
  prepaidFees: number;
}

export interface APRResult {
  apr: number; // annual as decimal
  monthlyPayment: number;
  amountFinanced: number;
  financeCharges: number;
  aprSpread: number; // basis points difference
  totalUpfrontCosts: number;
}

function calcPV(payment: number, annualRate: number, n: number): number {
  if (payment <= 0 || n <= 0) return 0;
  if (annualRate === 0) return payment * n;
  const r = annualRate / 12;
  return payment * (1 - Math.pow(1 + r, -n)) / r;
}

/**
 * Binary search iterative solver for APR.
 * Find the rate where PV(all payments) = amountFinanced
 */
function solveAPR(monthlyPmt: number, amtFinanced: number, n: number): number {
  if (amtFinanced <= 0 || monthlyPmt <= 0 || n <= 0) return 0;
  if (monthlyPmt * n < amtFinanced) return 0;

  let lo = 0.0001;
  let hi = 1;
  let apr = 0;

  for (let i = 0; i < 100; i++) {
    apr = (lo + hi) / 2;
    const pv = calcPV(monthlyPmt, apr, n);
    if (Math.abs(pv - amtFinanced) < 1e-8) break;
    if (pv > amtFinanced) lo = apr;
    else hi = apr;
  }

  return apr;
}

export function calculateAPR(params: APRParams): APRResult {
  const { loanAmount, rate, termYears, discountPoints, financedFees, prepaidFees } = params;

  if (loanAmount <= 0) {
    return { apr: 0, monthlyPayment: 0, amountFinanced: 0, financeCharges: 0, aprSpread: 0, totalUpfrontCosts: 0 };
  }

  const principal = loanAmount + financedFees;
  const monthlyPmt = calcMonthlyPayment(principal, rate, termYears);
  const pointsAmt = loanAmount * discountPoints;
  const amtFinanced = loanAmount - pointsAmt - prepaidFees;
  const n = termYears * 12;
  const totalPmts = monthlyPmt * n;
  const finChg = totalPmts - amtFinanced;
  const apr = amtFinanced > 0 ? solveAPR(monthlyPmt, amtFinanced, n) : 0;
  const aprSpread = (apr - rate) * 100; // in percentage points
  const totalUpfrontCosts = pointsAmt + prepaidFees + financedFees;

  return {
    apr,
    monthlyPayment: monthlyPmt,
    amountFinanced: Math.max(0, amtFinanced),
    financeCharges: Math.max(0, finChg),
    aprSpread,
    totalUpfrontCosts,
  };
}
