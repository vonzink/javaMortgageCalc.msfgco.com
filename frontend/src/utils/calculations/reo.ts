import { calcMonthlyPayment } from '@/utils/formatters';

export interface REOParams {
  purchasePrice: number;
  repairCosts: number;
  afterRepairValue: number;
  downPaymentPercent: number;
  mortgageRate: number; // annual as decimal
  termYears: number;
  monthlyRent: number;
  vacancyRate: number; // as decimal
  propertyTaxRate: number; // annual as decimal
  insurance: number; // annual
  maintenance: number; // annual
  managementFee: number; // as decimal of gross rent
  otherExpenses: number; // annual
}

export interface REOResult {
  totalInvestment: number;
  downPayment: number;
  loanAmount: number;
  monthlyPayment: number;
  grossAnnualIncome: number;
  effectiveGrossIncome: number;
  totalExpenses: number;
  netOperatingIncome: number;
  annualDebtService: number;
  cashFlow: number;
  capRate: number;
  cashOnCash: number;
  roi: number;
  dscr: number;
}

export function calculateREO(params: REOParams): REOResult {
  const {
    purchasePrice, repairCosts, afterRepairValue, downPaymentPercent,
    mortgageRate, termYears, monthlyRent, vacancyRate,
    propertyTaxRate, insurance, maintenance, managementFee, otherExpenses,
  } = params;

  const downPayment = purchasePrice * (downPaymentPercent / 100);
  const loanAmount = purchasePrice - downPayment;
  const totalInvestment = downPayment + repairCosts;
  const monthlyPayment = loanAmount > 0
    ? calcMonthlyPayment(loanAmount, mortgageRate, termYears)
    : 0;

  const grossAnnualIncome = monthlyRent * 12;
  const effectiveGrossIncome = grossAnnualIncome * (1 - vacancyRate);

  const annualTaxes = (afterRepairValue || purchasePrice) * propertyTaxRate;
  const mgmtCost = effectiveGrossIncome * managementFee;
  const totalExpenses = annualTaxes + insurance + maintenance + mgmtCost + otherExpenses;

  const netOperatingIncome = effectiveGrossIncome - totalExpenses;
  const annualDebtService = monthlyPayment * 12;
  const cashFlow = netOperatingIncome - annualDebtService;

  const capRate = purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0;
  const cashOnCash = totalInvestment > 0 ? (cashFlow / totalInvestment) * 100 : 0;

  const equityGain = (afterRepairValue || purchasePrice) - purchasePrice;
  const roi = totalInvestment > 0 ? ((cashFlow + equityGain) / totalInvestment) * 100 : 0;

  const dscr = annualDebtService > 0 ? netOperatingIncome / annualDebtService : 0;

  return {
    totalInvestment, downPayment, loanAmount, monthlyPayment,
    grossAnnualIncome, effectiveGrossIncome, totalExpenses,
    netOperatingIncome, annualDebtService, cashFlow,
    capRate, cashOnCash, roi, dscr,
  };
}
