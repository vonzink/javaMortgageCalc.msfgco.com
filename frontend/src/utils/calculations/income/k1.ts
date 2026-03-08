/**
 * Schedule K-1 (1065) Partnership Income Calculator
 *
 * Formula per K-1 entity:
 *   Annual = Ordinary Income + Rental Real Estate + Other Rental Income
 *            + Guaranteed Payments
 *
 * Supports up to 4 K-1 entities, each with Year 1 and Year 2.
 * Uses standard Fannie Mae averaging policy.
 */

import { policyCalc, type PolicyResult } from './policyCalc';

export interface PartnershipK1Year {
  ordinaryIncome: number;
  rentalRealEstate: number;
  otherRentalIncome: number;
  guaranteedPayments: number;
}

export interface PartnershipK1Params {
  year1: PartnershipK1Year;
  year2: PartnershipK1Year;
}

export interface PartnershipK1Result {
  year1Total: number;
  year2Total: number;
  monthly: number;
  policy: PolicyResult;
}

export interface K1PartnershipParams {
  entities: PartnershipK1Params[]; // up to 4
}

export interface K1PartnershipResult {
  entities: PartnershipK1Result[];
  combinedMonthly: number;
}

function computeK1Year(yr: PartnershipK1Year): number {
  return yr.ordinaryIncome + yr.rentalRealEstate + yr.otherRentalIncome + yr.guaranteedPayments;
}

function hasYear2Data(yr: PartnershipK1Year): boolean {
  return [yr.ordinaryIncome, yr.rentalRealEstate, yr.otherRentalIncome, yr.guaranteedPayments]
    .some((v) => v !== 0);
}

function computeEntity(params: PartnershipK1Params): PartnershipK1Result {
  const year1Total = computeK1Year(params.year1);
  const year2Total = computeK1Year(params.year2);
  const hasYr2 = hasYear2Data(params.year2);
  const policy = policyCalc(year1Total, year2Total, hasYr2);

  return { year1Total, year2Total, monthly: policy.monthly, policy };
}

export function calculateK1Partnership(params: K1PartnershipParams): K1PartnershipResult {
  const entities = params.entities.map(computeEntity);
  const combinedMonthly = entities.reduce((sum, e) => sum + e.monthly, 0);

  return { entities, combinedMonthly };
}
