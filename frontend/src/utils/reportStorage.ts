import type { ReportItem } from '@/types/calculators';

const SESSION_KEY = 'msfg-calculator-reports';

function readAll(): ReportItem[] {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as ReportItem[];
  } catch {
    // Corrupt session payload; reset to avoid breaking the app.
    sessionStorage.removeItem(SESSION_KEY);
    return [];
  }
}

function writeAll(items: ReportItem[]) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(items));
}

export async function saveReport(item: ReportItem): Promise<void> {
  const items = readAll();
  const next = [item, ...items.filter((x) => x.id !== item.id)];
  writeAll(next);
}

export async function getReports(): Promise<ReportItem[]> {
  return readAll().sort((a, b) => b.timestamp - a.timestamp);
}

export async function getReport(id: string): Promise<ReportItem | undefined> {
  return readAll().find((x) => x.id === id);
}

export async function deleteReport(id: string): Promise<void> {
  const items = readAll().filter((x) => x.id !== id);
  writeAll(items);
}

export async function clearReports(): Promise<void> {
  sessionStorage.removeItem(SESSION_KEY);
}
