# Sync - Sistema de Gestão Industrial

## Visão Geral
O **Sync** é um sistema web para gestão de produção industrial, focado em visualização de dados, acompanhamento de desempenho de máquinas e funcionários, e navegação intuitiva. O projeto está em estágio inicial (30% concluído), com ênfase em prototipação visual, arquitetura modular e experiência do usuário.

---

## Rotas do Sistema

| Rota            | Componente/Página | Descrição                                                     |
|-----------------|-------------------|---------------------------------------------------------------|
| `/`             | Landing Page      | Página inicial com apresentação e chamada para ação            |
| `/login`        | Login             | Tela de autenticação, visual moderno, animações e validação UI |
| `/dashboard`    | Dashboard         | Painel com gráficos de produção e OEE, cards de resumo        |
| `/maquinas`     | Máquinas          | Listagem de máquinas, status, OEE e vazão                     |
| `/funcionarios` | Funcionários      | Listagem de funcionários, desempenho, busca e modais          |
| `/perfil`       | Perfil            | Página de perfil do usuário com informações e configurações   |
| `/relatorios`   | Relatórios        | Análise detalhada de dados e performance com filtros          |
| `/departamentos`| Departamentos     | Gestão e monitoramento dos departamentos da empresa           |

---

## Componentes Reutilizáveis

### Componentes de Layout
- **`PageHeader`** - Cabeçalho padrão para páginas com título e subtítulo
- **`FilterCard`** - Container para filtros e controles com estilo consistente
- **`AuthenticatedHeader`** - Header para páginas autenticadas com navegação
- **`LandingHeader`** - Header específico para a landing page

### Componentes de Dados
- **`SummaryCard`** - Cards de resumo com métricas, tendências e ícones
- **`InfoCard`** - Cards de informação simples com cores personalizáveis
- **`StatusChip`** - Chips de status padronizados (ativo, manutenção, inativo)
- **`EfficiencyChip`** - Chips de eficiência com cores baseadas em percentual

### Componentes de Interação
- **`ActionButton`** - Botões de ação padronizados com ícones e estilos
- **`PerformanceCircle`** - Gráfico circular de performance
- **`OeeDonutChart`** - Gráfico donut para OEE
- **`DonutChart`** - Gráfico donut genérico

### Componentes de Gráficos
- **`PerformanceCircle`** - Gráfico circular de performance
- **`OeeDonutChart`** - Gráfico donut para OEE
- **`DonutChart`** - Gráfico donut genérico

---

## Paleta de Cores
| Nome CSS           | Valor      | Uso principal                        |
|--------------------|------------|--------------------------------------|
| `--primary`        | #f38220    | Laranja principal, botões, destaques |
| `--primary-dark`   | #d96c0a    | Laranja escuro, hovers, gráficos     |
| `--accent`         | #f4ede7    | Bege claro, fundos, cards            |
| `--bg`             | #fcfaf8    | Fundo geral                          |
| `--text`           | #1c140d    | Texto principal                      |
| `--muted`          | #9c7049    | Texto secundário, detalhes           |
| `--success`        | #07880e    | Status positivo                      |
| `--danger`         | #e71008    | Status de erro                       |
| `--warning`        | #f38524    | Status de atenção                    |

As cores estão definidas em `src/styles/globals.css` como variáveis CSS globais.

---

## Bibliotecas e Ferramentas
- **React** + **TypeScript** — Framework principal e tipagem
- **Vite** — Build e ambiente de desenvolvimento rápido
- **Tailwind CSS** — Utilitários de estilo e responsividade
- **Material-UI** — Componentes de interface (Cards, Buttons, Dialogs, etc.)
- **React Icons** — Ícones Font Awesome para interface
- **Recharts** — Gráficos profissionais (linha, donut)
- **React Router DOM** — Navegação entre páginas

---

## Estrutura de Pastas
```
src/
├── components/           # Componentes reutilizáveis
│   ├── ActionButton.tsx
│   ├── AuthenticatedHeader.tsx
│   ├── DonutChart.tsx
│   ├── EfficiencyChip.tsx
│   ├── FilterCard.tsx
│   ├── InfoCard.tsx
│   ├── LandingHeader.tsx
│   ├── OeeDonutChart.tsx
│   ├── PageHeader.tsx
│   ├── PerformanceCircle.tsx
│   └── StatusChip.tsx
├── pages/               # Páginas principais
│   ├── Dashboard.tsx
│   ├── Departamentos.tsx
│   ├── Funcionarios.tsx
│   ├── LandingPage.tsx
│   ├── Login.tsx
│   ├── Maquinas.tsx
│   ├── Perfil.tsx
│   └── Relatorios.tsx
├── styles/              # Estilos globais
│   ├── Dashboard.module.css
│   ├── globals.css
│   └── reset.css
└── assets/              # Imagens e recursos
```

