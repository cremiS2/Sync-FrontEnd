import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '../../services/auth';
import styles from '../../styles/modules/Login.module.css';

const Spinner = () => (
  <div className="flex justify-center items-center mt-4">
    <svg className="animate-spin h-8 w-8 text-[var(--primary)]" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  </div>
);

const CadastroUsuarios: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validações
    if (!fullName || !email || !username || !password || !confirmPassword) {
      setError('Todos os campos são obrigatórios');
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Cadastrando usuário:', { fullName, email, username });
      
      // Chamada real para a API de cadastro
      await signIn({
        email,
        password,
        fullName,
        username,
        roles: ['OPERADOR'] // Role padrão (você pode alterar no banco de dados depois)
      });
      
      setSuccess(true);
      setError('');
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      
      // Mensagens de erro mais específicas
      if (err?.response?.data?.errors) {
        // Se houver erros de validação, mostre o primeiro
        const firstError = Object.values(err.response.data.errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError('Erro ao criar conta. Verifique os dados e tente novamente.');
      }
      
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className="flex-1 w-full flex items-center justify-center fade-in">
        <div className={styles.formBox}>
          <div className="mb-8 flex flex-col items-center">
            <div className={styles.logo}>
              <svg width="36" height="36" fill="none" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="22" stroke="white" strokeWidth="4" />
                <path d="M16 24l6 6 10-10" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[var(--primary)] mb-2 fade-in-up">Criar Conta</h1>
            <p className="text-[var(--muted)] text-center fade-in-up" style={{ animationDelay: '120ms' }}>
              Preencha os dados abaixo para criar sua conta no sistema.
            </p>
          </div>
          <form className="w-full flex flex-col gap-4 mt-2 fade-in-up" style={{ animationDelay: '200ms' }} onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nome Completo"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border bg-[var(--bg)] text-[var(--text)] focus:ring-2 outline-none transition-all duration-200 ${error ? styles['animate-shake'] + ' border-red-500 focus:border-red-500 focus:ring-red-200' : success && fullName ? styles['animate-success'] + ' border-green-500 focus:border-green-500 focus:ring-green-200' : 'border-[var(--accent)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'}`}
              disabled={loading}
            />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border bg-[var(--bg)] text-[var(--text)] focus:ring-2 outline-none transition-all duration-200 ${error ? styles['animate-shake'] + ' border-red-500 focus:border-red-500 focus:ring-red-200' : success && email ? styles['animate-success'] + ' border-green-500 focus:border-green-500 focus:ring-green-200' : 'border-[var(--accent)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'}`}
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Nome de Usuário"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border bg-[var(--bg)] text-[var(--text)] focus:ring-2 outline-none transition-all duration-200 ${error ? styles['animate-shake'] + ' border-red-500 focus:border-red-500 focus:ring-red-200' : success && username ? styles['animate-success'] + ' border-green-500 focus:border-green-500 focus:ring-green-200' : 'border-[var(--accent)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'}`}
              autoComplete="username"
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border bg-[var(--bg)] text-[var(--text)] focus:ring-2 outline-none transition-all duration-200 ${error ? styles['animate-shake'] + ' border-red-500 focus:border-red-500 focus:ring-red-200' : success && password ? styles['animate-success'] + ' border-green-500 focus:border-green-500 focus:ring-green-200' : 'border-[var(--accent)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'}`}
              autoComplete="new-password"
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Confirmar Senha"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border bg-[var(--bg)] text-[var(--text)] focus:ring-2 outline-none transition-all duration-200 ${error ? styles['animate-shake'] + ' border-red-500 focus:border-red-500 focus:ring-red-200' : success && confirmPassword ? styles['animate-success'] + ' border-green-500 focus:border-green-500 focus:ring-green-200' : 'border-[var(--accent)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'}`}
              autoComplete="new-password"
              disabled={loading}
            />
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-bold text-lg shadow transition-colors duration-300 fade-in-up"
              style={{ animationDelay: '300ms' }}
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
            {error && (
              <div className="text-red-600 text-center mt-2 animate-fadeInDown">{error}</div>
            )}
            {success && (
              <div className="text-green-600 text-center mt-2 animate-fadeInUp">Conta criada com sucesso! Redirecionando...</div>
            )}
            {loading && <Spinner />}
          </form>
          <div className="mt-6 text-center fade-in-up" style={{ animationDelay: '400ms' }}>
            <span className="text-[var(--muted)]">Já tem uma conta? </span>
            <Link to="/login" className="text-[var(--primary)] hover:underline font-semibold transition-all duration-200">Faça login</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CadastroUsuarios;
