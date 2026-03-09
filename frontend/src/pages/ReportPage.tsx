import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getReport, deleteReport } from '@/utils/reportStorage';
import type { ReportItem } from '@/types/calculators';
import { ArrowLeft, Trash2, FileText, Clock, Copy, Check } from 'lucide-react';

function formatDate(ts: number) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ReportPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const reportId = params.get('id') || '';

  const [report, setReport] = useState<ReportItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError('');
      setReport(null);

      if (!reportId) {
        setIsLoading(false);
        setError('Missing report id.');
        return;
      }

      try {
        const item = await getReport(reportId);
        if (cancelled) return;
        if (!item) {
          setError('Report not found.');
        } else {
          setReport(item);
        }
      } catch (e) {
        if (cancelled) return;
        setError('Failed to load report.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reportId]);

  const json = useMemo(() => {
    if (!report) return '';
    try {
      return JSON.stringify(report.data ?? {}, null, 2);
    } catch {
      return String(report.data ?? '');
    }
  }, [report]);

  const onDelete = async () => {
    if (!report) return;
    if (!confirm('Delete this report?')) return;
    await deleteReport(report.id);
    navigate('/workspace');
  };

  const onCopy = async () => {
    if (!json) return;
    await navigator.clipboard.writeText(json);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Report unavailable</h2>
        <p className="text-gray-500 mt-2">{error || 'This report could not be loaded.'}</p>
        <Link
          to="/workspace"
          className="mt-4 inline-flex items-center gap-2 btn-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/workspace" className="inline-flex items-center gap-2 hover:text-brand-600">
              <ArrowLeft className="w-4 h-4" />
              Workspace
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Report</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 truncate">
            <span className="mr-2">{report.calcIcon}</span>
            {report.calcName || report.calcSlug}
          </h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDate(report.timestamp)}
            </span>
            <span className="inline-flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {report.calcSlug}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onCopy} className="btn-secondary flex items-center gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy JSON'}
          </button>
          <button onClick={onDelete} className="btn-secondary flex items-center gap-2 text-red-600">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Report Data</h2>
          <span className="text-xs text-gray-500">id: {report.id}</span>
        </div>
        <pre className="p-4 text-xs sm:text-sm overflow-auto whitespace-pre-wrap break-words">
{json}
        </pre>
      </div>
    </div>
  );
}

