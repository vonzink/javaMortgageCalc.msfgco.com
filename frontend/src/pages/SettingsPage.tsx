import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSettings, updateSettings } from '@/api/settings';
import type { SiteConfig } from '@/types';
import { Loader2, Save, Settings } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  const [settings, setSettings] = useState<SiteConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = user?.role === 'admin';

  const loadSettings = useCallback(async () => {
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateSettings(settings);
      setSuccess('Settings saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (key: keyof SiteConfig, value: string | number | boolean) => {
    setSettings((prev: SiteConfig | null) => (prev ? { ...prev, [key]: value } : null));
    setSuccess('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
        <p className="text-gray-500 mt-2">Only administrators can access settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Configure calculator defaults and system settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {success}
        </div>
      )}

      {settings && (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Site Configuration</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName || ''}
                  onChange={(e) => updateField('siteName', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Company Name</label>
                <input
                  type="text"
                  value={settings.companyName || ''}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">NMLS #</label>
                <input
                  type="text"
                  value={settings.nmls || ''}
                  onChange={(e) => updateField('nmls', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Logo URL</label>
                <input
                  type="text"
                  value={settings.logoUrl || ''}
                  onChange={(e) => updateField('logoUrl', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">AI Configuration</h2>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="aiEnabled"
                checked={settings.aiEnabled || false}
                onChange={(e) => updateField('aiEnabled', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="aiEnabled" className="text-sm font-medium text-gray-700">
                Enable AI Features
              </label>
            </div>
            <div>
              <label className="label">AI Provider</label>
              <input
                type="text"
                value={settings.aiProvider || ''}
                onChange={(e) => updateField('aiProvider', e.target.value)}
                placeholder="e.g. openai"
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
