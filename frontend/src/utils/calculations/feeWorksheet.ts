import { calcMonthlyPayment } from '@/utils/formatters';

export interface FeeWorksheetParams {
  // Top-level
  propertyValue: number;
  loanAmount: number;
  rate: number; // as decimal
  termMonths: number;
  loanPurpose: 'Purchase' | 'Refinance';
  // Origination
  origFee: number;
  discountPts: number;
  processingFee: number;
  underwritingFee: number;
  // Cannot shop
  appraisalFee: number;
  creditReportFee: number;
  techFee: number;
  voeFee: number;
  floodFee: number;
  taxServiceFee: number;
  mersFee: number;
  // Can shop
  eRecordingFee: number;
  titleCPL: number;
  titleLenders: number;
  titleSettlement: number;
  titleTaxCert: number;
  titleOwners: number;
  wireFee: number;
  // Government
  recordingFee: number;
  transferTax: number;
  // Prepaids
  hazInsAmt: number;
  hazInsMonths: number;
  prepaidIntPerDiem: number;
  prepaidIntDays: number;
  // Escrow
  escTaxAmt: number;
  escTaxMonths: number;
  escInsAmt: number;
  escInsMonths: number;
  // Other
  other1: number;
  other2: number;
  // Monthly
  monthlyMI: number;
  monthlyHOA: number;
  // Credits
  sellerCredits: number;
  lenderCredits: number;
  // Custom items
  customItems?: Array<{ section: string; name: string; amount: number }>;
}

export interface FeeWorksheetResult {
  origTotal: number;
  cannotShopTotal: number;
  canShopTotal: number;
  govTotal: number;
  prepaidsTotal: number;
  escrowTotal: number;
  otherTotal: number;
  prepaidHazIns: number;
  prepaidInterest: number;
  escrowTax: number;
  escrowIns: number;
  estClosing: number;
  discount: number;
  estPrepaids: number;
  totalDue: number;
  totalPaid: number;
  fundsFromYou: number;
  monthlyPI: number;
  totalMonthly: number;
}

export function calculateFeeWorksheet(params: FeeWorksheetParams): FeeWorksheetResult {
  const customBySection = (section: string): number => {
    if (!params.customItems) return 0;
    return params.customItems
      .filter((i) => i.section === section)
      .reduce((s, i) => s + i.amount, 0);
  };

  const origTotal = params.origFee + params.discountPts + params.processingFee +
    params.underwritingFee + customBySection('origination');

  const cannotShopTotal = params.appraisalFee + params.creditReportFee + params.techFee +
    params.voeFee + params.floodFee + params.taxServiceFee + params.mersFee +
    customBySection('cannotShop');

  const canShopTotal = params.eRecordingFee + params.titleCPL + params.titleLenders +
    params.titleSettlement + params.titleTaxCert + params.titleOwners + params.wireFee +
    customBySection('canShop');

  const govTotal = params.recordingFee + params.transferTax + customBySection('government');

  const prepaidHazIns = params.hazInsAmt * params.hazInsMonths;
  const prepaidInterest = params.prepaidIntPerDiem * params.prepaidIntDays;
  const prepaidsTotal = prepaidHazIns + prepaidInterest + customBySection('prepaids');

  const escrowTax = params.escTaxAmt * params.escTaxMonths;
  const escrowIns = params.escInsAmt * params.escInsMonths;
  const escrowTotal = escrowTax + escrowIns + customBySection('escrow');

  const otherTotal = params.other1 + params.other2 + customBySection('other');

  const estClosing = cannotShopTotal + canShopTotal + govTotal + otherTotal;
  const discount = origTotal;
  const estPrepaids = prepaidsTotal + escrowTotal;

  const isRefi = params.loanPurpose === 'Refinance';
  const purchasePrice = isRefi ? 0 : params.propertyValue;
  const totalDue = purchasePrice + estPrepaids + estClosing + discount;
  const totalPaid = params.loanAmount;
  const fundsFromYou = totalDue - totalPaid - params.sellerCredits - params.lenderCredits;

  let monthlyPI = 0;
  if (params.loanAmount > 0 && params.rate > 0 && params.termMonths > 0) {
    monthlyPI = calcMonthlyPayment(params.loanAmount, params.rate, params.termMonths / 12);
  }

  const totalMonthly = monthlyPI + params.hazInsAmt + params.escTaxAmt +
    params.monthlyMI + params.monthlyHOA;

  return {
    origTotal, cannotShopTotal, canShopTotal, govTotal,
    prepaidsTotal, escrowTotal, otherTotal,
    prepaidHazIns, prepaidInterest, escrowTax, escrowIns,
    estClosing, discount, estPrepaids, totalDue, totalPaid, fundsFromYou,
    monthlyPI, totalMonthly,
  };
}
