import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getReports } from '@/utils/reportStorage';
import type { ReportItem } from '@/types/calculators';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { CALCULATORS } from '@/utils/calculatorRegistry';
import { ArrowLeft, Printer, Loader2 } from 'lucide-react';

export default function ReportPage() {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('id');

  const [report, setReport] = useState<ReportItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!reportId) {
        setError('No report ID provided');
        setIsLoading(false);
        return;
      }
      try {
        const allReports = await getReports();
        const found = allReports.find((r) => r.id === reportId);
        if (!found) {
          setError('Report not found');
        } else {
          setReport(found);
        }
      } catch (err) {
        setError('Failed to load report');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [reportId]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-700">{error || 'Report not found'}</h2>
        <Link to="/workspace" className="mt-4 inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </Link>
      </div>
    );
  }

  const calcDef = CALCULATORS.find((c) => c.slug === report.calcSlug);
  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:space-y-4">
      {/* Header - hidden in print */}
      <div className="flex items-center justify-between print:hidden">
        <Link to="/workspace" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </Link>
        <button onClick={handlePrint} className="btn-secondary flex items-center gap-2 text-sm">
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>

      {/* Report */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 print:border-0 print:shadow-none print:p-0">
        {/* Report header */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {report.calcName || calcDef?.name || report.calcSlug}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Generated {formatDate(report.timestamp)}
          </p>
        </div>

        {/* Data */}
        {report.data && Object.keys(report.data).length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Results</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Metric</th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.data).map(([key, val]) => (
                    <tr key={key} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-gray-700">{key}</td>
                      <td className="py-2 px-3 text-right font-mono text-gray-900 font-medium">
                        {typeof val === 'number'
                          ? key.toLowerCase().includes('rate') || key.toLowerCase().includes('apr')
                            ? formatPercent(val)
                            : formatCurrency(val)
                          : String(val)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
