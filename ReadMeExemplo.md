# Documentação: Consumo do Backend

Este documento descreve como o frontend consome a API do backend, incluindo configuração, estrutura, endpoints e padrões utilizados.

---

## 📋 Índice

1. [Configuração da API](#configuração-da-api)
2. [Cliente HTTP (Axios)](#cliente-http-axios)
3. [Estrutura de Serviços](#estrutura-de-serviços)
4. [Endpoints Disponíveis](#endpoints-disponíveis)
5. [Autenticação e Autorização](#autenticação-e-autorização)
6. [Paginação](#paginação)
7. [Tratamento de Erros](#tratamento-de-erros)
8. [Debug e Logs](#debug-e-logs)

---

## 🔧 Configuração da API

### Arquivo: `src/config/environment.ts`

O frontend utiliza variáveis de ambiente para configurar a URL da API:

```typescript
export const ENV_CONFIG = {
  API_URLS: {
    development: 'https://sync-d8hac6hdg3czc4aa.brazilsouth-01.azurewebsites.net',
    production: 'https://sync-d8hac6hdg3czc4aa.brazilsouth-01.azurewebsites.net',
    staging: 'https://sync-d8hac6hdg3czc4aa.brazilsouth-01.azurewebsites.net'
  },
  
  getApiUrl() {
    const env = this.getCurrentEnvironment();
    return import.meta.env.VITE_API_URL || this.API_URLS[env];
  }
};
```

### Variáveis de Ambiente (`.env`)

```bash
# URL da API do Backend
VITE_API_URL=https://sync-d8hac6hdg3czc4aa.brazilsouth-01.azurewebsites.net

# Debug da API (true para habilitar logs detalhados)
VITE_DEBUG_API=true
```

---

## 🌐 Cliente HTTP (Axios)

### Arquivo: `src/services/http.ts`

O cliente HTTP é configurado com Axios e inclui interceptors para autenticação e tratamento de erros.

### Configuração Base

```typescript
import axios from 'axios';
import { ENV_CONFIG } from '../config/environment';

const baseURL = ENV_CONFIG.getApiUrl();

export const http = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});
```

### Interceptor de Requisição

**Funcionalidades:**
- Adiciona token JWT no header `Authorization`
- Valida expiração do token
- Remove tokens expirados automaticamente
- Logs detalhados de debug

```typescript
http.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
  
  if (token) {
    // Validar expiração do token
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp < now) {
      localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      window.location.href = '/login';
      return config;
    }
    
    // Adicionar header Authorization
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  return config;
});
```

### Interceptor de Resposta

**Funcionalidades:**
- Logs de respostas bem-sucedidas
- Tratamento de erros 401 (não autorizado)
- Detecção de erros de rede (CORS, timeout)
- Logs detalhados de erros

```typescript
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Erro 401: Token inválido ou expirado
    if (error?.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    }
    
    // Erro de rede
    if (!error?.response) {
      console.error('Possível problema de CORS, timeout ou servidor offline');
    }
    
    return Promise.reject(error);
  }
);
```

---

## 📁 Estrutura de Serviços

Todos os serviços seguem o mesmo padrão de organização:

```
src/services/
├── http.ts                          # Cliente HTTP base
├── auth.ts                          # Autenticação
├── users.ts                         # Gerenciamento de usuários
├── employees.ts                     # Gerenciamento de funcionários
├── machines.ts                      # Gerenciamento de máquinas
├── machineModels.ts                 # Modelos de máquinas
├── departments.ts                   # Departamentos
├── sectors.ts                       # Setores
└── allocatedEmployeeMachine.ts      # Alocações funcionário-máquina
```

### Padrão de Implementação

Cada serviço exporta funções para operações CRUD:

```typescript
// Listar (com paginação e filtros)
export function listItems(query: ListQuery): Promise<{ data: Page<Item> }>

// Buscar por ID
export function getItem(id: number): Promise<{ data: Item }>

// Criar
export function createItem(dto: ItemDTO): Promise<{ headers: any }>

// Atualizar
export function updateItem(id: number, dto: ItemDTO): Promise<void>

// Deletar
export function deleteItem(id: number): Promise<void>
```

---

## 🔌 Endpoints Disponíveis

### Arquivo: `src/utils/constants.ts`

```typescript
export const API_ENDPOINTS = {
  LOGIN: '/login',
  SIGN_IN: '/sign-in',
  USER: '/user',
  EMPLOYEE: '/employee',
  SECTOR: '/sector',
  DEPARTMENT: '/department',
  MACHINE: '/machine',
  MACHINE_MODEL: '/machine-model',
  ALLOCATED_EMPLOYEE_MACHINE: '/allocated-employee-machine',
};
```

---

## 🔐 Autenticação e Autorização

### Arquivo: `src/services/auth.ts`

### 1. Login

**Endpoint:** `POST /login`

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  exp?: number;
}

// Uso
const response = await login({ email, password });
// Token é automaticamente salvo no localStorage
```

**Fluxo:**
1. Envia credenciais para o backend
2. Recebe token JWT
3. Salva token no `localStorage` com chave `user_token`
4. Token é automaticamente incluído em todas as requisições subsequentes

### 2. Sign In (Registro)

**Endpoint:** `POST /sign-in`

```typescript
interface SignInRequest {
  email: string;
  password: string;
  roles?: string[];
}

// Uso
await signIn({ email, password, roles });
```

### 3. Logout

```typescript
// Remove token do localStorage
logout();
```

### 4. Verificações de Autenticação

```typescript
// Verificar se usuário está autenticado
const isAuth = isAuthenticated();

// Obter token atual
const token = getToken();

// Limpar token expirado
const wasExpired = clearExpiredToken();
```

---

## 👥 Funcionários (Employees)

### Arquivo: `src/services/employees.ts`

### Listar Funcionários

**Endpoint:** `GET /employee`

```typescript
interface ListEmployeesQuery {
  employeeName?: string;
  employeeId?: number;
  shift?: string;
  sectorName?: string;
  pageNumber?: number;
  pageSize?: number;
}

// Uso
const response = await listEmployees({
  employeeName: 'João',
  shift: 'Manhã',
  pageNumber: 0,
  pageSize: 10
});
```

**Parâmetros de Query:**
- `employee-name`: Nome do funcionário (filtro)
- `employee-id`: ID do funcionário (filtro)
- `shift`: Turno (filtro)
- `sector-name`: Nome do setor (filtro)
- `page-number`: Número da página (paginação)
- `page-size`: Tamanho da página (paginação)

### Buscar Funcionário

**Endpoint:** `GET /employee/{id}`

```typescript
const response = await getEmployee(123);
```

### Criar Funcionário

**Endpoint:** `POST /employee`

```typescript
interface EmployeeDTO {
  name: string;
  email: string;
  shift: string;
  sectorId: number;
  // ... outros campos
}

const response = await createEmployee(employeeDTO);
// Location do recurso criado em: response.headers.location
```

### Atualizar Funcionário

**Endpoint:** `PUT /employee/{id}`

```typescript
await updateEmployee(123, employeeDTO);
```

### Deletar Funcionário

**Endpoint:** `DELETE /employee/{id}`

```typescript
await deleteEmployee(123);
```

---

## 🏭 Máquinas (Machines)

### Arquivo: `src/services/machines.ts`

### Listar Máquinas

**Endpoint:** `GET /machine`

```typescript
interface ListMachinesQuery {
  machineName?: string;
  sectorName?: string;
  statusMachine?: string;
  pageNumber?: number;
  pageSize?: number;
}

// Uso
const response = await listMachines({
  machineName: 'Torno CNC',
  statusMachine: 'Operando',
  pageNumber: 0,
  pageSize: 10
});
```

**Parâmetros de Query:**
- `machine-name`: Nome da máquina (filtro)
- `sector-name`: Nome do setor (filtro)
- `status-machine`: Status da máquina (filtro)
  - Valores: `'Operando'`, `'Parada'`, `'Manutenção'`
- `page-number`: Número da página
- `page-size`: Tamanho da página

### Buscar Máquina

**Endpoint:** `GET /machine/{id}`

```typescript
const response = await getMachine(456);
```

### Criar Máquina

**Endpoint:** `POST /machine`

```typescript
interface MachineDTO {
  name: string;
  modelId: number;
  sectorId: number;
  status: string;
  // ... outros campos
}

const response = await createMachine(machineDTO);
```

### Atualizar Máquina

**Endpoint:** `PUT /machine/{id}`

```typescript
await updateMachine(456, machineDTO);
```

### Deletar Máquina

**Endpoint:** `DELETE /machine/{id}`

```typescript
await deleteMachine(456);
```

---

## 🏢 Departamentos (Departments)

### Arquivo: `src/services/departments.ts`

### Listar Departamentos

**Endpoint:** `GET /department`

```typescript
interface ListDepartmentsQuery {
  departmentName?: string;
  statusDepartment?: string;
  departmentBudget?: number;
  pageSize?: number;
  pageNumber?: number;
}

// Uso
const response = await listDepartments({
  departmentName: 'Produção',
  statusDepartment: 'active',
  pageNumber: 0,
  pageSize: 10
});
```

**Parâmetros de Query:**
- `department-name`: Nome do departamento (filtro)
- `status-department`: Status do departamento (filtro)
- `department-budget`: Orçamento do departamento (filtro)
- `page-number`: Número da página
- `page-size`: Tamanho da página

### Buscar Departamento

**Endpoint:** `GET /department/{id}`

```typescript
const response = await getDepartment(789);
```

### Criar Departamento

**Endpoint:** `POST /department`

```typescript
interface DepartmentDTO {
  name: string;
  description: string;
  location: string;
  budget: number;
  status: string;
}

const response = await createDepartment(departmentDTO);
```

### Atualizar Departamento

**Endpoint:** `PUT /department/{id}`

```typescript
await updateDepartment(789, departmentDTO);
```

### Deletar Departamento

**Endpoint:** `DELETE /department/{id}`

```typescript
await deleteDepartment(789);
```

---

## 🏭 Setores (Sectors)

### Arquivo: `src/services/sectors.ts`

### Listar Setores

**Endpoint:** `GET /sector`

```typescript
interface ListSectorsQuery {
  departmentName?: string;
  sectorName?: string;
  pageSize?: number;
  pageNumber?: number;
}

// Uso
const response = await listSectors({
  departmentName: 'Produção',
  sectorName: 'Montagem',
  pageNumber: 0,
  pageSize: 10
});
```

**Parâmetros de Query:**
- `department-name`: Nome do departamento (filtro)
- `sector-name`: Nome do setor (filtro)
- `page-number`: Número da página
- `page-size`: Tamanho da página

### Buscar Setor

**Endpoint:** `GET /sector/{id}`

```typescript
const response = await getSector(321);
```

### Criar Setor

**Endpoint:** `POST /sector`

```typescript
interface SectorDTO {
  name: string;
  department: number;              // ID do departamento (obrigatório)
  maximumQuantEmployee: number;    // Quantidade máxima de funcionários (obrigatório)
  efficiency: number;
  description: string;             // Obrigatório
}

const response = await createSector(sectorDTO);
```

### Atualizar Setor

**Endpoint:** `PUT /sector/{id}`

```typescript
await updateSector(321, sectorDTO);
```

### Deletar Setor

**Endpoint:** `DELETE /sector/{id}`

```typescript
await deleteSector(321);
```

---

## 🔧 Modelos de Máquinas (Machine Models)

### Arquivo: `src/services/machineModels.ts`

### Listar Modelos

**Endpoint:** `GET /machine-model`

```typescript
interface ListMachineModelsQuery {
  numeroPagina?: number;
  tamanhoPagina?: number;
}

// Uso
const response = await listMachineModels({
  numeroPagina: 0,
  tamanhoPagina: 10
});
```

**Parâmetros de Query:**
- `numero-pagina`: Número da página
- `tamanho-pagina`: Tamanho da página

### Buscar Modelo

**Endpoint:** `GET /machine-model/{id}`

```typescript
const response = await getMachineModel(111);
```

### Criar Modelo

**Endpoint:** `POST /machine-model`

```typescript
const response = await createMachineModel(modelDTO);
```

### Atualizar Modelo

**Endpoint:** `PUT /machine-model/{id}`

```typescript
await updateMachineModel(111, modelDTO);
```

### Deletar Modelo

**Endpoint:** `DELETE /machine-model/{id}`

```typescript
await deleteMachineModel(111);
```

---

## 👤 Usuários (Users)

### Arquivo: `src/services/users.ts`

### Listar Usuários

**Endpoint:** `GET /user`

```typescript
interface ListUsersQuery {
  pageNumber?: number;
  pageSize?: number;
}

// Uso
const response = await listUsers({
  pageNumber: 0,
  pageSize: 10
});
```

**Parâmetros de Query:**
- `page-number`: Número da página
- `page-size`: Tamanho da página

### Buscar Usuário

**Endpoint:** `GET /user/{id}`

```typescript
const response = await getUser(555);
```

### Atualizar Usuário

**Endpoint:** `PUT /user/{id}`

```typescript
await updateUser(555, userDTO);
```

### Deletar Usuário

**Endpoint:** `DELETE /user/{id}`

```typescript
await deleteUser(555);
```

---

## 🔗 Alocações Funcionário-Máquina

### Arquivo: `src/services/allocatedEmployeeMachine.ts`

### Listar Alocações

**Endpoint:** `GET /allocated-employee-machine`

```typescript
interface ListAllocationsQuery {
  pageSize?: number;
  pageNumber?: number;
  nameEmployee?: string;
  nameEmployeeChanged?: string;
}

// Uso
const response = await listAllocations({
  nameEmployee: 'João Silva',
  pageNumber: 0,
  pageSize: 10
});
```

**Parâmetros de Query:**
- `page-size`: Tamanho da página
- `page-number`: Número da página
- `name-employee`: Nome do funcionário (filtro)
- `name-employee-changed`: Nome do funcionário alterado (filtro)

### Criar Alocação

**Endpoint:** `POST /allocated-employee-machine`

```typescript
const response = await createAllocation(allocationDTO);
```

---

## 📄 Paginação

### Arquivo: `src/types/api.ts`

Todas as listagens retornam um objeto paginado:

```typescript
interface Page<T> {
  content: T[];              // Array de itens
  totalElements: number;     // Total de elementos
  totalPages: number;        // Total de páginas
  size: number;              // Tamanho da página
  number: number;            // Número da página atual
  first: boolean;            // É a primeira página?
  last: boolean;             // É a última página?
  numberOfElements: number;  // Número de elementos na página atual
  empty: boolean;            // Está vazia?
}
```

### Exemplo de Uso

```typescript
const response = await listEmployees({
  pageNumber: 0,    // Primeira página (zero-indexed)
  pageSize: 10      // 10 itens por página
});

const employees = response.data.content;
const totalPages = response.data.totalPages;
const totalItems = response.data.totalElements;
```

### Constantes de Paginação

```typescript
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50],
};
```

---

## ⚠️ Tratamento de Erros

### Estrutura de Erro

Todos os serviços capturam e logam erros detalhadamente:

```typescript
try {
  const response = await listEmployees(query);
} catch (err: any) {
  console.error('Error details:', {
    status: err?.response?.status,
    data: err?.response?.data,
    message: err?.response?.data?.message,
    validationErrors: err?.response?.data?.validationErrors
  });
  throw err;
}
```

### Códigos de Status Comuns

- **200 OK**: Requisição bem-sucedida
- **201 Created**: Recurso criado com sucesso
- **204 No Content**: Operação bem-sucedida sem conteúdo de retorno
- **400 Bad Request**: Dados inválidos
- **401 Unauthorized**: Token inválido ou expirado
- **403 Forbidden**: Sem permissão
- **404 Not Found**: Recurso não encontrado
- **422 Unprocessable Entity**: Erro de validação
- **500 Internal Server Error**: Erro no servidor

### Tratamento Automático

O interceptor de resposta trata automaticamente:

1. **Erro 401**: Remove token e redireciona para login
2. **Erro de Rede**: Detecta problemas de CORS, timeout ou servidor offline
3. **Logs Detalhados**: Registra todos os detalhes do erro para debug

---

## 🐛 Debug e Logs

### Habilitando Debug

No arquivo `.env`:

```bash
VITE_DEBUG_API=true
```

### Logs Disponíveis

Quando o debug está habilitado, você verá:

#### 1. Logs de Requisição

```
=== HTTP INTERCEPTOR REQUEST ===
URL: https://api.example.com/employee
Método: GET
Token encontrado: true
Token (primeiros 30 chars): eyJhbGciOiJIUzI1NiIsInR5cCI6...
Authorization header adicionado: Bearer eyJhbGciOiJIUz...
```

#### 2. Logs de Resposta

```
[HTTP] Response: {
  status: 200,
  url: '/employee',
  method: 'GET'
}
```

#### 3. Logs de Erro

```
=== HTTP INTERCEPTOR - ERRO 401 ===
URL completa: https://api.example.com/employee
Método: GET
Headers da requisição: { Authorization: 'Bearer ...' }
Headers da resposta: { ... }
Dados da resposta: { message: 'Token inválido' }
```

#### 4. Logs de Serviço

```
[employees] listEmployees params: { 
  employee-name: 'João',
  page-number: 0,
  page-size: 10
}
[employees] listEmployees OK items: 5
```

### Desabilitando Logs em Produção

```bash
VITE_DEBUG_API=false
```

Ou simplesmente remova a variável do `.env`.

---

## 📝 Boas Práticas

### 1. Sempre Use os Serviços

❌ **Não faça:**
```typescript
import axios from 'axios';
axios.get('https://api.example.com/employee');
```

✅ **Faça:**
```typescript
import { listEmployees } from '@/services/employees';
const response = await listEmployees();
```

### 2. Trate Erros Adequadamente

```typescript
try {
  const response = await createEmployee(employeeDTO);
  // Sucesso
} catch (error: any) {
  if (error?.response?.status === 422) {
    // Erro de validação
    const validationErrors = error.response.data.validationErrors;
    // Mostrar erros ao usuário
  } else {
    // Erro genérico
    // Mostrar mensagem de erro
  }
}
```

### 3. Use TypeScript

Todos os serviços são tipados. Aproveite o IntelliSense:

```typescript
// TypeScript vai sugerir os campos disponíveis
const query: ListEmployeesQuery = {
  employeeName: 'João',
  shift: 'Manhã',
  pageNumber: 0,
  pageSize: 10
};
```

### 4. Paginação

Sempre implemente paginação para listas grandes:

```typescript
const [page, setPage] = useState(0);
const [pageSize, setPageSize] = useState(10);

const response = await listEmployees({
  pageNumber: page,
  pageSize: pageSize
});
```

### 5. Loading States

Sempre mostre feedback visual durante requisições:

```typescript
const [loading, setLoading] = useState(false);

const loadData = async () => {
  setLoading(true);
  try {
    const response = await listEmployees();
    // Processar dados
  } catch (error) {
    // Tratar erro
  } finally {
    setLoading(false);
  }
};
```

---

## 🔒 Segurança

### 1. Token JWT

- Armazenado em `localStorage` com chave `user_token`
- Validado automaticamente antes de cada requisição
- Removido automaticamente se expirado
- Incluído em todas as requisições autenticadas

### 2. HTTPS

Todas as requisições são feitas via HTTPS:
```
https://sync-d8hac6hdg3czc4aa.brazilsouth-01.azurewebsites.net
```

### 3. Headers de Segurança

```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <token>'
}
```

---

## 🚀 Exemplo Completo

### Componente React com Listagem de Funcionários

```typescript
import React, { useState, useEffect } from 'react';
import { listEmployees, type ListEmployeesQuery } from '@/services/employees';
import type { Employee } from '@/types';

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const query: ListEmployeesQuery = {
        pageNumber: page,
        pageSize: 10,
        shift: 'Manhã'
      };
      
      const response = await listEmployees(query);
      
      setEmployees(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [page]);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h1>Funcionários</h1>
      <ul>
        {employees.map(employee => (
          <li key={employee.id}>{employee.name}</li>
        ))}
      </ul>
      <button onClick={() => setPage(p => p - 1)} disabled={page === 0}>
        Anterior
      </button>
      <span>Página {page + 1} de {totalPages}</span>
      <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
        Próxima
      </button>
    </div>
  );
}
```

---

## 📚 Referências

- **Axios Documentation**: https://axios-http.com/
- **JWT.io**: https://jwt.io/
- **TypeScript**: https://www.typescriptlang.org/

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs no console do navegador (com `VITE_DEBUG_API=true`)
2. Confirme que a URL da API está correta no `.env`
3. Verifique se o token JWT está válido
4. Consulte a documentação do backend

---

**Última atualização:** 2024
**Versão:** 1.0.0
