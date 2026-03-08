import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { searchRecords, deleteRecord } from '@/api/processing';
import type { ProcessingRecord } from '@/types';
import { Loader2, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';

const PROCESSING_TABS = [
  { id: 'title', label: 'Title Companies' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'voe', label: 'VOE' },
  { id: 'amc', label: 'AMC / Appraisal' },
  { id: 'payoffs', label: 'Payoffs' },
  { id: 'other', label: 'Other' },
] as const;

type TabType = (typeof PROCESSING_TABS)[number]['id'];

export default function ProcessingPage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const activeTab = (type as TabType) || 'title';

  const [records, setRecords] = useState<ProcessingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await searchRecords(activeTab, { page: 1, limit: 100 });
      setRecords(data.results || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load processing records');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await deleteRecord(activeTab, id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete record:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Processing</h1>
          <p className="text-gray-500 mt-1">Processing records and tracking</p>
        </div>
        {canEdit && (
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {PROCESSING_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(`/processing/${tab.id}`)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No processing records found for this category.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 truncate">{record.borrower}</h3>
                <p className="text-sm text-gray-500 mt-0.5 truncate">
                  {record.loanNumber} {record.vendor ? `• ${record.vendor}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  record.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : record.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {record.status}
                </span>
                {canEdit && (
                  <>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
