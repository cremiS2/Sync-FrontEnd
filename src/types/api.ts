export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
  // sort and pageable are omitted for simplicity; add if needed
}

// Estrutura de erro do backend
export interface ErrorField {
  campo: string;
  mensagem: string;
}

export interface ErrorResponse {
  statusErro: number;
  menssagem: string;
  errosCampos: ErrorField[];
}


