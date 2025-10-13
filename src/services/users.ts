import http from './http';
import { API_ENDPOINTS } from '../utils/constants';
import type { Page } from '../types/api';

export interface ListUsersQuery {
  pageNumber?: number;
  pageSize?: number;
}

export function listUsers(query: ListUsersQuery = {}): Promise<{ data: Page<unknown> }> {
  const params: Record<string, unknown> = {};
  if (query.pageNumber !== undefined) params['page-number'] = query.pageNumber;
  if (query.pageSize !== undefined) params['page-size'] = query.pageSize;
  return http.get<Page<unknown>>(API_ENDPOINTS.USER, { params });
}

export function getUser(id: number): Promise<{ data: unknown }> {
  return http.get(`${API_ENDPOINTS.USER}/${id}`);
}

export function updateUser(id: number, dto: unknown): Promise<void> {
  return http.put(`${API_ENDPOINTS.USER}/${id}`, dto).then(() => {});
}

export function deleteUser(id: number): Promise<void> {
  return http.delete(`${API_ENDPOINTS.USER}/${id}`).then(() => {});
}