---

## Organização e Padrões do Projeto

### Componentização
- **Componentes Reutilizáveis**: Todos os elementos visuais são componentes modulares
- **Props TypeScript**: Interfaces bem definidas para todas as props
- **Valores Padrão**: Props opcionais com valores padrão sensatos
- **Separação de Responsabilidades**: Cada componente tem uma função específica

### Estilo e Design
- **Paleta Consistente**: Todas as cores seguem o padrão definido
- **CSS Variables**: Uso de variáveis CSS para consistência
- **Tailwind CSS**: Utilitários para layout e responsividade
- **Material-UI**: Componentes base para interface
- **Animações**: Transições suaves e feedback visual

### Código Limpo
- **Sem Comentários**: Código autoexplicativo sem comentários
- **Sem Emojis**: Interface profissional sem emojis
- **Nomenclatura Clara**: Nomes descritivos para componentes e funções
- **TypeScript**: Tipagem forte para prevenir erros

### Responsividade
- **Mobile-First**: Design responsivo para todos os dispositivos
- **Grid System**: Layout flexível com Tailwind CSS
- **Breakpoints**: Adaptação para diferentes tamanhos de tela

---

## Instruções de Uso
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Acesse [http://localhost:5173](http://localhost:5173) no navegador.

---

## Como Contribuir

### Padrões de Código
- Siga o padrão de componentização e organização de pastas
- Use sempre a paleta de cores definida
- Mantenha o código limpo, sem comentários ou código morto
- Use TypeScript para todas as props e interfaces
- Teste visualmente as páginas antes de commitar

### Estrutura de Commits
Commits devem ser objetivos e profissionais:
```
feat(componentes): adiciona SummaryCard e FilterCard reutilizáveis
feat(paginas): implementa página de Relatórios com filtros avançados
feat(departamentos): cria página de Departamentos com setores
fix(header): corrige navegação e notificações
refactor(componentes): extrai componentes reutilizáveis das páginas
docs(readme): atualiza documentação com novos componentes
```

### Criando Novos Componentes
1. Defina a interface TypeScript para as props
2. Use CSS variables para cores
3. Implemente responsividade com Tailwind
4. Adicione animações e feedback visual
5. Teste em diferentes contextos

---

## Status do Projeto

### ✅ Concluído
- **UI/UX**: 95% (interface completa e responsiva)
- **Componentização**: 90% (componentes reutilizáveis criados)
- **Páginas**: 100% (todas as páginas implementadas)
- **Navegação**: 100% (roteamento completo)
- **Design System**: 90% (componentes padronizados)

### 🚧 Em Desenvolvimento
- **Refatoração**: Migração para componentes reutilizáveis
- **Otimização**: Melhoria de performance e acessibilidade

### 📋 Próximos Passos
- **Backend**: Integração com API
- **Autenticação**: Sistema de login real
- **CRUD**: Operações de dados
- **Testes**: Testes automatizados
- **Deploy**: Deploy em produção

---

## Funcionalidades por Página

### Dashboard
- Gráficos de produção e OEE
- Cards de resumo com métricas
- Indicadores de performance

### Relatórios
- Filtros avançados por período e departamento
- Gráficos interativos
- Exportação em múltiplos formatos
- Dados rápidos e detalhados

### Departamentos
- Listagem de departamentos com status
- Detalhes de cada departamento
- Gestão de setores
- Métricas de funcionários e orçamento

### Perfil
- Informações do usuário
- Configurações de conta
- Status online/offline
- Edição de dados pessoais

### Funcionários
- Listagem com busca e filtros
- Detalhes de cada funcionário
- Performance e métricas
- Gestão de turnos

### Máquinas
- Status das máquinas
- OEE e vazão
- Manutenção preventiva
- Indicadores de performance

---

> Para dúvidas, sugestões ou colaboração, entre em contato com o responsável pelo projeto.
