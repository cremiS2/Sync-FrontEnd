import http from './http';
const DEBUG_API = Boolean(import.meta.env.VITE_DEBUG_API) || import.meta.env.DEV;
import { API_ENDPOINTS } from '../utils/constants';
import type { Page } from '../types/api';
import type { User, UserDTO } from '../types';

export interface ListUsersQuery {
  pageNumber?: number;
  pageSize?: number;
}

export function listUsers(query: ListUsersQuery = {}): Promise<{ data: Page<User> }> {
  const params: Record<string, unknown> = {};
  if (query.pageNumber !== undefined) params['page-number'] = query.pageNumber;
  if (query.pageSize !== undefined) params['page-size'] = query.pageSize;
  
  if (DEBUG_API) console.log('[users] listUsers params:', params);
  
  return http
    .get<Page<User>>(API_ENDPOINTS.USER, { params })
    .then((res) => {
      if (DEBUG_API) console.log('[users] listUsers OK items:', res.data?.content?.length ?? 0);
      return res;
    })
    .catch((err) => {
      console.error('[users] listUsers FAIL:', { params, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function getUser(id: number): Promise<{ data: User }> {
  if (DEBUG_API) console.log('[users] getUser id:', id);
  
  return http
    .get(`${API_ENDPOINTS.USER}/${id}`)
    .then((res) => {
      if (DEBUG_API) console.log('[users] getUser OK id:', id);
      return res;
    })
    .catch((err) => {
      console.error('[users] getUser FAIL:', { id, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function updateUser(id: number, dto: Partial<UserDTO>): Promise<void> {
  if (DEBUG_API) console.log('[users] updateUser id/dto:', id, dto);
  
  return http
    .put(`${API_ENDPOINTS.USER}/${id}`, dto)
    .then(() => {
      if (DEBUG_API) console.log('[users] updateUser OK id:', id);
    })
    .catch((err) => {
      console.error('[users] updateUser FAIL:', { id, dto, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}

export function deleteUser(id: number): Promise<void> {
  if (DEBUG_API) console.log('[users] deleteUser id:', id);
  
  return http
    .delete(`${API_ENDPOINTS.USER}/${id}`)
    .then(() => {
      if (DEBUG_API) console.log('[users] deleteUser OK id:', id);
    })
    .catch((err) => {
      console.error('[users] deleteUser FAIL:', { id, status: err?.response?.status, data: err?.response?.data });
      throw err;
    });
}


