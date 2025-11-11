import http from './http';
const DEBUG_API = Boolean(import.meta.env.VITE_DEBUG_API) || import.meta.env.DEV;
import { API_ENDPOINTS } from '../utils/constants';
import type { Page } from '../types/api';
import type { MachineModel, MachineModelDTO } from '../types';

export interface ListMachineModelsQuery {
  numeroPagina?: number;
  tamanhoPagina?: number;
}

export function listMachineModels(query: ListMachineModelsQuery = {}): Promise<{ data: Page<MachineModel> }> {
  const params: Record<string, unknown> = {};
  if (query.numeroPagina !== undefined) params['numero-pagina'] = query.numeroPagina;
  if (query.tamanhoPagina !== undefined) params['tamanho-pagina'] = query.tamanhoPagina;
  
  if (DEBUG_API) console.log('[machineModels] listMachineModels params:', params);
  
  return http
    .get<Page<MachineModel>>(API_ENDPOINTS.MACHINE_MODEL, { params })
    .then((res) => {
      if (DEBUG_API) console.log('[machineModels] listMachineModels OK items:', res.data?.content?.length ?? 0);
      return res;
    })
    .catch((err) => {
      console.error('[machineModels] listMachineModels FAIL:', { params, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function getMachineModel(id: number): Promise<{ data: MachineModel }> {
  if (DEBUG_API) console.log('[machineModels] getMachineModel id:', id);
  
  return http
    .get(`${API_ENDPOINTS.MACHINE_MODEL}/${id}`)
    .then((res) => {
      if (DEBUG_API) console.log('[machineModels] getMachineModel OK id:', id);
      return res;
    })
    .catch((err) => {
      console.error('[machineModels] getMachineModel FAIL:', { id, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function createMachineModel(dto: MachineModelDTO): Promise<{ headers: any }> {
  if (DEBUG_API) console.log('[machineModels] createMachineModel dto:', dto);
  
  return http
    .post(API_ENDPOINTS.MACHINE_MODEL, dto)
    .then((res) => {
      if (DEBUG_API) console.log('[machineModels] createMachineModel OK location:', res.headers?.location);
      return res;
    })
    .catch((err) => {
      console.error('[machineModels] createMachineModel FAIL:', { dto, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function updateMachineModel(id: number, dto: MachineModelDTO): Promise<void> {
  if (DEBUG_API) console.log('[machineModels] updateMachineModel id/dto:', id, dto);
  
  return http
    .put(`${API_ENDPOINTS.MACHINE_MODEL}/${id}`, dto)
    .then(() => {
      if (DEBUG_API) console.log('[machineModels] updateMachineModel OK id:', id);
    })
    .catch((err) => {
      console.error('[machineModels] updateMachineModel FAIL:', { id, dto, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function deleteMachineModel(id: number): Promise<void> {
  if (DEBUG_API) console.log('[machineModels] deleteMachineModel id:', id);
  
  return http
    .delete(`${API_ENDPOINTS.MACHINE_MODEL}/${id}`)
    .then(() => {
      if (DEBUG_API) console.log('[machineModels] deleteMachineModel OK id:', id);
    })
    .catch((err) => {
      console.error('[machineModels] deleteMachineModel FAIL:', { id, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}


