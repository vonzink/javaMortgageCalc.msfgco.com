import { calcMonthlyPayment } from '@/utils/formatters';

export interface CashVsMortgageParams {
  homePrice: number;
  mortgageRate: number; // annual as decimal
  termYears: number;
  downPaymentPercent: number;
  investmentReturn: number; // annual as decimal
  marginalTaxRate: number;
  propertyTaxRate: number;
  homeInsurance: number; // annual
  closingCosts: number;
}

export interface CashVsMortgageResult {
  cashScenario: {
    totalCost: number;
    opportunityCost: number;
    netCost: number;
  };
  mortgageScenario: {
    downPayment: number;
    monthlyPayment: number;
    totalInterest: number;
    closingCosts: number;
    taxSavings: number;
    investmentGrowth: number;
    netCost: number;
  };
  advantage: 'cash' | 'mortgage' | 'equal';
  savings: number;
}

export function calculateCashVsMortgage(params: CashVsMortgageParams): CashVsMortgageResult {
  const {
    homePrice, mortgageRate, termYears, downPaymentPercent,
    investmentReturn, marginalTaxRate, propertyTaxRate, homeInsurance, closingCosts,
  } = params;

  const totalMonths = termYears * 12;
  const downPayment = homePrice * (downPaymentPercent / 100);
  const loanAmount = homePrice - downPayment;
  const monthlyPayment = calcMonthlyPayment(loanAmount, mortgageRate, termYears);
  const totalPaid = monthlyPayment * totalMonths;
  const totalInterest = totalPaid - loanAmount;

  // Cash scenario: pay full price, invest nothing, lose investment returns
  const opportunityCost = homePrice * Math.pow(1 + investmentReturn, termYears) - homePrice;
  const cashTotalCost = homePrice;
  const cashNetCost = cashTotalCost + opportunityCost;

  // Mortgage scenario: invest the difference (homePrice - downPayment - closingCosts)
  const investableAmount = homePrice - downPayment - closingCosts;
  const investmentGrowth = investableAmount * (Math.pow(1 + investmentReturn, termYears) - 1);

  // Estimate total interest for tax deduction (simplified)
  const taxSavings = totalInterest * marginalTaxRate;
  const mortgageNetCost = downPayment + totalInterest + closingCosts - taxSavings - investmentGrowth;

  const savings = Math.abs(cashNetCost - mortgageNetCost);
  const advantage: 'cash' | 'mortgage' | 'equal' =
    cashNetCost < mortgageNetCost ? 'cash' : cashNetCost > mortgageNetCost ? 'mortgage' : 'equal';

  return {
    cashScenario: {
      totalCost: cashTotalCost,
      opportunityCost,
      netCost: cashNetCost,
    },
    mortgageScenario: {
      downPayment,
      monthlyPayment,
      totalInterest,
      closingCosts,
      taxSavings,
      investmentGrowth,
      netCost: mortgageNetCost,
    },
    advantage,
    savings,
  };
}
