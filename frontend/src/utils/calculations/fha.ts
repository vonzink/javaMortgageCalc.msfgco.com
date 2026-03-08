import { calcMonthlyPayment } from '@/utils/formatters';

export const UFMIP_RATE = 0.0175;

export const UFMIP_REFUND_TABLE = [
  { months: 1, refund: 80 }, { months: 2, refund: 78 }, { months: 3, refund: 76 },
  { months: 4, refund: 74 }, { months: 5, refund: 72 }, { months: 6, refund: 70 },
  { months: 7, refund: 68 }, { months: 8, refund: 66 }, { months: 9, refund: 64 },
  { months: 10, refund: 62 }, { months: 11, refund: 60 }, { months: 12, refund: 58 },
  { months: 13, refund: 56 }, { months: 14, refund: 54 }, { months: 15, refund: 52 },
  { months: 16, refund: 50 }, { months: 17, refund: 48 }, { months: 18, refund: 46 },
  { months: 19, refund: 44 }, { months: 20, refund: 42 }, { months: 21, refund: 40 },
  { months: 22, refund: 38 }, { months: 23, refund: 36 }, { months: 24, refund: 34 },
  { months: 25, refund: 32 }, { months: 26, refund: 30 }, { months: 27, refund: 28 },
  { months: 28, refund: 26 }, { months: 29, refund: 24 }, { months: 30, refund: 22 },
  { months: 31, refund: 20 }, { months: 32, refund: 18 }, { months: 33, refund: 16 },
  { months: 34, refund: 14 }, { months: 35, refund: 12 }, { months: 36, refund: 10 },
  { months: 37, refund: 0 },
];

export interface FHAParams {
  appraisedValue: number;
  purchasePrice: number;
  currentUpb: number;
  currentRate: number;
  currentPayment: number;
  currentLoanType: 'fixed' | 'arm';
  originalLoanAmount: number;
  newRate: number;
  newTerm: number;
  newLoanType: 'fixed' | 'arm';
  requestedLoanAmount: number;
  financeUfmip: boolean;
  prepaidsCash: number;
  totalCredits: number;
  escrowRefund: number;
  totalClosingCosts: number;
  isExistingFha: boolean;
  endorsementDate: string;
  currentDate: string;
  firstPaymentDate: string;
  refiType: 'rateTerm' | 'cashOut';
}

export interface FHAScenario {
  maxBaseLoan: number;
  actualLoan: number;
  ufmipRefund: number;
  ufmipAmt: number;
  totalLoan: number;
  ltv: number | null;
  payment: number;
  cashToClose: number;
  ntb: NTBResult;
  seasoning: boolean | null;
}

export interface NTBResult {
  met: boolean | null;
  reductionPercent: number;
  detail: string;
}

export interface UFMIPRefundResult {
  refundPercent: number;
  refundAmount: number;
  originalUfmip: number;
  monthsSince: number;
}

function minPositive(a: number, b: number): number {
  const vals = [a, b].filter((v) => Number.isFinite(v) && v > 0);
  return vals.length ? Math.min(...vals) : 0;
}

function monthsBetween(date1: string, date2: string): number {
  if (!date1 || !date2) return 0;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
  return Math.max(0, (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth()));
}

export function calculateUfmipRefund(
  endorsementDate: string,
  currentDate: string,
  originalLoanAmount: number
): UFMIPRefundResult {
  const result: UFMIPRefundResult = { refundPercent: 0, refundAmount: 0, originalUfmip: 0, monthsSince: 0 };
  if (!endorsementDate || !currentDate || !originalLoanAmount) return result;

  const ed = new Date(endorsementDate);
  const cd = new Date(currentDate);
  if (isNaN(ed.getTime()) || isNaN(cd.getTime())) return result;
  if (ed < new Date('1983-09-01')) return result;

  result.originalUfmip = originalLoanAmount * UFMIP_RATE;
  result.monthsSince = monthsBetween(endorsementDate, currentDate);

  if (result.monthsSince >= 37) {
    result.refundPercent = 0;
  } else if (result.monthsSince >= 1) {
    const entry = UFMIP_REFUND_TABLE.find((r) => r.months === result.monthsSince);
    result.refundPercent = entry ? entry.refund : 0;
  } else {
    result.refundPercent = 80;
  }

  result.refundAmount = result.originalUfmip * (result.refundPercent / 100);
  return result;
}

