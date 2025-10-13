import http from './http';
import { API_ENDPOINTS } from '../utils/constants';
import type { Page } from '../types/api';

export interface ListMachineModelsQuery {
  numeroPagina?: number;
  tamanhoPagina?: number;
}

export function listMachineModels(query: ListMachineModelsQuery = {}): Promise<{ data: Page<unknown> }> {
  const params: Record<string, unknown> = {};
  if (query.numeroPagina !== undefined) params['numero-pagina'] = query.numeroPagina;
  if (query.tamanhoPagina !== undefined) params['tamanho-pagina'] = query.tamanhoPagina;
  return http.get<Page<unknown>>(API_ENDPOINTS.MACHINE_MODEL, { params });
}

export function getMachineModel(id: number): Promise<{ data: unknown }> {
  return http.get(`${API_ENDPOINTS.MACHINE_MODEL}/${id}`);
}

export function createMachineModel(dto: unknown): Promise<{ headers: any }> {
  return http.post(API_ENDPOINTS.MACHINE_MODEL, dto);
}

export function updateMachineModel(id: number, dto: unknown): Promise<void> {
  return http.put(`${API_ENDPOINTS.MACHINE_MODEL}/${id}`, dto).then(() => {});
}

export function deleteMachineModel(id: number): Promise<void> {
  return http.delete(`${API_ENDPOINTS.MACHINE_MODEL}/${id}`).then(() => {});
}


