import http from './http';
const DEBUG_API = Boolean(import.meta.env.VITE_DEBUG_API) || import.meta.env.DEV;
import { API_ENDPOINTS } from '../utils/constants';
import type { Page } from '../types/api';
import type { Machine, MachineDTO } from '../types';

export interface ListMachinesQuery {
  machineName?: string;
  sectorName?: string;
  statusMachine?: string;
  pageNumber?: number;
  pageSize?: number;
}

export function listMachines(query: ListMachinesQuery = {}): Promise<{ data: Page<Machine> }> {
  const params: Record<string, unknown> = {};
  if (query.machineName) params['machine-name'] = query.machineName;
  if (query.sectorName) params['sector-name'] = query.sectorName;
  if (query.statusMachine) params['status-machine'] = query.statusMachine;
  if (query.pageNumber !== undefined) params['page-number'] = query.pageNumber;
  if (query.pageSize !== undefined) params['page-size'] = query.pageSize;
  if (DEBUG_API) console.log('[machines] listMachines params:', params);
  
  return http
    .get<Page<Machine>>(API_ENDPOINTS.MACHINE, { params })
    .then((res: any) => {
      if (DEBUG_API) console.log('[machines] listMachines OK items:', res.data?.content?.length ?? 0);
      return res;
    })
    .catch((err: any) => {
      console.error('[machines] listMachines FAIL:', { params, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function getMachine(id: number): Promise<{ data: Machine }> {
  if (DEBUG_API) console.log('[machines] getMachine id:', id);
  return http
    .get(`${API_ENDPOINTS.MACHINE}/${id}`)
    .then((res) => {
      if (DEBUG_API) console.log('[machines] getMachine OK id:', id);
      return res;
    })
    .catch((err) => {
      console.error('[machines] getMachine FAIL:', { id, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function createMachine(dto: MachineDTO): Promise<{ headers: any }> {
  if (DEBUG_API) console.log('[machines] createMachine dto:', dto);
  
  return http
    .post(API_ENDPOINTS.MACHINE, dto)
    .then((res: any) => {
      if (DEBUG_API) console.log('[machines] createMachine OK location:', res.headers?.location);
      return res;
    })
    .catch((err: any) => {
      console.error('[machines] createMachine FAIL:', { dto, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function updateMachine(id: number, dto: MachineDTO): Promise<void> {
  if (DEBUG_API) console.log('[machines] updateMachine id/dto:', id, dto);
  
  return http
    .put(`${API_ENDPOINTS.MACHINE}/${id}`, dto)
    .then(() => {
      if (DEBUG_API) console.log('[machines] updateMachine OK id:', id);
    })
    .catch((err: any) => {
      console.error('[machines] updateMachine FAIL:', { id, dto, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function deleteMachine(id: number): Promise<void> {
  if (DEBUG_API) console.log('[machines] deleteMachine id:', id);
  
  return http
    .delete(`${API_ENDPOINTS.MACHINE}/${id}`)
    .then(() => {
      if (DEBUG_API) console.log('[machines] deleteMachine OK id:', id);
    })
    .catch((err: any) => {
      console.error('[machines] deleteMachine FAIL:', { id, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

/**
 * Gera relatório PDF de máquinas
 * @returns Promise com Blob do PDF
 */
export function generateMachineReport(): Promise<Blob> {
  if (DEBUG_API) console.log('[machines] generateMachineReport');
  
  return http
    .get(`${API_ENDPOINTS.MACHINE}/relatorio`, {
      responseType: 'blob', // Importante para receber arquivo binário
    })
    .then((res: any) => {
      if (DEBUG_API) console.log('[machines] generateMachineReport OK');
      return res.data;
    })
    .catch((err: any) => {
      console.error('[machines] generateMachineReport FAIL:', { 
        status: err?.response?.status, 
        data: err?.response?.data 
      });
      throw err;
    });
}
