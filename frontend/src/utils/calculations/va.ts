export const PI_FACTORS: Record<string, Record<number, number>> = {
  '4.000': { 15: 7.40, 20: 6.06, 30: 4.77 }, '4.125': { 15: 7.46, 20: 6.13, 30: 4.85 },
  '4.250': { 15: 7.52, 20: 6.19, 30: 4.92 }, '4.375': { 15: 7.59, 20: 6.26, 30: 4.99 },
  '4.500': { 15: 7.65, 20: 6.33, 30: 5.07 }, '4.625': { 15: 7.71, 20: 6.39, 30: 5.14 },
  '4.750': { 15: 7.78, 20: 6.46, 30: 5.22 }, '4.875': { 15: 7.84, 20: 6.53, 30: 5.29 },
  '5.000': { 15: 7.91, 20: 6.60, 30: 5.37 }, '5.125': { 15: 7.97, 20: 6.67, 30: 5.44 },
  '5.250': { 15: 8.04, 20: 6.74, 30: 5.52 }, '5.375': { 15: 8.10, 20: 6.81, 30: 5.60 },
  '5.500': { 15: 8.17, 20: 6.88, 30: 5.68 }, '5.625': { 15: 8.24, 20: 6.95, 30: 5.76 },
  '5.750': { 15: 8.30, 20: 7.02, 30: 5.84 }, '5.875': { 15: 8.37, 20: 7.09, 30: 5.92 },
  '6.000': { 15: 8.44, 20: 7.16, 30: 6.00 }, '6.125': { 15: 8.51, 20: 7.24, 30: 6.08 },
  '6.250': { 15: 8.57, 20: 7.31, 30: 6.16 }, '6.375': { 15: 8.64, 20: 7.38, 30: 6.24 },
  '6.500': { 15: 8.71, 20: 7.46, 30: 6.32 }, '6.625': { 15: 8.78, 20: 7.53, 30: 6.40 },
  '6.750': { 15: 8.85, 20: 7.60, 30: 6.49 }, '6.875': { 15: 8.92, 20: 7.68, 30: 6.57 },
  '7.000': { 15: 8.99, 20: 7.75, 30: 6.65 }, '7.125': { 15: 9.06, 20: 7.83, 30: 6.74 },
  '7.250': { 15: 9.13, 20: 7.90, 30: 6.82 }, '7.375': { 15: 9.20, 20: 7.98, 30: 6.91 },
  '7.500': { 15: 9.27, 20: 8.06, 30: 6.99 }, '7.625': { 15: 9.34, 20: 8.13, 30: 7.08 },
  '7.750': { 15: 9.41, 20: 8.21, 30: 7.16 }, '7.875': { 15: 9.48, 20: 8.29, 30: 7.25 },
  '8.000': { 15: 9.56, 20: 8.36, 30: 7.34 }, '8.125': { 15: 9.63, 20: 8.44, 30: 7.42 },
  '8.250': { 15: 9.70, 20: 8.52, 30: 7.51 }, '8.375': { 15: 9.77, 20: 8.60, 30: 7.60 },
  '8.500': { 15: 9.85, 20: 8.68, 30: 7.69 }, '8.625': { 15: 9.92, 20: 8.76, 30: 7.78 },
  '8.750': { 15: 9.99, 20: 8.84, 30: 7.87 }, '8.875': { 15: 10.07, 20: 8.92, 30: 7.96 },
  '9.000': { 15: 10.14, 20: 9.00, 30: 8.05 }, '9.125': { 15: 10.22, 20: 9.08, 30: 8.14 },
  '9.250': { 15: 10.29, 20: 9.16, 30: 8.23 }, '9.375': { 15: 10.37, 20: 9.24, 30: 8.32 },
  '9.500': { 15: 10.44, 20: 9.32, 30: 8.41 },
};

export type VARegion = 'Northeast' | 'Midwest' | 'South' | 'West';

export const RESIDUAL_DATA = {
  under80k: {
    Northeast: { 1: 390, 2: 654, 3: 788, 4: 888, 5: 921 } as Record<number, number>,
    Midwest: { 1: 382, 2: 641, 3: 772, 4: 868, 5: 902 } as Record<number, number>,
    South: { 1: 382, 2: 641, 3: 772, 4: 868, 5: 902 } as Record<number, number>,
    West: { 1: 425, 2: 713, 3: 859, 4: 967, 5: 1004 } as Record<number, number>,
  },
  over80k: {
    Northeast: { 1: 450, 2: 755, 3: 909, 4: 1025, 5: 1062 } as Record<number, number>,
    Midwest: { 1: 441, 2: 738, 3: 889, 4: 1003, 5: 1039 } as Record<number, number>,
    South: { 1: 441, 2: 738, 3: 889, 4: 1003, 5: 1039 } as Record<number, number>,
    West: { 1: 491, 2: 823, 3: 990, 4: 1117, 5: 1158 } as Record<number, number>,
  },
  additionalUnder80k: 75,
  additionalOver80k: 80,
};

export interface VAParams {
  mortgageAmount: number;
  interestRate: string; // "6.500"
  loanTerm: number; // 15, 20, or 30
  grossIncome: number;
  familySize: number;
  region: VARegion;
  propertyTaxes: number;
  homeInsurance: number;
  hoaDues: number;
  carPayments: number;
  revolvingAccounts: number;
  installmentLoans: number;
  childCare: number;
  otherDebts: number;
  squareFootage: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
}

export interface VAResult {
  paymentFactor: number;
  piPayment: number;
  totalHousing: number;
  totalDebts: number;
  maintenanceCost: number;
  totalTaxes: number;
  requiredResidual: number;
  actualResidual: number;
  residualPasses: boolean;
  residualDifference: number;
  dtiRatio: number;
}

export function getPaymentFactor(rate: string, term: number): number {
  const key = parseFloat(rate).toFixed(3);
  return PI_FACTORS[key]?.[term] ?? 0;
}

export function getRequiredResidual(loanAmt: number, region: VARegion, familySize: number): number {
  const table = loanAmt >= 80000 ? 'over80k' : 'under80k';
  const add = loanAmt >= 80000 ? RESIDUAL_DATA.additionalOver80k : RESIDUAL_DATA.additionalUnder80k;
  const size = Math.min(familySize, 5);
  let base = RESIDUAL_DATA[table][region][size];
  if (familySize > 5) base += (familySize - 5) * add;
  return base;
}

export function calculateVAPrequal(params: VAParams): VAResult {
  const factor = getPaymentFactor(params.interestRate, params.loanTerm);
  const pi = (params.mortgageAmount / 1000) * factor;

  const totalHousing = pi + params.propertyTaxes + params.homeInsurance + params.hoaDues;
  const totalDebts = params.carPayments + params.revolvingAccounts + params.installmentLoans +
    params.childCare + params.otherDebts;

  const maintenanceCost = params.squareFootage * 0.14;
  const totalTaxes = params.federalTax + params.stateTax + params.socialSecurity;

  const requiredResidual = getRequiredResidual(params.mortgageAmount, params.region, params.familySize);
  const actualResidual = params.grossIncome - totalHousing - totalDebts - maintenanceCost - totalTaxes;

  const dtiRatio = params.grossIncome > 0 ? ((totalHousing + totalDebts) / params.grossIncome) * 100 : 0;

  return {
    paymentFactor: factor,
    piPayment: pi,
    totalHousing,
    totalDebts,
    maintenanceCost,
    totalTaxes,
    requiredResidual,
    actualResidual,
    residualPasses: actualResidual >= requiredResidual,
    residualDifference: actualResidual - requiredResidual,
    dtiRatio,
  };
}
