import { Suspense, lazy, useMemo } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CALCULATORS } from '@/utils/calculatorRegistry';
import { ArrowLeft, Loader2 } from 'lucide-react';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
    </div>
  );
}

// Lazy-loaded calculator components keyed by registry slug
const COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  // General
  'amortization': lazy(() => import('@/components/calculators/general/AmortizationCalc')),
  'apr': lazy(() => import('@/components/calculators/general/AprCalc')),
  'blended-rate': lazy(() => import('@/components/calculators/general/BlendedRateCalc')),
  'buydown': lazy(() => import('@/components/calculators/general/BuydownCalc')),
  'buy-vs-rent': lazy(() => import('@/components/calculators/general/BuyVsRentCalc')),
  'cash-vs-mortgage': lazy(() => import('@/components/calculators/general/CashVsMortgageCalc')),
  'refi': lazy(() => import('@/components/calculators/general/RefiCalc')),
  'reo': lazy(() => import('@/components/calculators/general/ReoCalc')),
  'compare': lazy(() => import('@/components/calculators/general/LoanComparisonCalc')),

  // Government
  'fha': lazy(() => import('@/components/calculators/government/FhaCalc')),
  'va-prequal': lazy(() => import('@/components/calculators/government/VaPrequalCalc')),
  'escrow': lazy(() => import('@/components/calculators/government/EscrowCalc')),

  // Income
  'var-income': lazy(() => import('@/components/calculators/income/VariableIncomeCalc')),
  'income-questionnaire': lazy(() => import('@/components/calculators/income/IncomeQuestionnaireCalc')),
  'income/1040': lazy(() => import('@/components/calculators/income/Form1040Calc')),
  'income/1065': lazy(() => import('@/components/calculators/income/Form1065Calc')),
  'income/1120': lazy(() => import('@/components/calculators/income/Form1120Calc')),
  'income/1120s': lazy(() => import('@/components/calculators/income/Form1120sCalc')),
  'income/1120s-k1': lazy(() => import('@/components/calculators/income/Form1120sK1Calc')),
  'income/k1': lazy(() => import('@/components/calculators/income/K1Calc')),
  'income/rental-1038': lazy(() => import('@/components/calculators/income/Rental1038Calc')),
  'income/schedule-b': lazy(() => import('@/components/calculators/income/ScheduleBCalc')),
  'income/schedule-c': lazy(() => import('@/components/calculators/income/ScheduleCCalc')),
  'income/schedule-d': lazy(() => import('@/components/calculators/income/ScheduleDCalc')),
  'income/schedule-e': lazy(() => import('@/components/calculators/income/ScheduleECalc')),
  'income/schedule-e-subject': lazy(() => import('@/components/calculators/income/ScheduleESubjectCalc')),
  'income/schedule-f': lazy(() => import('@/components/calculators/income/ScheduleFCalc')),

  // Tools / Specialty
  'llpm': lazy(() => import('@/components/calculators/specialty/LlpmCalc')),
  'batch-llpm': lazy(() => import('@/components/calculators/specialty/BatchLlpmCalc')),
  'mismo': lazy(() => import('@/components/calculators/specialty/MismoCalc')),
  'fee-worksheet': lazy(() => import('@/components/calculators/specialty/FeeWorksheetCalc')),
  'cover-letter': lazy(() => import('@/components/calculators/specialty/CoverLetterCalc')),
};

export default function CalculatorPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();

  // Determine the full registry slug:
  // /calculators/income/:slug  -> "income/<slug>"
  // /calculators/:slug         -> "<slug>"
  const fullSlug = useMemo(() => {
    if (!slug) return '';
    const isIncomePath = location.pathname.includes('/calculators/income/');
    return isIncomePath ? `income/${slug}` : slug;
  }, [slug, location.pathname]);

  const calculator = useMemo(() => {
    return CALCULATORS.find((c) => c.slug === fullSlug);
  }, [fullSlug]);

  const CalcComponent = fullSlug ? COMPONENTS[fullSlug] : undefined;

  if (!calculator || !CalcComponent) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-700">Calculator Not Found</h2>
        <p className="text-gray-500 mt-2">The calculator &ldquo;{slug}&rdquo; does not exist.</p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Hub
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-brand-600 transition-colors">
          Calculators
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{calculator.name}</span>
      </div>

      {/* Calculator content */}
      <Suspense fallback={<LoadingSpinner />}>
        <CalcComponent />
      </Suspense>
    </div>
  );
}
