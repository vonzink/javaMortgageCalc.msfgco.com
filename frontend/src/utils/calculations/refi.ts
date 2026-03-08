import { calcMonthlyPayment } from '@/utils/formatters';

export interface RefiParams {
  currentBalance: number;
  currentRate: number; // annual as decimal
  currentTermRemaining: number; // years remaining
  newRate: number; // annual as decimal
  newTermYears: number;
  closingCosts: number;
  cashOut: number;
  rollInCosts: boolean;
}

export interface RefiResult {
  currentPayment: number;
  newPayment: number;
  monthlySavings: number;
  newLoanAmount: number;
  breakEvenMonths: number;
  totalCurrentInterest: number;
  totalNewInterest: number;
  interestSavings: number;
  lifetimeSavings: number;
}

export function calculateRefi(params: RefiParams): RefiResult {
  const {
    currentBalance, currentRate, currentTermRemaining,
    newRate, newTermYears, closingCosts, cashOut, rollInCosts,
  } = params;

  if (currentBalance <= 0) {
    return {
      currentPayment: 0, newPayment: 0, monthlySavings: 0, newLoanAmount: 0,
      breakEvenMonths: 0, totalCurrentInterest: 0, totalNewInterest: 0,
      interestSavings: 0, lifetimeSavings: 0,
    };
  }

  const currentPayment = calcMonthlyPayment(currentBalance, currentRate, currentTermRemaining);
  const newLoanAmount = currentBalance + cashOut + (rollInCosts ? closingCosts : 0);
  const newPayment = calcMonthlyPayment(newLoanAmount, newRate, newTermYears);
  const monthlySavings = currentPayment - newPayment;

  const totalCurrentPaid = currentPayment * currentTermRemaining * 12;
  const totalCurrentInterest = totalCurrentPaid - currentBalance;

  const totalNewPaid = newPayment * newTermYears * 12;
  const totalNewInterest = totalNewPaid - newLoanAmount;

  const interestSavings = totalCurrentInterest - totalNewInterest;
  const upfrontCost = rollInCosts ? 0 : closingCosts;
  const lifetimeSavings = interestSavings - upfrontCost;

  const breakEvenMonths = monthlySavings > 0
    ? Math.ceil((rollInCosts ? closingCosts : closingCosts) / monthlySavings)
    : 0;

  return {
    currentPayment,
    newPayment,
    monthlySavings,
    newLoanAmount,
    breakEvenMonths,
    totalCurrentInterest,
    totalNewInterest,
    interestSavings,
    lifetimeSavings,
  };
}
