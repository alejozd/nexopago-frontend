import { axiosClient } from '../api/axiosClient';
import type { Dashboard } from '../types/dashboard.types';

export async function getDashboard(): Promise<Dashboard> {
  const response = await axiosClient.get<Dashboard>('/dashboard');
  return response.data;
}
