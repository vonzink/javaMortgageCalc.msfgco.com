/**
 * Stub MISMO XML parser.
 * Parses basic MISMO XML fields for loan data extraction.
 * Can be expanded later with full MISMO 3.4 schema support.
 */

export interface MISMOData {
  borrowerName?: string;
  coBorrowerName?: string;
  loanAmount?: number;
  interestRate?: number;
  loanTerm?: number;
  loanPurpose?: string;
  propertyAddress?: string;
  propertyCity?: string;
  propertyState?: string;
  propertyZip?: string;
  propertyType?: string;
  appraisedValue?: number;
  purchasePrice?: number;
  monthlyIncome?: number;
  monthlyDebts?: number;
  creditScore?: number;
  loanType?: string;
  occupancy?: string;
}

function getTextContent(doc: Document, tagName: string): string | undefined {
  const el = doc.getElementsByTagName(tagName)[0];
  return el?.textContent?.trim() || undefined;
}

function getNumericContent(doc: Document, tagName: string): number | undefined {
  const text = getTextContent(doc, tagName);
  if (!text) return undefined;
  const num = parseFloat(text);
  return isNaN(num) ? undefined : num;
}

export function parseMISMO(xmlString: string): MISMOData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  return {
    borrowerName:
      [getTextContent(doc, 'FirstName'), getTextContent(doc, 'LastName')]
        .filter(Boolean)
        .join(' ') || undefined,
    loanAmount: getNumericContent(doc, 'LoanAmount') ?? getNumericContent(doc, 'BaseLoanAmount'),
    interestRate: getNumericContent(doc, 'NoteRatePercent') ?? getNumericContent(doc, 'RequestedInterestRatePercent'),
    loanTerm: getNumericContent(doc, 'LoanMaturityPeriodCount'),
    loanPurpose: getTextContent(doc, 'LoanPurposeType'),
    propertyAddress: getTextContent(doc, 'AddressLineText'),
    propertyCity: getTextContent(doc, 'CityName'),
    propertyState: getTextContent(doc, 'StateCode'),
    propertyZip: getTextContent(doc, 'PostalCode'),
    propertyType: getTextContent(doc, 'PropertyUsageType'),
    appraisedValue: getNumericContent(doc, 'PropertyEstimatedValueAmount'),
    purchasePrice: getNumericContent(doc, 'SalesContractAmount') ?? getNumericContent(doc, 'PurchasePriceAmount'),
    creditScore: getNumericContent(doc, 'CreditScoreValue'),
    loanType: getTextContent(doc, 'MortgageType') ?? getTextContent(doc, 'LoanType'),
    occupancy: getTextContent(doc, 'PropertyUsageType'),
  };
}
