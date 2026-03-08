import type { CalculatorMeta, CalculatorCategory, CategoryInfo } from '@/types/calculators';

export const CATEGORIES: CategoryInfo[] = [
  { id: 'general', label: 'General', color: 'bg-blue-100 text-blue-700' },
  { id: 'government', label: 'Government', color: 'bg-purple-100 text-purple-700' },
  { id: 'income', label: 'Income', color: 'bg-green-100 text-green-700' },
  { id: 'tools', label: 'Tools', color: 'bg-orange-100 text-orange-700' },
];

export const CALCULATORS: CalculatorMeta[] = [
  // General
  {
    slug: 'amortization',
    name: 'Amortization',
    category: 'general',
    icon: '\u{1F4CA}',
    description: 'Full amortization with schedule and charts',
    features: ['Monthly schedule', 'Extra payments', 'PMI auto-drop', 'CSV export', 'Interactive chart'],
  },
  {
    slug: 'apr',
    name: 'APR Calculator',
    category: 'general',
    icon: '\u{1F4C8}',
    description: 'APR calculation with fee breakdowns',
    features: ['Reg Z compliant', 'Fee breakdown', 'Note rate vs APR comparison'],
  },
  {
    slug: 'blended-rate',
    name: 'Blended Rate',
    category: 'general',
    icon: '\u{1F500}',
    description: 'Weighted average rate calculator',
    features: ['Multiple loans', 'Weighted average', 'Combined payment'],
  },
  {
    slug: 'buydown',
    name: 'Buydown Analysis',
    category: 'general',
    icon: '\u{1F4C9}',
    description: 'Temporary and permanent buydown analysis',
    features: ['2-1 buydown', '3-2-1 buydown', 'Permanent buydown', 'Cost analysis'],
  },
  {
    slug: 'buy-vs-rent',
    name: 'Buy vs Rent',
    category: 'general',
    icon: '\u{1F3E0}',
    description: 'Buy vs rent comparison over time',
    features: ['Multi-year projection', 'Equity building', 'Tax benefits', 'Opportunity cost'],
  },
  {
    slug: 'cash-vs-mortgage',
    name: 'Cash vs Mortgage',
    category: 'general',
    icon: '\u{1F4B0}',
    description: 'Cash purchase vs financing comparison',
    features: ['Opportunity cost', 'Investment returns', 'Tax implications'],
  },
  {
    slug: 'refi',
    name: 'Refinance Analysis',
    category: 'general',
    icon: '\u{1F504}',
    description: 'Refinance breakeven analysis',
    features: ['Breakeven calculation', 'Monthly savings', 'Total interest comparison'],
  },
  {
    slug: 'reo',
    name: 'REO Calculator',
    category: 'general',
    icon: '\u{1F3E2}',
    description: 'REO investment ROI calculator',
    features: ['Cash flow analysis', 'Cap rate', 'ROI projection'],
  },
  {
    slug: 'compare',
    name: 'Loan Comparison',
    category: 'general',
    icon: '\u{2696}\u{FE0F}',
    description: 'Side-by-side loan comparison',
    features: ['Up to 4 loans', 'APR comparison', 'Total cost analysis', 'Fee breakdown'],
  },

  // Government
  {
    slug: 'fha',
    name: 'FHA Calculator',
    category: 'government',
    icon: '\u{1F3DB}\u{FE0F}',
    description: 'FHA loan calculator with UFMIP',
    features: ['Purchase scenario', 'Rate/term refi', 'Streamline refi', 'NTB evaluation', 'UFMIP refund schedule'],
  },
  {
    slug: 'va-prequal',
    name: 'VA Pre-Qualification',
    category: 'government',
    icon: '\u{1F396}\u{FE0F}',
    description: 'VA pre-qualification worksheet',
    features: ['Residual income', 'DTI ratio', 'Payment factor lookup', 'Regional requirements'],
  },
  {
    slug: 'escrow',
    name: 'Escrow Prepaids',
    category: 'government',
    icon: '\u{1F4CB}',
    description: 'Escrow prepaids calculator',
    features: ['Tax prepaids', 'Insurance prepaids', 'Per diem interest', 'Cushion calculation'],
  },

  // Income
  {
    slug: 'var-income',
    name: 'Variable Income',
    category: 'income',
    icon: '\u{1F4CA}',
    description: 'Variable income analyzer with trending',
    features: ['Base, OT, bonus, commission', 'YTD trending', 'Fannie Mae B3-3.1', 'Multi-employer'],
  },
  {
    slug: 'income-questionnaire',
    name: 'Income Guide',
    category: 'income',
    icon: '\u{2753}',
    description: 'Income calculator selection guide',
    features: ['Income type quiz', 'Calculator recommendations', 'Documentation checklist'],
  },
  {
    slug: 'income/1040',
    name: 'Form 1040',
    category: 'income',
    icon: '\u{1F4C4}',
    description: 'W-2 wages, SSI, pensions, alimony',
    features: ['Multi-employer W-2', 'Pension/annuity', 'Social Security', 'Unemployment'],
  },
  {
    slug: 'income/1065',
    name: 'Form 1065',
    category: 'income',
    icon: '\u{1F4C4}',
    description: 'Partnership income calculation',
    features: ['Ordinary income', 'Depreciation add-back', 'Depletion', 'Amortization'],
  },
  {
    slug: 'income/1120',
    name: 'Form 1120',
    category: 'income',
    icon: '\u{1F4C4}',
    description: 'Corporate income calculation',
    features: ['Taxable income', 'Depreciation', 'Depletion', 'Compensation of officers'],
  },
  {
    slug: 'income/1120s',
    name: 'Form 1120S',
    category: 'income',
    icon: '\u{1F4C4}',
    description: 'S-Corporation income calculation',
    features: ['Ordinary income', 'Depreciation', 'Depletion', 'Compensation'],
  },
  {
    slug: 'income/1120s-k1',
    name: 'Form 1120S K-1',
    category: 'income',
    icon: '\u{1F4C4}',
    description: 'S-Corp K-1 income calculation',
    features: ['Ordinary income', 'Rental income', 'Distribution analysis'],
  },
  {
    slug: 'income/k1',
    name: 'Partnership K-1',
    category: 'income',
    icon: '\u{1F4C4}',
    description: 'Partnership K-1 income calculation',
    features: ['Ordinary income', 'Guaranteed payments', 'Net rental income'],
  },
  {
    slug: 'income/rental-1038',
    name: 'Rental (1038)',
    category: 'income',
    icon: '\u{1F3E0}',
    description: 'Rental property income (1038)',
    features: ['Gross rents', 'Operating expenses', 'PITIA offset', 'Net rental income'],
  },
  {
    slug: 'income/schedule-b',
    name: 'Schedule B',
    category: 'income',
    icon: '\u{1F4C4}',
    description: 'Interest and dividend income',
    features: ['Interest income', 'Tax-exempt interest', 'Dividends', 'Multi-institution'],
  },
  {
    slug: 'income/schedule-c',
    name: 'Schedule C',
    category: 'income',
    icon: '\u{1F4C4}',
    description: 'Self-employment income',
    features: ['Net profit', 'Depreciation add-back', 'Meals adjustment', 'Home office'],
  },
  {
    slug: 'income/schedule-d',
    name: 'Schedule D',
    category: 'income',
    icon: '\u{1F4C4}',
    description: 'Capital gains income',
    features: ['Short-term gains', 'Long-term gains', 'Recurring analysis'],
  },
  {
    slug: 'income/schedule-e',
    name: 'Schedule E',
    category: 'income',
    icon: '\u{1F4C4}',
    description: 'Supplemental income',
    features: ['Rental income', 'Royalties', 'Depreciation add-back', 'PITIA offset'],
  },
  {
    slug: 'income/schedule-e-subject',
    name: 'Schedule E (Subject)',
    category: 'income',
    icon: '\u{1F4C4}',
    description: 'Subject property Schedule E',
    features: ['Subject property rental', 'Vacancy factor', 'PITIA comparison'],
  },
  {
    slug: 'income/schedule-f',
    name: 'Schedule F',
    category: 'income',
    icon: '\u{1F33E}',
    description: 'Farm income calculation',
    features: ['Gross farm income', 'Farm expenses', 'Depreciation add-back'],
  },

  // Tools
  {
    slug: 'llpm',
    name: 'LLPM',
    category: 'tools',
    icon: '\u{1F4CA}',
    description: 'Loan-Level Price Matrix',
    features: ['LLPA lookup', 'Price adjustments', 'Multiple scenarios'],
  },
  {
    slug: 'batch-llpm',
    name: 'Batch LLPM',
    category: 'tools',
    icon: '\u{1F4E6}',
    description: 'Batch LLPM processor',
    features: ['CSV upload', 'Bulk pricing', 'Export results'],
  },
  {
    slug: 'mismo',
    name: 'MISMO Analyzer',
    category: 'tools',
    icon: '\u{1F4C4}',
    description: 'MISMO document analyzer',
    features: ['XML parsing', 'Field extraction', 'Auto-populate calculators'],
  },
  {
    slug: 'fee-worksheet',
    name: 'Fee Worksheet',
    category: 'tools',
    icon: '\u{1F4DD}',
    description: 'Fee and closing cost worksheet',
    features: ['Section 800-1300', 'Prepaids', 'Escrow', 'Cash to close'],
  },
  {
    slug: 'cover-letter',
    name: 'Cover Letter',
    category: 'tools',
    icon: '\u{2709}\u{FE0F}',
    description: 'Cover letter generator',
    features: ['Template-based', 'Auto-fill from data', 'PDF export'],
  },
];

/**
 * Get a calculator by slug.
 */
export function getCalculatorBySlug(slug: string): CalculatorMeta | undefined {
  return CALCULATORS.find((c) => c.slug === slug);
}

/**
 * Get all calculators in a category.
 */
export function getCalculatorsByCategory(category: CalculatorCategory): CalculatorMeta[] {
  return CALCULATORS.filter((c) => c.category === category);
}

/**
 * Search calculators by query string.
 */
export function searchCalculators(query: string): CalculatorMeta[] {
  const q = query.toLowerCase().trim();
  if (!q) return CALCULATORS;
  return CALCULATORS.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.features.some((f) => f.toLowerCase().includes(q))
  );
}

/**
 * Get category info by id.
 */
export function getCategoryInfo(id: CalculatorCategory): CategoryInfo | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

/**
 * Check if a slug is an income calculator path.
 */
export function isIncomeCalculator(slug: string): boolean {
  return slug.startsWith('income/');
}
