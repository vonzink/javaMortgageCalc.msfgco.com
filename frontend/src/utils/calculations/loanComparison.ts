import { calcMonthlyPayment } from '@/utils/formatters';

export interface ComparisonLoan {
  label: string;
  loanAmount: number;
  rate: number; // annual as decimal
  termMonths: number;
  origFee: number;
  discountPts: number;
  processingFee: number;
  underwritingFee: number;
  appraisalFee: number;
  creditReportFee: number;
  titleFees: number;
  otherThirdParty: number;
  recordingFee: number;
  transferTax: number;
  prepaidInsurance: number;
  prepaidInterest: number;
  escrowTax: number;
  escrowInsurance: number;
  payoff1st: number;
  payoff2nd: number;
  payoffOther: number;
  downPayment: number;
  sellerCredits: number;
  lenderCredits: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyMI: number;
  monthlyHOA: number;
  purpose: 'Purchase' | 'Refinance';
}

export interface ComparisonResult {
  label: string;
  monthlyPI: number;
  totalMonthly: number;
  origTotal: number;
  thirdPartyTotal: number;
  govTotal: number;
  prepaidsTotal: number;
  escrowTotal: number;
  payoffsTotal: number;
  totalClosing: number;
  cashToClose: number;
  apr: number;
}

function calcPV(payment: number, annualRate: number, n: number): number {
  if (payment <= 0 || n <= 0) return 0;
  if (annualRate === 0) return payment * n;
  const r = annualRate / 12;
  return payment * (1 - Math.pow(1 + r, -n)) / r;
}

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

export function calculateLoanComparison(loan: ComparisonLoan): ComparisonResult {
  const { loanAmount, rate, termMonths } = loan;

  const monthlyPI = loanAmount > 0 && rate > 0 && termMonths > 0
    ? calcMonthlyPayment(loanAmount, rate, termMonths / 12)
    : 0;

  const origTotal = loan.origFee + loan.discountPts + loan.processingFee + loan.underwritingFee;
  const thirdPartyTotal = loan.appraisalFee + loan.creditReportFee + loan.titleFees + loan.otherThirdParty;
  const govTotal = loan.recordingFee + loan.transferTax;
  const prepaidsTotal = loan.prepaidInsurance + loan.prepaidInterest;
  const escrowTotal = loan.escrowTax + loan.escrowInsurance;
  const payoffsTotal = loan.payoff1st + loan.payoff2nd + loan.payoffOther;

  const totalClosing = origTotal + thirdPartyTotal + govTotal + prepaidsTotal + escrowTotal + payoffsTotal;

  const isRefi = loan.purpose === 'Refinance';
  const cashToClose = isRefi
    ? totalClosing - loanAmount - loan.sellerCredits - loan.lenderCredits
    : loan.downPayment + totalClosing - loan.sellerCredits - loan.lenderCredits;

  const totalMonthly = monthlyPI + loan.monthlyTax + loan.monthlyInsurance + loan.monthlyMI + loan.monthlyHOA;

  // APR calculation
  const amtFinanced = loanAmount - loan.discountPts - prepaidsTotal;
  let apr = 0;
  if (amtFinanced > 0 && monthlyPI > 0 && termMonths > 0) {
    apr = solveAPR(monthlyPI, amtFinanced, termMonths);
  }

  return {
    label: loan.label,
    monthlyPI,
    totalMonthly,
    origTotal,
    thirdPartyTotal,
    govTotal,
    prepaidsTotal,
    escrowTotal,
    payoffsTotal,
    totalClosing,
    cashToClose,
    apr,
  };
}

export function compareLoans(loans: ComparisonLoan[]): ComparisonResult[] {
  return loans.map(calculateLoanComparison);
}
