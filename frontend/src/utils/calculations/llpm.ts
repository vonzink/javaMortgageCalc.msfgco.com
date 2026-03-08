/**
 * Loan-Level Price Matrix (LLPM) — stub for future API integration.
 * The actual LLPA data will come from the backend API.
 */

export interface LLPMParams {
  loanAmount: number;
  ltv: number;
  fico: number;
  loanPurpose: 'Purchase' | 'RateTermRefi' | 'CashOutRefi';
  propertyType: 'SFR' | 'Condo' | '2Unit' | '3-4Unit' | 'Manufactured';
  occupancy: 'Primary' | 'Secondary' | 'Investment';
  lockDays: number;
  basePrice: number;
}

export interface LLPAdjustment {
  category: string;
  description: string;
  adjustment: number;
}

export interface LLPMResult {
  basePrice: number;
  adjustments: LLPAdjustment[];
  totalAdjustment: number;
  finalPrice: number;
}

export function calculateLLPM(params: LLPMParams): LLPMResult {
  const adjustments: LLPAdjustment[] = [];

  // FICO/LTV adjustment (simplified example grid)
  let ficoAdj = 0;
  if (params.fico < 680 && params.ltv > 80) ficoAdj = -1.75;
  else if (params.fico < 700 && params.ltv > 80) ficoAdj = -1.0;
  else if (params.fico < 720 && params.ltv > 75) ficoAdj = -0.5;
  else if (params.fico >= 740 && params.ltv <= 75) ficoAdj = 0.25;

  if (ficoAdj !== 0) {
    adjustments.push({
      category: 'FICO/LTV',
      description: `FICO ${params.fico} / LTV ${params.ltv}%`,
      adjustment: ficoAdj,
    });
  }

  // Loan purpose adjustment
  if (params.loanPurpose === 'CashOutRefi') {
    adjustments.push({
      category: 'Loan Purpose',
      description: 'Cash-Out Refinance',
      adjustment: -0.375,
    });
  }

  // Property type adjustment
  if (params.propertyType === 'Condo') {
    adjustments.push({
      category: 'Property Type',
      description: 'Condominium',
      adjustment: -0.75,
    });
  } else if (params.propertyType === '2Unit') {
    adjustments.push({
      category: 'Property Type',
      description: '2-Unit',
      adjustment: -0.25,
    });
  } else if (params.propertyType === '3-4Unit') {
    adjustments.push({
      category: 'Property Type',
      description: '3-4 Unit',
      adjustment: -0.5,
    });
  } else if (params.propertyType === 'Manufactured') {
    adjustments.push({
      category: 'Property Type',
      description: 'Manufactured Home',
      adjustment: -1.0,
    });
  }

  // Occupancy adjustment
  if (params.occupancy === 'Secondary') {
    adjustments.push({
      category: 'Occupancy',
      description: 'Second Home',
      adjustment: -0.5,
    });
  } else if (params.occupancy === 'Investment') {
    adjustments.push({
      category: 'Occupancy',
      description: 'Investment Property',
      adjustment: -1.75,
    });
  }

  // High balance (loan amount > conforming limit)
  if (params.loanAmount > 766550) {
    adjustments.push({
      category: 'Loan Size',
      description: 'High Balance',
      adjustment: -0.25,
    });
  }

  const totalAdjustment = adjustments.reduce((sum, a) => sum + a.adjustment, 0);
  const finalPrice = params.basePrice + totalAdjustment;

  return {
    basePrice: params.basePrice,
    adjustments,
    totalAdjustment,
    finalPrice,
  };
}