export function evaluateNTB(
  oldPmt: number,
  newPmt: number,
  oldRate: number,
  newRate: number,
  oldType: string,
  newType: string,
  scenario: 'refi' | 'streamline'
): NTBResult {
  const result: NTBResult = { met: null, reductionPercent: 0, detail: '' };
  if (!oldPmt || !newPmt) {
    result.detail = 'Insufficient data';
    return result;
  }

  const pmtReduction = oldPmt - newPmt;
  const pmtPct = pmtReduction / oldPmt;
  const rateReduction = oldRate - newRate;

  if (scenario === 'streamline') {
    const threshold = 0.05;
    result.met = pmtPct >= threshold;
    result.reductionPercent = pmtPct;
    result.detail = result.met
      ? `Payment reduced ${(pmtPct * 100).toFixed(2)}% (>=5% required)`
      : `Only ${(pmtPct * 100).toFixed(2)}% reduction (need >=5%)`;
    return result;
  }

  if (oldType === 'fixed' && newType === 'fixed') {
    if (rateReduction >= 0.5) {
      result.met = true;
      result.detail = `Rate reduced ${rateReduction.toFixed(3)}% (>=0.5% required)`;
    } else if (pmtReduction > 0) {
      result.met = true;
      result.detail = `Payment reduced`;
    } else {
      result.met = false;
      result.detail = `Rate reduction ${rateReduction.toFixed(3)}% < 0.5% and no payment reduction`;
    }
  } else if (oldType === 'arm' && newType === 'fixed') {
    const pmtIncreasePct = ((newPmt - oldPmt) / oldPmt) * 100;
    result.met = pmtIncreasePct <= 20;
    result.detail = result.met
      ? (pmtReduction >= 0 ? `Payment reduced` : `Payment increased ${pmtIncreasePct.toFixed(2)}% (<=20% allowed)`)
      : `Payment increased ${pmtIncreasePct.toFixed(2)}% (exceeds 20% limit)`;
  } else if (oldType === 'fixed' && newType === 'arm') {
    result.met = pmtReduction > 0;
    result.detail = result.met ? `Payment reduced` : 'Fixed to ARM requires payment reduction';
  } else if (oldType === 'arm' && newType === 'arm') {
    if (rateReduction > 0 || pmtReduction > 0) {
      result.met = true;
      const parts: string[] = [];
      if (rateReduction > 0) parts.push(`Rate reduced ${rateReduction.toFixed(3)}%`);
      if (pmtReduction > 0) parts.push(`Payment reduced`);
      result.detail = parts.join('; ');
    } else {
      result.met = false;
      result.detail = 'ARM to ARM requires rate OR payment reduction';
    }
  }

  result.reductionPercent = pmtPct;
  return result;
}

export function calculateFHAPurchase(params: FHAParams): FHAScenario | null {
  const priceOrValue = minPositive(params.purchasePrice, params.appraisedValue);
  if (!priceOrValue) return null;

  const maxLtv = 0.965;
  const maxBaseLoan = priceOrValue * maxLtv;
  const actualLoan = params.requestedLoanAmount > 0
    ? Math.min(params.requestedLoanAmount, maxBaseLoan)
    : maxBaseLoan;
  const ufmipAmt = params.financeUfmip ? actualLoan * UFMIP_RATE : 0;
  const totalLoan = actualLoan + ufmipAmt;
  const ltv = actualLoan / priceOrValue;
  const payment = calcMonthlyPayment(totalLoan, params.newRate / 100, params.newTerm);
  const downPayment = Math.max(0, params.purchasePrice - actualLoan);
  const ufmipOop = params.financeUfmip ? 0 : actualLoan * UFMIP_RATE;
  const cashToClose = downPayment + params.prepaidsCash + ufmipOop - params.totalCredits;

  return {
    maxBaseLoan, actualLoan, ufmipRefund: 0, ufmipAmt, totalLoan, ltv, payment,
    cashToClose, ntb: { met: null, reductionPercent: 0, detail: 'N/A' }, seasoning: null,
  };
}

