import React, { Suspense, lazy } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/base/reset.css';
import { NotificationSystem, ErrorBoundary } from './components/system';
import { PageLoader } from './components/ui';

// Lazy loading das páginas
const Login = lazy(() => import('./pages/auth/Login'));
const EsqueceuSenha = lazy(() => import('./pages/auth/EsqueceuSenha'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Estatisticas = lazy(() => import('./pages/dashboard/Estatisticas'));
const Funcionarios = lazy(() => import('./pages/management/Funcionarios'));
const Maquinas = lazy(() => import('./pages/management/Maquinas'));
const Departamentos = lazy(() => import('./pages/management/Departamentos'));
const Perfil = lazy(() => import('./pages/management/Perfil'));
const Usuarios = lazy(() => import('./pages/management/Usuarios'));
const Configuracoes = lazy(() => import('./pages/management/Configuracoes'));
const Manutencao = lazy(() => import('./pages/management/Manutencao'));
const AlertasLogs = lazy(() => import('./pages/management/AlertasLogs'));
const Relatorios = lazy(() => import('./pages/management/Relatorios'));
const AdminDashboard = lazy(() => import('./pages/management/AdminDashboard'));
const CadastroUsuarios = lazy(() => import('./pages/management/CadastroUsuarios'));
const Atribuicoes = lazy(() => import('./pages/management/Atribuicoes'));
const Estoque = lazy(() => import('./pages/management/Estoque'));
const NotFound = lazy(() => import('./pages/error/NotFound'));
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const Sobre = lazy(() => import('./pages/public/Sobre'));
const Contato = lazy(() => import('./pages/public/Contato'));
const Diferenciais = lazy(() => import('./pages/public/Diferenciais'));

const App: React.FC = () => {
  const theme = createTheme({
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            textTransform: 'none',
            transition: 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, color 0.2s ease',
            transform: 'translateY(0)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
            },
            '&.MuiButton-containedPrimary': {
              backgroundColor: 'var(--primary)',
              color: '#fff',
              '&:hover': {
                backgroundColor: 'var(--primary-dark)',
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
              },
            },
            '&.MuiButton-outlinedPrimary': {
              color: '#fff',
              backgroundColor: 'var(--primary)',
              borderColor: 'var(--primary)',
              '& .MuiButton-startIcon': {
                color: 'inherit',
              },
              '&:hover': {
                backgroundColor: 'var(--primary-dark)',
                borderColor: 'var(--primary-dark)',
                color: '#fff',
              },
            },
          },
        },
      },
    },
  });

  return (
    <NotificationSystem>
      <ThemeProvider theme={theme}>
        <Router>
          <ErrorBoundary>
            <div className="min-h-screen">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/estatisticas" element={<Estatisticas />} />
                  <Route path="/funcionarios" element={<Funcionarios />} />
                  <Route path="/departamentos" element={<Departamentos />} />
                  <Route path="/maquinas" element={<Maquinas />} />
                  <Route path="/perfil" element={<Perfil />} />
                  <Route path="/usuarios" element={<Usuarios />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="/manutencao" element={<Manutencao />} />
                  <Route path="/alertas-logs" element={<AlertasLogs />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/cadastro-usuarios" element={<CadastroUsuarios />} />
                  <Route path="/atribuicoes" element={<Atribuicoes />} />
                  <Route path="/estoque" element={<Estoque />} />
                  <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />
                  <Route path="/diferenciais" element={<Diferenciais />} />
                  <Route path="/sobre" element={<Sobre />} />
                  <Route path="/contato" element={<Contato />} />
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </div>
          </ErrorBoundary>
        </Router>
      </ThemeProvider>
    </NotificationSystem>
  );
};

export default App;















