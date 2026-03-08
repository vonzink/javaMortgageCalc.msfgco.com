import { calcMonthlyPayment } from '@/utils/formatters';

export interface LoanEntry {
  balance: number;
  rate: number; // annual as decimal
  termYears: number;
}

export interface BlendedRateResult {
  blendedRate: number;
  totalBalance: number;
  combinedPayment: number;
  loans: Array<{ balance: number; rate: number; payment: number; weight: number }>;
}

export function calculateBlendedRate(loans: LoanEntry[]): BlendedRateResult {
  const validLoans = loans.filter((l) => l.balance > 0 && l.rate > 0 && l.termYears > 0);

  if (validLoans.length === 0) {
    return { blendedRate: 0, totalBalance: 0, combinedPayment: 0, loans: [] };
  }

  const totalBalance = validLoans.reduce((sum, l) => sum + l.balance, 0);

  const loanDetails = validLoans.map((l) => {
    const payment = calcMonthlyPayment(l.balance, l.rate, l.termYears);
    const weight = totalBalance > 0 ? l.balance / totalBalance : 0;
    return { balance: l.balance, rate: l.rate, payment, weight };
  });

  const combinedPayment = loanDetails.reduce((sum, l) => sum + l.payment, 0);
  const blendedRate = loanDetails.reduce((sum, l) => sum + l.rate * l.weight, 0);

  return { blendedRate, totalBalance, combinedPayment, loans: loanDetails };
}
