import client from './client';
import type { SiteConfig } from '@/types';

export async function getSettings(): Promise<SiteConfig> {
  const response = await client.get('/settings');
  return response.data.data;
}

export async function updateSettings(data: Partial<SiteConfig>): Promise<SiteConfig> {
  const response = await client.put('/settings', data);
  return response.data.data;
}
