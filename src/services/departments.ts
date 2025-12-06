import http from './http';
const DEBUG_API = Boolean(import.meta.env.VITE_DEBUG_API) || import.meta.env.DEV;
import { API_ENDPOINTS } from '../utils/constants';
import type { Page } from '../types/api';
import type { Department } from '../types';

export interface DepartmentDTO {
  name: string;
  description: string;
  location: string;
  budget: number;
  status: string;
}

export interface ListDepartmentsQuery {
  departmentName?: string;
  statusDepartment?: string;
  departmentBudget?: number;
  pageSize?: number;
  pageNumber?: number;
}

export function listDepartments(query: ListDepartmentsQuery = {}): Promise<{ data: Page<Department> }> {
  const params: Record<string, unknown> = {};
  if (query.departmentName) params['department-name'] = query.departmentName;
  if (query.statusDepartment) params['status-department'] = query.statusDepartment;
  if (query.departmentBudget !== undefined) params['department-budget'] = query.departmentBudget;
  if (query.pageSize !== undefined) params['page-size'] = query.pageSize;
  if (query.pageNumber !== undefined) params['page-number'] = query.pageNumber;
  if (DEBUG_API) console.log('[departments] listDepartments params:', params);
  return http
    .get<Page<Department>>(API_ENDPOINTS.DEPARTMENT, { params })
    .then((res) => {
      if (DEBUG_API) console.log('[departments] listDepartments OK items:', res.data?.content?.length ?? 0);
      return res;
    })
    .catch((err) => {
      console.error('[departments] listDepartments FAIL:', { params, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function getDepartment(id: number): Promise<{ data: Department }> {
  if (DEBUG_API) console.log('[departments] getDepartment id:', id);
  return http
    .get(`${API_ENDPOINTS.DEPARTMENT}/${id}`)
    .then((res) => {
      if (DEBUG_API) console.log('[departments] getDepartment OK id:', id);
      return res;
    })
    .catch((err) => {
      console.error('[departments] getDepartment FAIL:', { id, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function createDepartment(dto: DepartmentDTO): Promise<{ headers: any }> {
  if (DEBUG_API) console.log('[departments] createDepartment dto:', dto);
  return http
    .post(API_ENDPOINTS.DEPARTMENT, dto)
    .then((res) => {
      if (DEBUG_API) console.log('[departments] createDepartment OK location:', res.headers?.location);
      return res;
    })
    .catch((err) => {
      console.error('[departments] createDepartment FAIL:', { dto, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function updateDepartment(id: number, dto: Partial<DepartmentDTO>): Promise<void> {
  if (DEBUG_API) console.log('[departments] updateDepartment id/dto:', id, dto);
  return http
    .put(`${API_ENDPOINTS.DEPARTMENT}/${id}`, dto)
    .then(() => {
      if (DEBUG_API) console.log('[departments] updateDepartment OK id:', id);
    })
    .catch((err) => {
      console.error('[departments] updateDepartment FAIL:', { id, dto, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function deleteDepartment(id: number): Promise<void> {
  if (DEBUG_API) console.log('[departments] deleteDepartment id:', id);
  return http
    .delete(`${API_ENDPOINTS.DEPARTMENT}/${id}`)
    .then(() => {
      if (DEBUG_API) console.log('[departments] deleteDepartment OK id:', id);
    })
    .catch((err) => {
      console.error('[departments] deleteDepartment FAIL:', { id, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}


