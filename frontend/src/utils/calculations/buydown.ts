import { calcMonthlyPayment } from '@/utils/formatters';

export interface BuydownParams {
  loanAmount: number;
  baseRate: number; // annual as decimal (e.g. 0.065)
  termYears: number;
  buydownType: '2-1' | '3-2-1' | 'permanent';
  permanentReduction?: number; // basis points for permanent buydown
}

export interface BuydownYear {
  year: number;
  rate: number;
  payment: number;
  savings: number;
}

export interface BuydownResult {
  basePayment: number;
  buydownYears: BuydownYear[];
  totalSavings: number;
  buydownCost: number;
  breakEvenMonths: number;
  permanentRate?: number;
}

export function calculateBuydown(params: BuydownParams): BuydownResult {
  const { loanAmount, baseRate, termYears, buydownType, permanentReduction } = params;

  if (loanAmount <= 0 || baseRate <= 0 || termYears <= 0) {
    return { basePayment: 0, buydownYears: [], totalSavings: 0, buydownCost: 0, breakEvenMonths: 0 };
  }

  const basePayment = calcMonthlyPayment(loanAmount, baseRate, termYears);

  if (buydownType === 'permanent') {
    const reduction = (permanentReduction || 25) / 100; // basis points to percent
    const newRate = baseRate - reduction / 100;
    const newPayment = calcMonthlyPayment(loanAmount, newRate, termYears);
    const monthlySavings = basePayment - newPayment;
    const cost = loanAmount * (reduction / 100);
    const breakEven = monthlySavings > 0 ? Math.ceil(cost / monthlySavings) : 0;

    return {
      basePayment,
      buydownYears: [{ year: 1, rate: newRate, payment: newPayment, savings: monthlySavings * 12 }],
      totalSavings: monthlySavings * termYears * 12,
      buydownCost: cost,
      breakEvenMonths: breakEven,
      permanentRate: newRate,
    };
  }

  const reductions = buydownType === '3-2-1' ? [0.03, 0.02, 0.01] : [0.02, 0.01];
  const buydownYears: BuydownYear[] = [];
  let totalSavings = 0;
  let buydownCost = 0;

  for (let i = 0; i < reductions.length; i++) {
    const yearRate = baseRate - reductions[i];
    const yearPayment = calcMonthlyPayment(loanAmount, yearRate, termYears);
    const yearSavings = (basePayment - yearPayment) * 12;
    totalSavings += yearSavings;
    buydownCost += yearSavings;
    buydownYears.push({
      year: i + 1,
      rate: yearRate,
      payment: yearPayment,
      savings: yearSavings,
    });
  }

  // Remaining years at full rate
  buydownYears.push({
    year: reductions.length + 1,
    rate: baseRate,
    payment: basePayment,
    savings: 0,
  });

  return {
    basePayment,
    buydownYears,
    totalSavings,
    buydownCost,
    breakEvenMonths: 0, // N/A for temp buydowns
  };
}
