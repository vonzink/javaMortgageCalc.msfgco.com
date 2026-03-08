import { openDB, type IDBPDatabase } from 'idb';
import type { ReportItem } from '@/types/calculators';

const DB_NAME = 'msfg-calculator-reports';
const DB_VERSION = 1;
const STORE_NAME = 'items';

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

export async function saveReport(item: ReportItem): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, item);
}

export async function getReports(): Promise<ReportItem[]> {
  const db = await getDB();
  const items = await db.getAll(STORE_NAME);
  // Sort by timestamp descending (newest first)
  return (items as ReportItem[]).sort((a, b) => b.timestamp - a.timestamp);
}

export async function deleteReport(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function clearReports(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
}
