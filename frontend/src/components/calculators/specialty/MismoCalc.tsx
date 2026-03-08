import { useState, useCallback, useRef } from 'react';
import CalculatorShell from '@/components/calculators/CalculatorShell';
import ResultCard from '@/components/calculators/ResultCard';
import ResultSection, { ResultTable } from '@/components/calculators/ResultSection';
import FieldGroup from '@/components/calculators/FieldGroup';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { parseMISMO, type MISMOData } from '@/utils/mismoParser';
import { FileText, Upload, AlertCircle, Copy, Check } from 'lucide-react';

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<MESSAGE>
  <DEAL_SETS>
    <DEAL_SET>
      <DEALS>
        <DEAL>
          <PARTIES>
            <PARTY>
              <INDIVIDUAL>
                <NAME>
                  <FirstName>John</FirstName>
                  <LastName>Smith</LastName>
                </NAME>
              </INDIVIDUAL>
            </PARTY>
          </PARTIES>
          <LOANS>
            <LOAN>
              <TERMS_OF_LOAN>
                <LoanAmount>350000</LoanAmount>
                <NoteRatePercent>6.500</NoteRatePercent>
                <LoanMaturityPeriodCount>360</LoanMaturityPeriodCount>
                <LoanPurposeType>Purchase</LoanPurposeType>
                <MortgageType>Conventional</MortgageType>
              </TERMS_OF_LOAN>
            </LOAN>
          </LOANS>
          <COLLATERALS>
            <COLLATERAL>
              <SUBJECT_PROPERTY>
                <ADDRESS>
                  <AddressLineText>123 Main Street</AddressLineText>
                  <CityName>Springfield</CityName>
                  <StateCode>IL</StateCode>
                  <PostalCode>62701</PostalCode>
                </ADDRESS>
                <PROPERTY_DETAIL>
                  <PropertyEstimatedValueAmount>375000</PropertyEstimatedValueAmount>
                  <PropertyUsageType>PrimaryResidence</PropertyUsageType>
                </PROPERTY_DETAIL>
              </SUBJECT_PROPERTY>
            </COLLATERAL>
          </COLLATERALS>
          <SERVICES>
            <SERVICE>
              <CREDIT>
                <CREDIT_SCORES>
                  <CREDIT_SCORE>
                    <CreditScoreValue>740</CreditScoreValue>
                  </CREDIT_SCORE>
                </CREDIT_SCORES>
              </CREDIT>
            </SERVICE>
          </SERVICES>
        </DEAL>
      </DEALS>
    </DEAL_SET>
  </DEAL_SETS>
