import http from './http';
const DEBUG_API = Boolean(import.meta.env.VITE_DEBUG_API) || import.meta.env.DEV;
import { API_ENDPOINTS } from '../utils/constants';
import type { Page } from '../types/api';
import type { Sector } from '../types';

export interface SectorDTO {
  name: string;
  department: number; // Campo obrigatório (Long)
  maximumQuantEmployee: number; // Campo obrigatório (Integer)
  efficiency: number;
  description: string; // Campo obrigatório
}

export interface ListSectorsQuery {
  departmentName?: string;
  sectorName?: string;
  pageSize?: number;
  pageNumber?: number;
}

export function listSectors(query: ListSectorsQuery = {}): Promise<{ data: Page<Sector> }> {
  console.log('=== DEBUG LISTAGEM SETORES ===');
  console.log('Endpoint:', API_ENDPOINTS.SECTOR);
  console.log('Query recebida:', query);
  
  // Primeiro tentar sem parâmetros para testar o endpoint básico
  if (!query.pageSize && !query.pageNumber && !query.departmentName && !query.sectorName) {
    console.log('Fazendo chamada SEM parâmetros para testar endpoint básico');
    return http
      .get<Page<Sector>>(API_ENDPOINTS.SECTOR)
      .then((res) => {
        console.log('=== SUCESSO SEM PARÂMETROS ===');
        console.log('Resposta:', res.data);
        if (DEBUG_API) console.log('[sectors] listSectors OK items:', res.data?.content?.length ?? 0);
        return res;
      })
      .catch((err) => {
        console.error('=== ERRO SEM PARÂMETROS ===');
        console.error('Status:', err?.response?.status);
        console.error('Data:', err?.response?.data);
        console.error('[sectors] listSectors FAIL:', { status: err?.response?.status, data: err?.response?.data });
        throw err;
      });
  }
  
  // Se tem parâmetros, usar formato tradicional
  const params: Record<string, unknown> = {};
  
  if (query.pageSize !== undefined) params['page-size'] = query.pageSize;
  if (query.pageNumber !== undefined) params['page-number'] = query.pageNumber;
  if (query.departmentName) params['department-name'] = query.departmentName;
  if (query.sectorName) params['sector-name'] = query.sectorName;
  
  console.log('Parâmetros enviados:', params);
  
  if (DEBUG_API) console.log('[sectors] listSectors params:', params);
  return http
    .get<Page<Sector>>(API_ENDPOINTS.SECTOR, { params })
    .then((res) => {
      if (DEBUG_API) console.log('[sectors] listSectors OK items:', res.data?.content?.length ?? 0);
      return res;
    })
    .catch((err) => {
      console.error('[sectors] listSectors FAIL:', { params, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function getSector(id: number): Promise<{ data: Sector }> {
  if (DEBUG_API) console.log('[sectors] getSector id:', id);
  return http
    .get(`${API_ENDPOINTS.SECTOR}/${id}`)
    .then((res) => {
      if (DEBUG_API) console.log('[sectors] getSector OK id:', id);
      return res;
    })
    .catch((err) => {
      console.error('[sectors] getSector FAIL:', { id, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function createSector(dto: SectorDTO): Promise<{ headers: any }> {
  if (DEBUG_API) console.log('[sectors] createSector dto:', dto);
  
  console.log('=== DEBUG SETOR ===');
  console.log('Endpoint:', API_ENDPOINTS.SECTOR);
  console.log('DTO enviado:', JSON.stringify(dto, null, 2));
  
  return http
    .post(API_ENDPOINTS.SECTOR, dto)
    .then((res) => {
      if (DEBUG_API) console.log('[sectors] createSector OK location:', res.headers?.location);
      return res;
    })
    .catch((err) => {
      console.error('[sectors] createSector FAIL:', { 
        dto, 
        status: err?.response?.status, 
        data: err?.response?.data,
        message: err?.response?.data?.message || err?.response?.data?.menssagem,
        validationErrors: err?.response?.data?.validationErrors,
        fullError: err
      });
      throw err;
    });
}

export function updateSector(id: number, dto: Partial<SectorDTO>): Promise<void> {
  if (DEBUG_API) console.log('[sectors] updateSector id/dto:', id, dto);
  return http
    .put(`${API_ENDPOINTS.SECTOR}/${id}`, dto)
    .then(() => {
      if (DEBUG_API) console.log('[sectors] updateSector OK id:', id);
    })
    .catch((err) => {
      console.error('[sectors] updateSector FAIL:', { id, dto, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function deleteSector(id: number): Promise<void> {
  console.log('=== DEBUG DELETE SETOR ===');
  console.log('ID do setor:', id);
  console.log('Endpoint:', `${API_ENDPOINTS.SECTOR}/${id}`);
  
  if (DEBUG_API) console.log('[sectors] deleteSector id:', id);
  return http
    .delete(`${API_ENDPOINTS.SECTOR}/${id}`)
    .then(() => {
      console.log('=== DELETE SETOR SUCESSO ===');
      if (DEBUG_API) console.log('[sectors] deleteSector OK id:', id);
    })
    .catch((err) => {
      console.error('=== DELETE SETOR ERRO ===');
      console.error('Status:', err?.response?.status);
      console.error('Data:', err?.response?.data);
      console.error('Message:', err?.response?.data?.message || err?.response?.data?.menssagem);
      console.error('Full error:', err);
      console.error('[sectors] deleteSector FAIL:', { id, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}


