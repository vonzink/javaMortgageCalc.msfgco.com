import { useNavigate } from 'react-router-dom';

export const PROCESSING_TABS = [
  { id: 'title', label: 'Title Companies' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'voe', label: 'VOE' },
  { id: 'amc', label: 'AMC / Appraisal' },
  { id: 'payoffs', label: 'Payoffs' },
  { id: 'other', label: 'Other' },
] as const;

export type ProcessingTabType = (typeof PROCESSING_TABS)[number]['id'];

interface ProcessingTabsProps {
  activeTab: string;
  className?: string;
}

export default function ProcessingTabs({
  activeTab,
  className = '',
}: ProcessingTabsProps) {
  const navigate = useNavigate();

  return (
    <div className={`border-b border-gray-200 ${className}`}>
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
  );
}
