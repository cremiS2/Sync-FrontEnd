import http from './http';
const DEBUG_API = Boolean(import.meta.env.VITE_DEBUG_API) || import.meta.env.DEV;
import { API_ENDPOINTS } from '../utils/constants';
import type { Page } from '../types/api';
import type { Employee, EmployeeDTO } from '../types';

export interface ListEmployeesQuery {
  employeeName?: string;
  employeeId?: number;
  shift?: string;
  sectorName?: string;
  pageNumber?: number;
  pageSize?: number;
}

export function listEmployees(query: ListEmployeesQuery = {}): Promise<{ data: Page<Employee> }> {
  const params: Record<string, unknown> = {};
  if (query.employeeName) params['employee-name'] = query.employeeName;
  if (query.employeeId !== undefined) params['employee-id'] = query.employeeId;
  if (query.shift) params['shift'] = query.shift;
  if (query.sectorName) params['sector-name'] = query.sectorName;
  if (query.pageNumber !== undefined) params['page-number'] = query.pageNumber;
  if (query.pageSize !== undefined) params['page-size'] = query.pageSize;
  if (DEBUG_API) console.log('[employees] listEmployees params:', params);
  
  return http
    .get<Page<Employee>>(API_ENDPOINTS.EMPLOYEE, { params })
    .then((res: any) => {
      if (DEBUG_API) console.log('[employees] listEmployees OK items:', res.data?.content?.length ?? 0);
      return res;
    })
    .catch((err: any) => {
      console.error('[employees] listEmployees FAIL:', { params, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function getEmployee(id: number): Promise<{ data: Employee }> {
  if (DEBUG_API) console.log('[employees] getEmployee id:', id);
  return http
    .get(`${API_ENDPOINTS.EMPLOYEE}/${id}`)
    .then((res) => {
      if (DEBUG_API) console.log('[employees] getEmployee OK id:', id);
      return res;
    })
    .catch((err) => {
      console.error('[employees] getEmployee FAIL:', { id, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function createEmployee(dto: EmployeeDTO): Promise<{ headers: any }> {
  if (DEBUG_API) console.log('[employees] createEmployee dto:', dto);
  
  return http
    .post(API_ENDPOINTS.EMPLOYEE, dto)
    .then((res: any) => {
      if (DEBUG_API) console.log('[employees] createEmployee OK location:', res.headers?.location);
      return res;
    })
    .catch((err: any) => {
      console.error('[employees] createEmployee FAIL:', { 
        dto, 
        status: err?.response?.status, 
        data: err?.response?.data,
        message: err?.response?.data?.message || err?.response?.data?.menssagem,
        validationErrors: err?.response?.data?.errors || err?.response?.data?.validationErrors,
        stack: err?.response?.data?.stack,
        fullError: err?.response?.data // ← VER TODOS OS DADOS DO ERRO
      });
      
      // Log detalhado do erro 422
      if (err?.response?.status === 422) {
        console.error('=== ERRO 422 DETALHADO ===');
        console.error('Response data:', JSON.stringify(err?.response?.data, null, 2));
        console.error('Response headers:', err?.response?.headers);
        console.error('Request config:', err?.config);
      }
      
      throw err;
    });
}

export function updateEmployee(id: number, dto: EmployeeDTO): Promise<void> {
  if (DEBUG_API) console.log('[employees] updateEmployee id/dto:', id, dto);
  
  // Log detalhado do DTO para debug




  
  // Verificar se há campos problemáticos
  Object.keys(dto).forEach(key => {
    const value = (dto as any)[key];
    if (typeof value === 'string' && value.length > 1000) {
      console.warn(`Campo ${key} muito longo:`, value.length, 'caracteres');
    }
  });
  
  return http
    .put(`${API_ENDPOINTS.EMPLOYEE}/${id}`, dto)
    .then(() => {
      if (DEBUG_API) console.log('[employees] updateEmployee OK id:', id);
    })
    .catch((err: any) => {
      console.error('[employees] updateEmployee FAIL:', { 
        id, 
        dto, 
        status: err?.response?.status, 
        data: err?.response?.data,
        message: err?.response?.data?.message || err?.response?.data?.menssagem,
        stack: err?.response?.data?.stack
      });
      throw err;
    });
}

export function deleteEmployee(id: number): Promise<void> {
  if (DEBUG_API) console.log('[employees] deleteEmployee id:', id);
  return http
    .delete(`${API_ENDPOINTS.EMPLOYEE}/${id}`)
    .then(() => {
      if (DEBUG_API) console.log('[employees] deleteEmployee OK id:', id);
    })
    .catch((err) => {
      console.error('[employees] deleteEmployee FAIL:', { id, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

/**
 * Gera relatório PDF de funcionários
 * @returns Promise com Blob do PDF
 */
export function generateEmployeeReport(): Promise<Blob> {
  if (DEBUG_API) console.log('[employees] generateEmployeeReport');
  
  return http
    .get(`${API_ENDPOINTS.EMPLOYEE}/relatorio`, {
      responseType: 'blob', // Importante para receber arquivo binário
    })
    .then((res) => {
      if (DEBUG_API) console.log('[employees] generateEmployeeReport OK');
      return res.data;
    })
    .catch((err) => {
      console.error('[employees] generateEmployeeReport FAIL:', { 
        status: err?.response?.status, 
        data: err?.response?.data 
      });
      throw err;
    });
}


