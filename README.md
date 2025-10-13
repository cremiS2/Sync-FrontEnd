# 🏭 Sistema de Gestão Industrial - Sync

Sistema completo de gestão industrial com controle de máquinas, funcionários, manutenções, estoque e atribuições.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Páginas do Sistema](#páginas-do-sistema)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Executar](#como-executar)

---

## 🎯 Visão Geral

O **Sync** é uma plataforma moderna de gestão industrial que oferece controle completo sobre operações, recursos humanos, equipamentos e processos de manutenção. Com interface intuitiva e design responsivo, o sistema facilita a tomada de decisões e otimiza a produtividade.

---

## 📄 Páginas do Sistema

### 🔐 **Autenticação**

#### **Login** (`/login`)
- **Função**: Autenticação de usuários no sistema
- **Recursos**:
  - Validação de credenciais
  - Feedback visual de erro/sucesso
  - Link para recuperação de senha
  - Link para cadastro de novos usuários
  - Animações suaves
  - Spinner de carregamento

#### **Cadastro de Usuários** (`/cadastro-usuarios`)
- **Função**: Registro de novos usuários no sistema
- **Recursos**:
  - Formulário com validação completa
  - Campos: Nome completo, Email, Usuário, Senha, Confirmar senha
  - Validações: Campos obrigatórios, senhas coincidentes, senha mínima 6 caracteres
  - Feedback de sucesso/erro
  - Redirecionamento automático para login após cadastro
  - Design idêntico à página de login

#### **Esqueceu Senha** (`/esqueceu-senha`)
- **Função**: Recuperação de senha
- **Recursos**:
  - Envio de email para redefinição
  - Validação de email

---

### 🏠 **Páginas Públicas**

#### **Landing Page** (`/`)
- **Função**: Página inicial pública do sistema
- **Recursos**:
  - Vídeo de fundo em fullscreen
  - Hero section com CTA
  - Seção de features (6 cards)
  - Estatísticas (4 KPIs)
  - Carrossel de depoimentos
  - Seção de CTA final
  - Footer completo
  - Design moderno com gradientes

#### **Sobre** (`/sobre`)
- **Função**: Informações sobre a empresa/sistema
- **Recursos**:
  - História da empresa
  - Missão, visão e valores
  - Equipe

#### **Diferenciais** (`/diferenciais`)
- **Função**: Destaque dos diferenciais do sistema
- **Recursos**:
  - Lista de funcionalidades
  - Comparativos
  - Benefícios

#### **Contato** (`/contato`)
- **Função**: Formulário de contato
- **Recursos**:
  - Formulário de mensagem
  - Informações de contato
  - Mapa (opcional)

---

### 📊 **Dashboard e Estatísticas**

#### **Dashboard Principal** (`/dashboard`)
- **Função**: Visão geral do sistema com métricas em tempo real
- **Recursos**:
  - KPIs principais (4 cards)
  - Gráficos de produção
  - Alertas recentes
  - Atividades recentes
  - Status de máquinas
  - Design responsivo

#### **Estatísticas** (`/estatisticas`)
- **Função**: Análises detalhadas e relatórios visuais
- **Recursos**:
  - Gráficos interativos
  - Filtros por período
  - Exportação de dados
  - Comparativos

---

### 👥 **Gestão de Pessoas**

#### **Funcionários** (`/funcionarios`)
- **Função**: Gerenciamento completo de funcionários
- **Recursos**:
  - Lista de funcionários com cards
  - Busca e filtros (departamento, cargo, status)
  - KPIs: Total, Ativos, Inativos, Novos
  - Modal CUD para criar/editar
  - Campos: Nome, Email, Cargo, Departamento, Telefone, Data de admissão
  - Avatar dos funcionários
  - Status visual (ativo/inativo)

#### **Usuários** (`/usuarios`)
- **Função**: Gestão de usuários do sistema
- **Recursos**:
  - Controle de permissões
  - Níveis de acesso
  - Ativação/desativação de contas

---

### 🏭 **Gestão de Recursos**

#### **Máquinas** (`/maquinas`)
- **Função**: Controle de máquinas industriais
- **Recursos**:
  - Lista de máquinas com cards
  - Busca e filtros (tipo, status, localização)
  - KPIs: Total, Operacionais, Em manutenção, Inativas
  - Modal CUD para criar/editar
  - Campos: Nome, Tipo, Fabricante, Modelo, Número de série, Localização
  - Status visual (operacional/manutenção/inativa)
  - Indicadores de performance

#### **Departamentos** (`/departamentos`)
- **Função**: Organização departamental
- **Recursos**:
  - Lista de departamentos
  - Busca e filtros
  - KPIs: Total, Ativos, Funcionários, Máquinas
  - Modal CUD para criar/editar
  - Campos: Nome, Descrição, Responsável, Localização
  - Estatísticas por departamento

---

### 🔧 **Manutenção e Operações**

#### **Manutenção** (`/manutencao`)
- **Função**: Gestão de manutenções preventivas e corretivas
- **Recursos**:
  - Lista de manutenções
  - Busca e filtros (tipo, status, prioridade)
  - KPIs: Total, Agendadas, Em andamento, Concluídas
  - Modal CUD para criar/editar
  - Campos: Máquina, Tipo, Prioridade, Data, Técnico, Descrição
  - Status visual
  - Histórico de manutenções

#### **Alertas & Logs** (`/alertas-logs`)
- **Função**: Monitoramento de alertas e logs do sistema
- **Recursos**:
  - Lista de alertas em tempo real
  - Filtros por tipo e severidade
  - KPIs: Total, Críticos, Avisos, Info
  - Detalhes de cada alerta
  - Histórico de logs
  - Notificações

---

### 📦 **Estoque e Atribuições**

#### **Estoque** (`/estoque`)
- **Função**: Controle de inventário de peças e materiais
- **Recursos**:
  - Lista de itens com cards
  - Busca e filtros (categoria, status)
  - KPIs: Total, Em estoque, Estoque baixo, Sem estoque
  - Modal CUD para criar/editar
  - Campos: Nome, Categoria, Quantidade, Quantidade mínima, Unidade, Localização
  - Status visual (em estoque/baixo/sem estoque)
  - Barra de progresso de estoque
  - Alertas de estoque baixo

#### **Atribuições** (`/atribuicoes`)
- **Função**: Gestão de tarefas e atribuições da equipe
- **Recursos**:
  - Lista de atribuições com cards
  - Busca e filtros (prioridade, status)
  - KPIs: Total, Pendentes, Em andamento, Concluídas
  - Modal CUD para criar/editar
  - Campos: Título, Funcionário, Máquina, Prioridade, Data de vencimento, Descrição
  - Status visual (pendente/em andamento/concluída)
  - Prioridade visual (baixa/média/alta/urgente)
  - Badges coloridos

---

### 📈 **Relatórios**

#### **Relatórios** (`/relatorios`)
- **Função**: Geração e visualização de relatórios
- **Recursos**:
  - Relatórios de produção
  - Relatórios de manutenção
  - Relatórios de funcionários
  - Exportação em PDF/Excel
  - Filtros por período
  - Gráficos e tabelas

---

### ⚙️ **Administração**

#### **Painel Admin** (`/admin`)
- **Função**: Central de controle administrativo
- **Recursos**:
  - 4 KPIs de sistema (Online, Usuários, Alertas, Backup)
  - 12 cards de acesso rápido:
    - Gestão de Usuários
    - Funcionários
    - Máquinas
    - Departamentos
    - Manutenção
    - Alertas & Logs
    - Configurações
    - Dashboard
    - Relatórios
    - Estoque
    - Atribuições
    - Cadastro de Usuários
  - 3 botões de ações administrativas:
    - Backup do Sistema
    - Status da Rede
    - Auditoria de Segurança
  - Cards com hover effects e animações
  - Bordas coloridas por categoria

#### **Configurações** (`/configuracoes`)
- **Função**: Configurações globais do sistema
- **Recursos**:
  - 4 seções de configuração:
    - **Geral**: Nome da empresa, Email, Telefone
    - **Notificações**: Email, Push, Alertas de manutenção, Alertas de produção
    - **Segurança**: 2FA, Timeout de sessão, Senha complexa
    - **Sistema**: Backup automático, Retenção de dados
  - Cards coloridos por seção
  - Switches para opções booleanas
  - Campos de texto e número
  - Detecção automática de mudanças
  - Alerta de alterações não salvas
  - Botão flutuante de salvar
  - 3 info cards no rodapé:
    - Versão do Sistema
    - Último Backup
    - Status de Segurança

---

### 🚫 **Páginas de Erro**

#### **404 - Não Encontrado** (`/404` ou `*`)
- **Função**: Página de erro para rotas inexistentes
- **Recursos**:
  - Design amigável
  - Botão para voltar ao login
  - Links de acesso rápido (todos levam ao login)
  - Animações

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **React 18** - Biblioteca JavaScript
- **TypeScript** - Tipagem estática
- **React Router DOM** - Roteamento
- **Material-UI (MUI)** - Componentes UI
- **Tailwind CSS** - Estilização
- **React Icons** - Ícones

### **Componentes Principais**
- **CUDModal** - Modal reutilizável para Create/Update/Delete
- **FormField** - Campos de formulário dinâmicos
- **Header** - Cabeçalho com gradiente e navegação
- **Sidebar** - Menu lateral colapsável
- **NotificationSystem** - Sistema de notificações
- **ErrorBoundary** - Tratamento de erros

### **Recursos**
- **Tema Claro/Escuro** - Alternância de temas
- **Responsivo** - Adaptável a todos os dispositivos
- **Validação de Formulários** - Validação automática
- **Animações** - Transições suaves
- **Lazy Loading** - Carregamento sob demanda

---

## 📁 Estrutura do Projeto

```
fronttcc-main/
├── src/
│   ├── components/
│   │   ├── forms/
│   │   │   ├── CUDModal.tsx          # Modal reutilizável
│   │   │   └── FormField.tsx         # Campos de formulário
│   │   ├── layout/
│   │   │   ├── Header.tsx            # Cabeçalho
│   │   │   ├── Sidebar.tsx           # Menu lateral
│   │   │   └── MainLayout.tsx        # Layout principal
│   │   ├── system/
│   │   │   ├── ErrorBoundary.tsx     # Tratamento de erros
│   │   │   └── NotificationSystem.tsx # Notificações
│   │   └── carrosel/
│   │       └── carrossel.tsx         # Carrossel
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── EsqueceuSenha.tsx
│   │   ├── public/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── Sobre.tsx
│   │   │   ├── Diferenciais.tsx
│   │   │   └── Contato.tsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   └── Estatisticas.tsx
│   │   ├── management/
│   │   │   ├── Funcionarios.tsx
│   │   │   ├── Maquinas.tsx
│   │   │   ├── Departamentos.tsx
│   │   │   ├── Usuarios.tsx
│   │   │   ├── Manutencao.tsx
│   │   │   ├── AlertasLogs.tsx
│   │   │   ├── Estoque.tsx
│   │   │   ├── Atribuicoes.tsx
│   │   │   ├── Relatorios.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── Configuracoes.tsx
│   │   │   └── CadastroUsuarios.tsx
│   │   └── error/
│   │       └── NotFound.tsx
│   ├── services/
│   │   └── auth.ts                   # Serviços de autenticação
│   ├── styles/
│   │   ├── base/
│   │   │   └── globals.css           # Estilos globais
│   │   └── modules/
│   │       └── Login.module.css      # Estilos do login
│   ├── utils/
│   │   └── navigationErrorHandler.ts # Tratamento de erros
│   ├── App.tsx                       # Componente principal
│   └── index.tsx                     # Entry point
├── public/
│   └── index.html
├── package.json
└── README.md
```

---

## 🚀 Como Executar

### **Pré-requisitos**
- Node.js 16+
- npm ou yarn

### **Instalação**

```bash
# Clone o repositório
git clone [url-do-repositorio]

# Entre na pasta
cd fronttcc-main

# Instale as dependências
npm install

# Execute o projeto
npm start
```

O sistema estará disponível em `http://localhost:3000`

---

## 🎨 Paleta de Cores

```css
--primary: #3c20f3        /* Roxo principal */
--primary-dark: #d96c0a   /* Laranja escuro */
--text: #1c140d           /* Texto principal */
--muted: #6b7280          /* Texto secundário */
--bg: #ffffff             /* Fundo claro */
--accent: #f4ede7         /* Acento */
```

---

## 📝 Funcionalidades Principais

✅ **Autenticação completa** com login e cadastro  
✅ **Dashboard interativo** com métricas em tempo real  
✅ **Gestão de funcionários** com CRUD completo  
✅ **Controle de máquinas** e equipamentos  
✅ **Sistema de manutenção** preventiva e corretiva  
✅ **Gestão de estoque** com alertas de baixo estoque  
✅ **Atribuições de tarefas** com prioridades  
✅ **Relatórios** exportáveis  
✅ **Painel administrativo** centralizado  
✅ **Configurações** personalizáveis  
✅ **Tema claro/escuro**  
✅ **Responsivo** para mobile/tablet/desktop  
✅ **Validação de formulários**  
✅ **Tratamento de erros** com ErrorBoundary  
✅ **Notificações** em tempo real  

---

## 👨‍💻 Desenvolvido por

**Equipe Sync**

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 🔄 Atualizações

**Versão 1.0.0** - 13/10/2024
- Sistema completo de gestão industrial
- 20+ páginas funcionais
- Design moderno e responsivo
- Integração com backend preparada
