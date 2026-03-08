import { useState, useEffect, useCallback } from 'react';
import { saveReport, getReports, deleteReport, clearReports } from '@/utils/reportStorage';
import type { ReportItem } from '@/types/calculators';

export function useCalculatorReport() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReports = useCallback(async () => {
    try {
      const items = await getReports();
      setReports(items);
    } catch {
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const addReport = useCallback(
    async (item: ReportItem) => {
      await saveReport(item);
      await loadReports();
    },
    [loadReports]
  );

  const removeReport = useCallback(
    async (id: string) => {
      await deleteReport(id);
      await loadReports();
    },
    [loadReports]
  );

  const clearAllReports = useCallback(async () => {
    await clearReports();
    setReports([]);
  }, []);

  return {
    reports,
    isLoading,
    addReport,
    removeReport,
    clearAllReports,
    refreshReports: loadReports,
  };
}