</MESSAGE>`;

export default function MismoCalc() {
  const [xmlInput, setXmlInput] = useState<string>('');
  const [parsedData, setParsedData] = useState<MISMOData | null>(null);
  const [parseError, setParseError] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleParse = useCallback(() => {
    if (!xmlInput.trim()) {
      setParseError('Please enter MISMO XML content or upload a file.');
      setParsedData(null);
      return;
    }

    try {
      // Basic XML validation
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlInput, 'text/xml');
      const errorNode = doc.querySelector('parsererror');
      if (errorNode) {
        setParseError('Invalid XML format. Please check the content and try again.');
        setParsedData(null);
        return;
      }

      const data = parseMISMO(xmlInput);
      setParsedData(data);
      setParseError('');
    } catch (err) {
      setParseError(`Parse error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setParsedData(null);
    }
  }, [xmlInput]);

  const reset = useCallback(() => {
    setXmlInput('');
    setParsedData(null);
    setParseError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setXmlInput(content);
    };
    reader.readAsText(file);
  }, []);

  const handleLoadSample = useCallback(() => {
    setXmlInput(SAMPLE_XML);
    setParseError('');
  }, []);

  const handleCopyJson = useCallback(() => {
    if (!parsedData) return;
    navigator.clipboard.writeText(JSON.stringify(parsedData, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [parsedData]);

  const fieldCount = parsedData
    ? Object.values(parsedData).filter((v) => v !== undefined && v !== null).length
    : 0;

  return (
    <CalculatorShell
      title="MISMO XML Analyzer"
      description="Parse MISMO XML documents to extract loan, borrower, and property data."
      onCalculate={handleParse}
      onReset={reset}
      calculateLabel="Parse XML"
      isCalculated={!!parsedData}
      results={
        parsedData ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ResultCard
                label="Fields Extracted"
                value={fieldCount.toString()}
                variant="primary"
              />
              {parsedData.loanAmount !== undefined && (
                <ResultCard
                  label="Loan Amount"
                  value={formatCurrency(parsedData.loanAmount, 0)}
                  variant="success"
                />
              )}
              {parsedData.interestRate !== undefined && (
                <ResultCard
                  label="Interest Rate"
                  value={formatPercent(parsedData.interestRate)}
                  variant="default"
                />
              )}
              {parsedData.creditScore !== undefined && (
                <ResultCard
                  label="Credit Score"
                  value={parsedData.creditScore.toString()}
                  variant={parsedData.creditScore >= 740 ? 'success' : parsedData.creditScore >= 680 ? 'warning' : 'danger'}
                />
              )}
            </div>

            {/* Borrower Information */}
            {(parsedData.borrowerName || parsedData.coBorrowerName) && (
              <ResultSection title="Borrower Information">
                <ResultTable
                  rows={[
                    ...(parsedData.borrowerName
                      ? [{ label: 'Borrower Name', value: parsedData.borrowerName }]
                      : []),
                    ...(parsedData.coBorrowerName
                      ? [{ label: 'Co-Borrower Name', value: parsedData.coBorrowerName }]
                      : []),
                    ...(parsedData.creditScore !== undefined
                      ? [{ label: 'Credit Score', value: parsedData.creditScore.toString() }]
                      : []),
                    ...(parsedData.monthlyIncome !== undefined
                      ? [{ label: 'Monthly Income', value: formatCurrency(parsedData.monthlyIncome) }]
                      : []),
                    ...(parsedData.monthlyDebts !== undefined
                      ? [{ label: 'Monthly Debts', value: formatCurrency(parsedData.monthlyDebts) }]
                      : []),
                  ]}
                />
              </ResultSection>
            )}

            {/* Loan Information */}
            {(parsedData.loanAmount !== undefined || parsedData.interestRate !== undefined) && (
              <ResultSection title="Loan Information">
                <ResultTable
                  rows={[
                    ...(parsedData.loanAmount !== undefined
                      ? [{ label: 'Loan Amount', value: formatCurrency(parsedData.loanAmount, 0), highlight: true }]
                      : []),
                    ...(parsedData.interestRate !== undefined
                      ? [{ label: 'Interest Rate', value: formatPercent(parsedData.interestRate) }]
                      : []),
                    ...(parsedData.loanTerm !== undefined
                      ? [{ label: 'Loan Term', value: `${parsedData.loanTerm} months (${(parsedData.loanTerm / 12).toFixed(0)} years)` }]
                      : []),
                    ...(parsedData.loanPurpose
                      ? [{ label: 'Loan Purpose', value: parsedData.loanPurpose }]
                      : []),
                    ...(parsedData.loanType
                      ? [{ label: 'Loan Type', value: parsedData.loanType }]
                      : []),
                    ...(parsedData.occupancy
                      ? [{ label: 'Occupancy', value: parsedData.occupancy }]
                      : []),
                  ]}
                />
              </ResultSection>
            )}

            {/* Property Information */}
            {(parsedData.propertyAddress || parsedData.appraisedValue !== undefined) && (
              <ResultSection title="Property Information">
                <ResultTable
                  rows={[
                    ...(parsedData.propertyAddress
                      ? [{ label: 'Street Address', value: parsedData.propertyAddress }]
                      : []),
                    ...(parsedData.propertyCity
                      ? [{ label: 'City', value: parsedData.propertyCity }]
                      : []),
                    ...(parsedData.propertyState
                      ? [{ label: 'State', value: parsedData.propertyState }]
                      : []),
                    ...(parsedData.propertyZip
                      ? [{ label: 'ZIP Code', value: parsedData.propertyZip }]
                      : []),
                    ...(parsedData.propertyType
                      ? [{ label: 'Property Type', value: parsedData.propertyType }]
                      : []),
                    ...(parsedData.appraisedValue !== undefined
                      ? [{ label: 'Appraised Value', value: formatCurrency(parsedData.appraisedValue, 0) }]
                      : []),
                    ...(parsedData.purchasePrice !== undefined
                      ? [{ label: 'Purchase Price', value: formatCurrency(parsedData.purchasePrice, 0) }]
                      : []),
                  ]}
                />
              </ResultSection>
            )}

            {/* Raw Data */}
            <ResultSection title="Extracted Data (JSON)">
              <div className="flex items-center justify-end mb-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="btn-secondary text-xs flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy JSON
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-gray-50 rounded-lg p-4 text-xs font-mono text-gray-700 overflow-x-auto max-h-64 overflow-y-auto">
                {JSON.stringify(parsedData, null, 2)}
              </pre>
            </ResultSection>
          </>
        ) : undefined
      }
    >
      {/* File Upload */}
      <FieldGroup title="XML Input">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xml,.mismo"
              onChange={handleFileUpload}
              className="hidden"
              id="xml-upload"
            />
            <label
              htmlFor="xml-upload"
              className="btn-secondary text-sm flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload XML File
            </label>
            <button
              type="button"
              onClick={handleLoadSample}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Load Sample
            </button>
          </div>

          <div className="w-full">
            <label className="label">MISMO XML Content</label>
            <textarea
              className="input-field font-mono text-xs"
              rows={12}
              value={xmlInput}
              onChange={(e) => setXmlInput(e.target.value)}
              placeholder="Paste MISMO XML content here..."
            />
          </div>

          {parseError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {parseError}
            </div>
          )}
        </div>
      </FieldGroup>
    </CalculatorShell>
  );
}
