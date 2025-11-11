import http from './http';
const DEBUG_API = Boolean(import.meta.env.VITE_DEBUG_API) || import.meta.env.DEV;

/**
 * Gera relatório geral (funcionários + máquinas) em PDF
 */
export async function generateGeneralReport(): Promise<Blob> {
  if (DEBUG_API) console.log('[reports] generateGeneralReport');
  
  return http
    .get('/relatorios/geral', {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    })
    .then((res) => {
      if (DEBUG_API) console.log('[reports] generateGeneralReport OK');
      return res.data;
    })
    .catch((err) => {
      console.error('[reports] generateGeneralReport FAIL:', { status: err?.response?.status });
      throw err;
    });
}

/**
 * Gera relatório de funcionários em PDF
 */
export async function generateEmployeesReport(): Promise<Blob> {
  if (DEBUG_API) console.log('[reports] generateEmployeesReport');
  
  return http
    .get('/relatorios/funcionarios', {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    })
    .then((res) => {
      if (DEBUG_API) console.log('[reports] generateEmployeesReport OK');
      return res.data;
    })
    .catch((err) => {
      console.error('[reports] generateEmployeesReport FAIL:', { status: err?.response?.status });
      throw err;
    });
}

/**
 * Gera relatório de máquinas em PDF
 */
export async function generateMachinesReport(): Promise<Blob> {
  if (DEBUG_API) console.log('[reports] generateMachinesReport');
  
  return http
    .get('/relatorios/maquinas', {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    })
    .then((res) => {
      if (DEBUG_API) console.log('[reports] generateMachinesReport OK');
      return res.data;
    })
    .catch((err) => {
      console.error('[reports] generateMachinesReport FAIL:', { status: err?.response?.status });
      throw err;
    });
}
