export interface EscrowParams {
  closingDate: string; // ISO date
  firstPaymentDate: string; // ISO date
  annualTaxes: number;
  taxDueMonth1: number; // 0-11
  taxDueMonth2: number; // 0-11 (second payment, -1 if annual)
  annualInsurance: number;
  insuranceRenewalMonth: number; // 0-11
  dailyInterestRate: number; // rate per day
  loanAmount: number;
  cushionMonths: number; // typically 2
}

export interface EscrowResult {
  perDiemInterest: number;
  daysOfInterest: number;
  prepaidInterest: number;
  monthlyTax: number;
  monthlyInsurance: number;
  taxMonthsToCollect: number;
  insuranceMonthsToCollect: number;
  taxEscrowDeposit: number;
  insuranceEscrowDeposit: number;
  insurancePremium: number; // full year upfront
  totalPrepaids: number;
  totalEscrow: number;
  totalPrepaidAndEscrow: number;
}

export function calculateEscrow(params: EscrowParams): EscrowResult {
  const {
    closingDate, firstPaymentDate, annualTaxes, taxDueMonth1, taxDueMonth2,
    annualInsurance, insuranceRenewalMonth, dailyInterestRate,
    loanAmount, cushionMonths,
  } = params;

  if (!closingDate || !firstPaymentDate) {
    return {
      perDiemInterest: 0, daysOfInterest: 0, prepaidInterest: 0,
      monthlyTax: 0, monthlyInsurance: 0, taxMonthsToCollect: 0,
      insuranceMonthsToCollect: 0, taxEscrowDeposit: 0,
      insuranceEscrowDeposit: 0, insurancePremium: 0,
      totalPrepaids: 0, totalEscrow: 0, totalPrepaidAndEscrow: 0,
    };
  }

  const closing = new Date(closingDate);
  const firstPmt = new Date(firstPaymentDate);

  // Per diem interest
  const perDiem = loanAmount * dailyInterestRate;
  const endOfClosingMonth = new Date(closing.getFullYear(), closing.getMonth() + 1, 0);
  const daysOfInterest = endOfClosingMonth.getDate() - closing.getDate() + 1;
  const prepaidInterest = perDiem * daysOfInterest;

  // Monthly amounts
  const monthlyTax = annualTaxes / 12;
  const monthlyInsurance = annualInsurance / 12;

  // Insurance premium (full year prepaid)
  const insurancePremium = annualInsurance;

  // Calculate months of tax escrow to collect
  const closingMonth = closing.getMonth();
  let taxMonthsToCollect = 0;
  if (taxDueMonth1 >= 0) {
    let monthsUntilDue = taxDueMonth1 - closingMonth;
    if (monthsUntilDue <= 0) monthsUntilDue += 12;
    const taxPayment = taxDueMonth2 >= 0 ? annualTaxes / 2 : annualTaxes;
    const monthsNeeded = Math.ceil(taxPayment / monthlyTax);
    taxMonthsToCollect = Math.max(0, monthsNeeded - monthsUntilDue + cushionMonths);
  }

  // Calculate months of insurance escrow to collect
  let insMonthsUntilRenewal = insuranceRenewalMonth - closingMonth;
  if (insMonthsUntilRenewal <= 0) insMonthsUntilRenewal += 12;
  const insuranceMonthsToCollect = Math.max(0, 12 - insMonthsUntilRenewal + cushionMonths);

  const taxEscrowDeposit = monthlyTax * taxMonthsToCollect;
  const insuranceEscrowDeposit = monthlyInsurance * insuranceMonthsToCollect;

  const totalPrepaids = prepaidInterest + insurancePremium;
  const totalEscrow = taxEscrowDeposit + insuranceEscrowDeposit;
  const totalPrepaidAndEscrow = totalPrepaids + totalEscrow;

  return {
    perDiemInterest: perDiem,
    daysOfInterest,
    prepaidInterest,
    monthlyTax,
    monthlyInsurance,
    taxMonthsToCollect,
    insuranceMonthsToCollect,
    taxEscrowDeposit,
    insuranceEscrowDeposit,
    insurancePremium,
    totalPrepaids,
    totalEscrow,
    totalPrepaidAndEscrow,
  };
}
