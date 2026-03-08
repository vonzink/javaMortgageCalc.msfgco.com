import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingFormData {
  name: string;
  description: string;
  url: string;
  email: string;
  phone: string;
  fax: string;
  agentName: string;
  agentEmail: string;
}

interface ProcessingFormProps {
  initialData?: Partial<ProcessingFormData>;
  onSubmit: (data: ProcessingFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  /** Which tab this form is for - controls which extra fields to show */
  tabType?: string;
}

const EMPTY_FORM: ProcessingFormData = {
  name: '',
  description: '',
  url: '',
  email: '',
  phone: '',
  fax: '',
  agentName: '',
  agentEmail: '',
};

export default function ProcessingForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  tabType = 'title',
}: ProcessingFormProps) {
  const [formData, setFormData] = useState<ProcessingFormData>({
    ...EMPTY_FORM,
    ...initialData,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const showContactFields = ['insurance', 'voe', 'amc', 'payoffs'].includes(tabType);
  const showAgentFields = tabType === 'insurance';

  const updateField = (key: keyof ProcessingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="label">Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          className="input-field"
          placeholder="Company or resource name"
          required
        />
      </div>

      <div>
        <label className="label">Description</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          className="input-field"
          placeholder="Brief description"
        />
      </div>

      <div>
        <label className="label">URL</label>
        <input
          type="url"
          value={formData.url}
          onChange={(e) => updateField('url', e.target.value)}
          className="input-field"
          placeholder="https://example.com"
        />
      </div>

      {showContactFields && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="input-field"
                placeholder="contact@example.com"
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="input-field"
                placeholder="(555) 555-5555"
              />
            </div>
          </div>

          <div>
            <label className="label">Fax</label>
            <input
              type="tel"
              value={formData.fax}
              onChange={(e) => updateField('fax', e.target.value)}
              className="input-field"
              placeholder="(555) 555-5555"
            />
          </div>
        </>
      )}

      {showAgentFields && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Agent Name</label>
            <input
              type="text"
              value={formData.agentName}
              onChange={(e) => updateField('agentName', e.target.value)}
              className="input-field"
              placeholder="Agent name"
            />
          </div>
          <div>
            <label className="label">Agent Email</label>
            <input
              type="email"
              value={formData.agentEmail}
              onChange={(e) => updateField('agentEmail', e.target.value)}
              className="input-field"
              placeholder="agent@example.com"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary flex items-center gap-2"
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEditing ? 'Update' : 'Add'} Link
        </button>
      </div>
    </form>
  );
}
