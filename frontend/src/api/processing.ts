import client from './client';
import type { ProcessingRecord, ProcessingSearchParams, ProcessingSearchResponse } from '@/types';

export async function searchRecords(
  type: string,
  params: ProcessingSearchParams
): Promise<ProcessingSearchResponse> {
  const response = await client.get(`/processing/${type}/search`, { params });
  return response.data.data;
}

export async function getRecord(type: string, id: string): Promise<ProcessingRecord> {
  const response = await client.get(`/processing/${type}/${id}`);
  return response.data.data;
}

export async function createRecord(type: string, data: Partial<ProcessingRecord>): Promise<ProcessingRecord> {
  const response = await client.post(`/processing/${type}`, data);
  return response.data.data;
}

export async function updateRecord(
  type: string,
  id: string,
  data: Partial<ProcessingRecord>
): Promise<ProcessingRecord> {
  const response = await client.put(`/processing/${type}/${id}`, data);
  return response.data.data;
}

export async function deleteRecord(type: string, id: string): Promise<void> {
  await client.delete(`/processing/${type}/${id}`);
}
