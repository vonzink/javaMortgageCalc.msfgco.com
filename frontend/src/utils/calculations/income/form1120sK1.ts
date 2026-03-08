/**
 * 1120S K-1 Income Calculator
 *
 * Formula per K-1 entity:
 *   Annual = Ordinary Income + Rental Real Estate Income + Other Rental Income
 *
 * Supports up to 4 K-1 entities, each with Year 1 and Year 2.
 * Uses standard Fannie Mae averaging policy.
 */

import { policyCalc, type PolicyResult } from './policyCalc';

export interface K1SEntityYear {
  ordinaryIncome: number;
  rentalRealEstate: number;
  otherRentalIncome: number;
}

export interface K1SEntityParams {
  year1: K1SEntityYear;
  year2: K1SEntityYear;
}

export interface K1SEntityResult {
  year1Total: number;
  year2Total: number;
  monthly: number;
  policy: PolicyResult;
}

export interface Form1120SK1Params {
  entities: K1SEntityParams[]; // up to 4
}

export interface Form1120SK1Result {
  entities: K1SEntityResult[];
  combinedMonthly: number;
}

function computeK1Year(yr: K1SEntityYear): number {
  return yr.ordinaryIncome + yr.rentalRealEstate + yr.otherRentalIncome;
}

function hasYear2Data(yr: K1SEntityYear): boolean {
  return [yr.ordinaryIncome, yr.rentalRealEstate, yr.otherRentalIncome].some((v) => v !== 0);
}

function computeEntity(params: K1SEntityParams): K1SEntityResult {
  const year1Total = computeK1Year(params.year1);
  const year2Total = computeK1Year(params.year2);
  const hasYr2 = hasYear2Data(params.year2);
  const policy = policyCalc(year1Total, year2Total, hasYr2);

  return { year1Total, year2Total, monthly: policy.monthly, policy };
}

export function calculateForm1120SK1(params: Form1120SK1Params): Form1120SK1Result {
  const entities = params.entities.map(computeEntity);
  const combinedMonthly = entities.reduce((sum, e) => sum + e.monthly, 0);

  return { entities, combinedMonthly };
}