export function calculateFHARefi(params: FHAParams): FHAScenario | null {
  if (!params.appraisedValue) return null;

  const isCashOut = params.refiType === 'cashOut';
  const maxLtv = isCashOut ? 0.80 : 0.9775;
  const maxBaseLoan = params.appraisedValue * maxLtv;
  const actualLoan = params.requestedLoanAmount > 0
    ? Math.min(params.requestedLoanAmount, maxBaseLoan)
    : maxBaseLoan;
  const ufmipAmt = params.financeUfmip ? actualLoan * UFMIP_RATE : 0;
  const totalLoan = actualLoan + ufmipAmt;
  const ltv = actualLoan / params.appraisedValue;
  const payment = calcMonthlyPayment(totalLoan, params.newRate / 100, params.newTerm);
  const payoff = params.currentUpb || 0;
  const cashToClose = (payoff + params.totalClosingCosts + params.prepaidsCash
    - params.totalCredits - params.escrowRefund) - totalLoan;

  const ntb = evaluateNTB(params.currentPayment, payment, params.currentRate, params.newRate,
    params.currentLoanType, params.newLoanType, 'refi');

  return {
    maxBaseLoan, actualLoan, ufmipRefund: 0, ufmipAmt, totalLoan, ltv, payment,
    cashToClose, ntb, seasoning: null,
  };
}

export function calculateFHAStreamline(params: FHAParams, ufmipRefund: UFMIPRefundResult): FHAScenario | null {
  if (!params.isExistingFha || !params.currentUpb) return null;

  const maxBaseLoan = Math.max(0, params.currentUpb - ufmipRefund.refundAmount);
  const actualLoan = maxBaseLoan;
  const newUfmip = actualLoan * UFMIP_RATE;
  const totalLoan = actualLoan + newUfmip;
  const payment = calcMonthlyPayment(totalLoan, params.newRate / 100, params.newTerm);
  const cashToClose = params.prepaidsCash - params.totalCredits - params.escrowRefund;

  const ntb = evaluateNTB(params.currentPayment, payment, params.currentRate, params.newRate,
    params.currentLoanType, params.newLoanType, 'streamline');

  // Seasoning check
  let seasoning: boolean | null = null;
  if (params.firstPaymentDate && params.currentDate) {
    const paymentsMade = monthsBetween(params.firstPaymentDate, params.currentDate);
    const fp = new Date(params.firstPaymentDate);
    const cd = new Date(params.currentDate);
    const daysSince = Math.max(0, Math.floor((cd.getTime() - fp.getTime()) / (1000 * 60 * 60 * 24)));
    seasoning = paymentsMade >= 6 && daysSince >= 210;
  }

  return {
    maxBaseLoan, actualLoan, ufmipRefund: ufmipRefund.refundAmount, ufmipAmt: newUfmip,
    totalLoan, ltv: null, payment, cashToClose, ntb, seasoning,
  };
}

export function calculateFHA(params: FHAParams): {
  purchase: FHAScenario | null;
  refi: FHAScenario | null;
  streamline: FHAScenario | null;
  notes: string[];
} {
  const notes: string[] = [];
  const ufmipRefund = calculateUfmipRefund(params.endorsementDate, params.currentDate, params.originalLoanAmount);

  const purchase = params.purchasePrice > 0 ? calculateFHAPurchase(params) : null;
  const refi = params.appraisedValue > 0 ? calculateFHARefi(params) : null;
  const streamline = (params.isExistingFha && params.currentUpb > 0)
    ? calculateFHAStreamline(params, ufmipRefund) : null;

  if (purchase) notes.push('Purchase: max base loan at 96.5% of lesser of price or value.');
  if (refi) {
    const label = params.refiType === 'cashOut' ? 'Cash-Out (80%)' : 'Rate/Term (97.75%)';
    notes.push(`FHA Refi (${label}): max base loan at ${(params.refiType === 'cashOut' ? 80 : 97.75)}% of appraised value.`);
  }
  if (streamline) {
    notes.push('Streamline: base loan = UPB minus UFMIP refund.');
    if (ufmipRefund.refundAmount > 0) {
      notes.push(`UFMIP Refund: $${ufmipRefund.refundAmount.toFixed(0)} (${ufmipRefund.refundPercent}% at month ${ufmipRefund.monthsSince}).`);
    }
  }

  return { purchase, refi, streamline, notes };
}
