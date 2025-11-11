import http from './http';
const DEBUG_API = Boolean(import.meta.env.VITE_DEBUG_API) || import.meta.env.DEV;
import { API_ENDPOINTS } from '../utils/constants';
import type { Page } from '../types/api';

export interface ListAllocationsQuery {
  pageSize?: number;
  pageNumber?: number;
  nameEmployee?: string;
  nameEmployeeChanged?: string;
}

export function listAllocations(query: ListAllocationsQuery = {}): Promise<{ data: Page<unknown> }> {
  const params: Record<string, unknown> = {};
  if (query.pageSize !== undefined) params['page-size'] = query.pageSize;
  if (query.pageNumber !== undefined) params['page-number'] = query.pageNumber;
  if (query.nameEmployee) params['name-employee'] = query.nameEmployee;
  if (query.nameEmployeeChanged) params['name-employee-changed'] = query.nameEmployeeChanged;
  if (DEBUG_API) console.log('[allocations] listAllocations params:', params);
  return http
    .get<Page<unknown>>(API_ENDPOINTS.ALLOCATED_EMPLOYEE_MACHINE, { params })
    .then((res) => {
      if (DEBUG_API) console.log('[allocations] listAllocations OK items:', res.data?.content?.length ?? 0);
      return res;
    })
    .catch((err) => {
      console.error('[allocations] listAllocations FAIL:', { params, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function createAllocation(dto: unknown): Promise<{ headers: any }> {
  if (DEBUG_API) console.log('[allocations] createAllocation dto:', dto);
  return http
    .post(API_ENDPOINTS.ALLOCATED_EMPLOYEE_MACHINE, dto)
    .then((res) => {
      if (DEBUG_API) console.log('[allocations] createAllocation OK location:', res.headers?.location);
      return res;
    })
    .catch((err) => {
      console.error('[allocations] createAllocation FAIL:', { dto, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function updateAllocation(id: number, dto: unknown): Promise<void> {
  if (DEBUG_API) console.log('[allocations] updateAllocation id/dto:', id, dto);
  return http
    .put(`${API_ENDPOINTS.ALLOCATED_EMPLOYEE_MACHINE}/${id}`, dto)
    .then(() => {
      if (DEBUG_API) console.log('[allocations] updateAllocation OK id:', id);
    })
    .catch((err) => {
      console.error('[allocations] updateAllocation FAIL:', { id, dto, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function deleteAllocation(id: number): Promise<void> {
  if (DEBUG_API) console.log('[allocations] deleteAllocation id:', id);
  return http
    .delete(`${API_ENDPOINTS.ALLOCATED_EMPLOYEE_MACHINE}/${id}`)
    .then(() => {
      if (DEBUG_API) console.log('[allocations] deleteAllocation OK id:', id);
    })
    .catch((err) => {
      console.error('[allocations] deleteAllocation FAIL:', { id, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

