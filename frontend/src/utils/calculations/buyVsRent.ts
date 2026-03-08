import { calcMonthlyPayment } from '@/utils/formatters';

export interface BuyVsRentParams {
  homePrice: number;
  downPaymentPercent: number;
  mortgageRate: number; // annual as decimal
  termYears: number;
  propertyTaxRate: number; // annual as decimal
  homeInsurance: number; // annual
  maintenanceRate: number; // annual as decimal of home value
  homeAppreciation: number; // annual as decimal
  monthlyRent: number;
  rentIncrease: number; // annual as decimal
  investmentReturn: number; // annual as decimal
  marginalTaxRate: number; // for mortgage interest deduction
  yearsToAnalyze: number;
}

export interface BuyVsRentYear {
  year: number;
  monthlyCostBuy: number;
  monthlyCostRent: number;
  homeEquity: number;
  homeValue: number;
  loanBalance: number;
  rentTotal: number;
  buyTotal: number;
  investmentValue: number;
  netAdvantage: number; // positive = buying wins
}

export interface BuyVsRentResult {
  years: BuyVsRentYear[];
  breakEvenYear: number | null;
  totalBuyCost: number;
  totalRentCost: number;
}

export function calculateBuyVsRent(params: BuyVsRentParams): BuyVsRentResult {
  const {
    homePrice, downPaymentPercent, mortgageRate, termYears,
    propertyTaxRate, homeInsurance, maintenanceRate, homeAppreciation,
    monthlyRent, rentIncrease, investmentReturn, marginalTaxRate, yearsToAnalyze,
  } = params;

  if (homePrice <= 0 || monthlyRent <= 0) {
    return { years: [], breakEvenYear: null, totalBuyCost: 0, totalRentCost: 0 };
  }

  const downPayment = homePrice * (downPaymentPercent / 100);
  const loanAmount = homePrice - downPayment;
  const monthlyPI = calcMonthlyPayment(loanAmount, mortgageRate, termYears);

  const years: BuyVsRentYear[] = [];
  let balance = loanAmount;
  let cumulativeBuy = downPayment;
  let cumulativeRent = 0;
  let investmentValue = downPayment; // renter invests the down payment
  let breakEvenYear: number | null = null;
  const monthlyRate = mortgageRate / 12;

  for (let yr = 1; yr <= yearsToAnalyze; yr++) {
    const homeValue = homePrice * Math.pow(1 + homeAppreciation, yr);
    const annualTax = homeValue * propertyTaxRate;
    const annualMaintenance = homeValue * maintenanceRate;
    const currentRent = monthlyRent * Math.pow(1 + rentIncrease, yr - 1);

    // Calculate annual interest paid for tax deduction
    let yearInterest = 0;
    for (let m = 0; m < 12 && balance > 0.005; m++) {
      const interest = balance * monthlyRate;
      const principal = Math.min(monthlyPI - interest, balance);
      yearInterest += interest;
      balance -= principal;
    }
    if (balance < 0.005) balance = 0;

    const taxSavings = yearInterest * marginalTaxRate;
    const annualBuyCost = (monthlyPI * 12) + annualTax + homeInsurance + annualMaintenance - taxSavings;
    const annualRentCost = currentRent * 12;

    cumulativeBuy += annualBuyCost;
    cumulativeRent += annualRentCost;

    // Renter invests savings
    const monthlySavings = Math.max(0, (annualBuyCost - annualRentCost) / 12);
    investmentValue = (investmentValue + monthlySavings * 12) * (1 + investmentReturn);

    const homeEquity = homeValue - balance;
    const netAdvantage = homeEquity - cumulativeBuy + cumulativeRent - investmentValue;

    if (breakEvenYear === null && netAdvantage > 0) {
      breakEvenYear = yr;
    }

    years.push({
      year: yr,
      monthlyCostBuy: annualBuyCost / 12,
      monthlyCostRent: currentRent,
      homeEquity,
      homeValue,
      loanBalance: balance,
      rentTotal: cumulativeRent,
      buyTotal: cumulativeBuy,
      investmentValue,
      netAdvantage,
    });
  }

  return {
    years,
    breakEvenYear,
    totalBuyCost: cumulativeBuy,
    totalRentCost: cumulativeRent,
  };
}
