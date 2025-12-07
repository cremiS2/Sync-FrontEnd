import type { ErrorField } from '../types/api';

/**
 * Extrai a mensagem de erro do backend
 * Tenta vários formatos comuns de resposta de erro
 */
export const getErrorMessage = (error: any): string => {
  // Se já tem userMessage (adicionado pelo interceptor)
  if (error.userMessage) {
    return error.userMessage;
  }

  // Tentar extrair do response.data
  if (error.response?.data) {
    const data = error.response.data;
    
    // Formato padrão do backend: { statusErro, menssagem, errosCampos }
    if (data.menssagem) {
      // Se tem erros de campos, adicionar detalhes
      if (data.errosCampos && Array.isArray(data.errosCampos) && data.errosCampos.length > 0) {
        const fieldErrors = data.errosCampos
          .map((err: ErrorField) => `${err.campo}: ${err.mensagem}`)
          .join('\n');
        return `${data.menssagem}\n\n${fieldErrors}`;
      }
      return data.menssagem;
    }
    
    // Formatos alternativos
    return data.message 
      || data.error 
      || data.msg
      || data.mensagem
      || data.errorMessage
      || data.error_message
      || (typeof data === 'string' ? data : null)
      || 'Erro ao processar requisição';
  }

  // Erro de rede
  if (!error.response) {
    return 'Erro de conexão. Verifique sua internet.';
  }

  // Mensagem padrão baseada no status
  const status = error.response?.status;
  switch (status) {
    case 400:
      return 'Dados inválidos. Verifique as informações.';
    case 401:
      return 'Não autorizado. Faça login novamente.';
    case 403:
      return 'Acesso negado. Você não tem permissão.';
    case 404:
      return 'Recurso não encontrado.';
    case 409:
      return 'Conflito. O recurso já existe.';
    case 422:
      return 'Dados inválidos. Verifique as informações.';
    case 500:
      return 'Erro no servidor. Tente novamente mais tarde.';
    default:
      return error.message || 'Erro desconhecido';
  }
};

/**
 * Extrai os erros de campos do backend
 */
export const getFieldErrors = (error: any): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};
  
  if (error.response?.data?.errosCampos && Array.isArray(error.response.data.errosCampos)) {
    error.response.data.errosCampos.forEach((err: ErrorField) => {
      fieldErrors[err.campo] = err.mensagem;
    });
  }
  
  return fieldErrors;
};

/**
 * Verifica se o erro tem erros de validação de campos
 */
export const hasFieldErrors = (error: any): boolean => {
  return !!(error.response?.data?.errosCampos && 
           Array.isArray(error.response.data.errosCampos) && 
           error.response.data.errosCampos.length > 0);
};
