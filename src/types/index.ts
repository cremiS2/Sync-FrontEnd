// Tipos globais do projeto

export interface Employee {
  id: number;
  employeeID: number;
  name: string;
  photo?: string;
  shift: string;
  sector: {
    id: number;
    name: string;
    efficiency: number;
    maximumQuantEmployee: number;
    department?: {
      id: number;
      name: string;
    };
  };
  status: string;
  availability: boolean;
  user?: {
    id: number;
    email: string;
    username: string;
    roles: Array<{ id: number; name: string }>;
  };
}

export interface EmployeeDTO {
  name: string;
  employeeID: number;
  sector: number;
  shift: string;
  status: string;
  photo?: string;
  user?: number;
  availability: boolean; // ← ADICIONAR CAMPO OBRIGATÓRIO
}

export interface Machine {
  id: number;
  name: string;
  sector: {
    id: number;
    name: string;
    efficiency: number;
    maximumQuantEmployee: number;
  } | string | number;
  status: string;
  oee: number;
  throughput: number;
  lastMaintenance: string;
  photo?: string;
  serieNumber: number;
  machineModel?: number;
  // Display fields
  department?: string;
  model?: string;
  efficiency?: number;
  production?: number;
  image?: string;
}

export interface MachineDTO {
  name: string;
  sector: number;
  status: string;
  oee: number;
  throughput: number;
  lastMaintenance: string;
  photo?: string;
  serieNumber: number;
  machineModel: number;
}

export interface Department {
  id: number;
  name: string;
  description: string;
  location: string;
  employees: number;
  budget: number;
  status: string;
  sectors: Sector[];
  createdAt: string;
}

export interface Sector {
  id: number;
  name: string;
  employees: number | Employee[]; // Pode ser número ou array de employees
  efficiency: number;
  production?: number;
  maxEmployees?: number;
  maximumQuantEmployee?: number; // Campo do backend
  description?: string;
  department?: {
    id: number;
    name: string;
  };
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  duration?: number;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'url' | 'date';
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>;
}

export interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
}

export interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium' | 'large';
}

export interface ActionButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick: (event?: React.MouseEvent) => void;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
}

export interface CUDModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  title: string;
  fields: FormField[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
}

// Stock (Estoque)
export interface Stock {
  id: number;
  codigo: string;
  nome: string;
  categoria: string;
  quantidade: number;
  unidade: string;
  precoUnitario: number;
  fornecedor: string;
  dataEntrada: string;
  dataValidade: string;
  localizacao: string;
  status: string;
  descricao: string;
}

export interface StockDTO {
  codigo: string;
  nome: string;
  categoria: string;
  quantidade: number;
  unidade: string;
  precoUnitario: number;
  fornecedor: string;
  dataEntrada: string;
  dataValidade: string;
  localizacao: string;
  status: string;
  descricao: string;
}

// User (Usuário)
export interface User {
  id: number;
  email: string;
  username?: string;
  roles: Array<{ id: number; name: string }>;
  createdAt?: string;
}

export interface UserDTO {
  email: string;
  password: string;
  roles: string[];
}

// Machine Model (Modelo de Máquina)
export interface MachineModel {
  id: number;
  modelName: string;
  modelDescription: string;
}

export interface MachineModelDTO {
  modelName: string;
  modelDescription: string;
}

// Allocated Employee Machine (Alocação Funcionário-Máquina)
export interface AllocatedEmployeeMachine {
  id: number;
  employee: Employee;
  machine: Machine;
  allocatedAt?: string;
  allocatedBy?: User;
}

export interface AllocatedEmployeeMachineDTO {
  employee: number;
  machine: number;
}