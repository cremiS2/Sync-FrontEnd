import http from './http';
const DEBUG_API = Boolean(import.meta.env.VITE_DEBUG_API) || import.meta.env.DEV;
import { API_ENDPOINTS } from '../utils/constants';
import type { Page } from '../types/api';
import type { Stock, StockDTO } from '../types';

export interface ListStockQuery {
  pageNumber?: number;
  pageSize?: number;
}

/**
 * Lista itens de estoque com paginação
 * @param query - Parâmetros de paginação
 * @returns Promise com página de itens de estoque
 */
export function listStock(query: ListStockQuery = {}): Promise<{ data: Page<Stock> }> {
  const params: Record<string, unknown> = {};
  // Backend usa page-number (default: 1) e page-size (default: 10)
  if (query.pageNumber !== undefined) params['page-number'] = query.pageNumber;
  if (query.pageSize !== undefined) params['page-size'] = query.pageSize;
  
  if (DEBUG_API) console.log('[stock] listStock params:', params);
  
  return http
    .get<Page<Stock>>(API_ENDPOINTS.STOCK, { params })
    .then((res) => {
      if (DEBUG_API) console.log('[stock] listStock OK items:', res.data?.content?.length ?? 0);
      return res;
    })
    .catch((err) => {
      console.error('[stock] listStock FAIL:', { 
        params, 
        status: err?.response?.status, 
        data: err?.response?.data 
      });
      throw err;
    });
}

/**
 * Busca um item de estoque por ID
 * @param id - ID do item de estoque
 * @returns Promise com dados do item
 */
export function getStock(id: number): Promise<{ data: Stock }> {
  if (DEBUG_API) console.log('[stock] getStock id:', id);
  
  return http
    .get(`${API_ENDPOINTS.STOCK}/${id}`)
    .then((res) => {
      if (DEBUG_API) console.log('[stock] getStock OK id:', id);
      return res;
    })
    .catch((err) => {
      console.error('[stock] getStock FAIL:', { 
        id, 
        status: err?.response?.status, 
        data: err?.response?.data 
      });
      throw err;
    });
}

/**
 * Cria um novo item de estoque
 * @param dto - Dados do item a ser criado
 * @returns Promise com headers da resposta (contém location do recurso criado)
 */
export function createStock(dto: StockDTO): Promise<{ headers: any }> {
  if (DEBUG_API) console.log('[stock] createStock dto:', dto);
  
  console.log('=== CREATE STOCK DEBUG ===');
  console.log('DTO completo:', JSON.stringify(dto, null, 2));
  
  return http
    .post(API_ENDPOINTS.STOCK, dto)
    .then((res) => {
      if (DEBUG_API) console.log('[stock] createStock OK location:', res.headers?.location);
      return res;
    })
    .catch((err) => {
      console.error('[stock] createStock FAIL:', { 
        dto, 
        status: err?.response?.status, 
        data: err?.response?.data,
        message: err?.response?.data?.message || err?.response?.data?.menssagem,
        validationErrors: err?.response?.data?.errors || err?.response?.data?.validationErrors
      });
      
      if (err?.response?.status === 400 || err?.response?.status === 422) {
        console.error('=== ERRO DE VALIDAÇÃO ===');
        console.error('Response data:', JSON.stringify(err?.response?.data, null, 2));
      }
      
      throw err;
    });
}

/**
 * Atualiza um item de estoque existente
 * @param id - ID do item a ser atualizado
 * @param dto - Dados atualizados
 * @returns Promise void
 */
export function updateStock(id: number, dto: StockDTO): Promise<void> {
  if (DEBUG_API) console.log('[stock] updateStock id/dto:', id, dto);
  
  console.log('=== UPDATE STOCK DEBUG ===');
  console.log('ID:', id);
  console.log('DTO completo:', JSON.stringify(dto, null, 2));
  
  return http
    .put(`${API_ENDPOINTS.STOCK}/${id}`, dto)
    .then(() => {
      if (DEBUG_API) console.log('[stock] updateStock OK id:', id);
    })
    .catch((err) => {
      console.error('[stock] updateStock FAIL:', { 
        id, 
        dto, 
        status: err?.response?.status, 
        data: err?.response?.data,
        message: err?.response?.data?.message || err?.response?.data?.menssagem
      });
      throw err;
    });
}

/**
 * Deleta um item de estoque
 * @param id - ID do item a ser deletado
 * @returns Promise void
 */
export function deleteStock(id: number): Promise<void> {
  console.log('=== DELETE STOCK DEBUG ===');
  console.log('ID do item:', id);
  console.log('Endpoint:', `${API_ENDPOINTS.STOCK}/${id}`);
  
  if (DEBUG_API) console.log('[stock] deleteStock id:', id);
  
  return http
    .delete(`${API_ENDPOINTS.STOCK}/${id}`)
    .then(() => {
      console.log('=== DELETE STOCK SUCESSO ===');
      if (DEBUG_API) console.log('[stock] deleteStock OK id:', id);
    })
    .catch((err) => {
      console.error('=== DELETE STOCK ERRO ===');
      console.error('Status:', err?.response?.status);
      console.error('Data:', err?.response?.data);
      console.error('Message:', err?.response?.data?.message || err?.response?.data?.menssagem);
      console.error('[stock] deleteStock FAIL:', { 
        id, 
        status: err?.response?.status, 
        data: err?.response?.data 
      });
      throw err;
    });
}