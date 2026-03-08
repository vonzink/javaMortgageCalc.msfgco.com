/**
 * Rental Property Income (1038) Calculator
 *
 * Two methods:
 *
 * Method A (Schedule E):
 *   Adjusted Annual = (Rents + Insurance + Mortgage Interest + Taxes
 *                      + HOA + Depreciation + One-time Expense) - Total Expenses
 *   Monthly Adjusted = Adjusted Annual / Months in Service
 *   Net = Monthly Adjusted - Proposed PITIA
 *
 * Method B (Lease Agreement):
 *   Adjusted Monthly = Gross Monthly Rent x 75%
 *   Net = Adjusted Monthly - Proposed PITIA
 */

export type RentalMethod = 'scheduleE' | 'lease';

export interface RentalMethodAParams {
  rentsReceived: number;
  totalExpenses: number;
  insurance: number;
  mortgageInterest: number;
  taxes: number;
  hoaDues: number;
  depreciation: number;
  oneTimeExpense: number;
  monthsInService: number; // 1-12
  proposedPITIA: number;
}

export interface RentalMethodBParams {
  grossMonthlyRent: number;
  proposedPITIA: number;
}

export interface RentalMethodAResult {
  method: 'scheduleE';
  adjustedAnnualIncome: number;
  monthlyAdjusted: number;
  proposedPITIA: number;
  netRentalIncome: number;
}

export interface RentalMethodBResult {
  method: 'lease';
  adjustedMonthly: number;
  proposedPITIA: number;
  netRentalIncome: number;
}

export type Rental1038Result = RentalMethodAResult | RentalMethodBResult;

export function calculateRentalMethodA(params: RentalMethodAParams): RentalMethodAResult {
  const months = Math.max(1, Math.min(12, params.monthsInService || 12));

  const adjustedAnnualIncome =
    (params.rentsReceived +
      params.insurance +
      params.mortgageInterest +
      params.taxes +
      params.hoaDues +
      params.depreciation +
      params.oneTimeExpense) -
    params.totalExpenses;

  const monthlyAdjusted = adjustedAnnualIncome / months;
  const netRentalIncome = monthlyAdjusted - params.proposedPITIA;

  return {
    method: 'scheduleE',
    adjustedAnnualIncome,
    monthlyAdjusted,
    proposedPITIA: params.proposedPITIA,
    netRentalIncome,
  };
}

export function calculateRentalMethodB(params: RentalMethodBParams): RentalMethodBResult {
  const adjustedMonthly = params.grossMonthlyRent * 0.75;
  const netRentalIncome = adjustedMonthly - params.proposedPITIA;

  return {
    method: 'lease',
    adjustedMonthly,
    proposedPITIA: params.proposedPITIA,
    netRentalIncome,
  };
}
