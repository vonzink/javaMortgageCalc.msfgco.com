import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getReports, deleteReport } from '@/utils/reportStorage';
import type { ReportItem } from '@/types/calculators';
import { formatCurrency } from '@/utils/formatters';
import { FileText, Trash2, Clock, Calculator } from 'lucide-react';

export default function WorkspacePage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReports = useCallback(async () => {
    try {
      const all = await getReports();
      // Already sorted by timestamp descending in getReports
      setReports(all);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Workspace</h1>
        <p className="text-gray-500 mt-1">
          Your saved calculator reports. Reports are stored locally on this device.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No saved reports</h3>
          <p className="text-gray-500 mt-1">
            Run a calculator and save the results to see them here.
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-2 btn-primary"
          >
            <Calculator className="w-4 h-4" />
            Go to Calculators
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 truncate">
                    <span className="mr-2">{report.calcIcon}</span>
                    {report.calcName || report.calcSlug}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Calculator className="w-3.5 h-3.5" />
                      {report.calcSlug}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(report.timestamp)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/report?id=${report.id}`}
                    className="btn-secondary text-sm px-3 py-1.5"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
