import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaArrowLeft } from 'react-icons/fa';

const AccessDenied: React.FC = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <FaLock className="text-4xl text-red-600 dark:text-red-400" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Acesso Negado
          </h1>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Você não tem permissão para acessar esta página.
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Seu perfil atual: <span className="font-semibold text-blue-600 dark:text-blue-400">{userRole || 'Não identificado'}</span>
          </p>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Permissões necessárias:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>• <strong>ADMIN</strong> - Acesso total ao sistema</li>
              <li>• <strong>GERENTE</strong> - Visualização e relatórios</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <FaArrowLeft />
              Voltar ao Dashboard
            </button>
            
            <button
              onClick={() => navigate(-1)}
              className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
            >
              Voltar à página anterior
            </button>
          </div>

          {/* Contact Info */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
            Precisa de acesso? Entre em contato com o administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
