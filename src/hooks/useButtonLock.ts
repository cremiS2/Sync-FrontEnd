import { useState, useCallback, useRef } from 'react';

interface UseButtonLockOptions {
  lockDuration?: number;  // Duração do bloqueio em ms (padrão: 2000ms)
  onLockExpire?: () => void;
}

interface UseButtonLockReturn {
  isLocked: boolean;
  lock: () => void;
  unlock: () => void;
  executeWithLock: <T>(fn: () => Promise<T>) => Promise<T>;
}

/**
 * Hook para travar botões após clique
 * 
 * Previne múltiplos cliques em botões de ação
 * 
 * @example
 * const { isLocked, executeWithLock } = useButtonLock({ lockDuration: 3000 });
 * 
 * const handleCreate = async () => {
 *   await executeWithLock(async () => {
 *     await createMachine(data);
 *   });
 * };
 * 
 * <button disabled={isLocked} onClick={handleCreate}>
 *   {isLocked ? 'Aguarde...' : 'Criar'}
 * </button>
 */
export function useButtonLock(options: UseButtonLockOptions = {}): UseButtonLockReturn {
  const { lockDuration = 2000, onLockExpire } = options;
  const [isLocked, setIsLocked] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lock = useCallback(() => {
    setIsLocked(true);

    // Limpar timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Desbloquear após o tempo especificado
    timeoutRef.current = setTimeout(() => {
      setIsLocked(false);
      onLockExpire?.();
    }, lockDuration);
  }, [lockDuration, onLockExpire]);

  const unlock = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLocked(false);
  }, []);

  const executeWithLock = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      if (isLocked) {
        throw new Error('Operação já em andamento. Aguarde...');
      }

      lock();
      try {
        const result = await fn();
        return result;
      } finally {
        // Mantém o botão travado pelo tempo configurado
        // mesmo após a operação terminar
      }
    },
    [isLocked, lock]
  );

  return {
    isLocked,
    lock,
    unlock,
    executeWithLock
  };
}

export default useButtonLock;
