import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/auth';
import styles from '../../styles/modules/Login.module.css';

const Spinner = () => (
  <div className="flex justify-center items-center mt-4">
    <svg className="animate-spin h-8 w-8 text-[var(--primary)]" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  </div>
);

const Login: React.FC = () => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de campos obrigatórios
    if (!user || !pass) {
      setError(true);
      return;
    }
    
    if (user.trim() === '' || pass.trim() === '') {
      setError(true);
      return;
    }
    
    setLoading(true);
    setError(false);
    
    try {
      await login({ email: user, password: pass });
      setSuccess(true);
      
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(true);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className="flex-1 w-full flex items-center justify-center fade-in">
        <div className={styles.formBox}>
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 flex items-center gap-2 text-[var(--muted)] hover:text-[var(--primary)] transition-colors duration-200"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Voltar</span>
          </button>
          <div className="mb-8 flex flex-col items-center">
            <div className={styles.logo}>
              <svg width="36" height="36" fill="none" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="22" stroke="white" strokeWidth="4" />
                <path d="M16 24l6 6 10-10" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2 fade-in-up" style={{ color: '#1e40af' }}>Bem-vindo</h1>
            <p className="text-[var(--muted)] text-center fade-in-up" style={{ animationDelay: '120ms' }}>
              Acesse o sistema para gerenciar sua produção de forma inteligente.
            </p>
          </div>
          <form className="w-full flex flex-col gap-6 mt-2 fade-in-up" style={{ animationDelay: '200ms' }} onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={user}
              onChange={e => setUser(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border bg-[var(--bg)] text-[var(--text)] focus:ring-2 outline-none transition-all duration-200 ${error ? styles['animate-shake'] + ' border-red-500 focus:border-red-500 focus:ring-red-200' : success && user ? styles['animate-success'] + ' border-green-500 focus:border-green-500 focus:ring-green-200' : 'border-[var(--accent)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'}`}
              autoComplete="email"
              disabled={loading}
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                value={pass}
                onChange={e => setPass(e.target.value)}
                className={`w-full px-4 py-3 pr-12 rounded-lg border bg-[var(--bg)] text-[var(--text)] focus:ring-2 outline-none transition-all duration-200 ${error ? styles['animate-shake'] + ' border-red-500 focus:border-red-500 focus:ring-red-200' : success && pass ? styles['animate-success'] + ' border-green-500 focus:border-green-500 focus:ring-green-200' : 'border-[var(--accent)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'}`}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-100"
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-bold text-lg shadow transition-colors duration-300 fade-in-up"
              style={{ animationDelay: '300ms' }}
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            {error && (
              <div className="text-red-600 text-center mt-2 animate-fadeInDown">Usuário ou senha incorretos</div>
            )}
            {success && (
              <div className="text-green-600 text-center mt-2 animate-fadeInUp">Login correto! Redirecionando...</div>
            )}
            {loading && <Spinner />}
          </form>
          <div className="mt-6 text-center fade-in-up" style={{ animationDelay: '400ms' }}>
            <Link to="/esqueceu-senha" className="inline-block transition-all duration-200 font-bold text-base text-blue-600 dark:text-blue-400 hover:-translate-y-0.5 hover:brightness-125">Esqueceu a senha?</Link>
          </div>
          <div className="mt-4 text-center fade-in-up" style={{ animationDelay: '450ms' }}>
            <span className="text-slate-700 dark:text-slate-300">Não tem uma conta? </span>
            <Link to="/cadastro-usuarios" className="inline-block font-bold text-base transition-all duration-200 text-blue-600 dark:text-blue-400 hover:-translate-y-0.5 hover:brightness-125">Cadastre-se aqui</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
