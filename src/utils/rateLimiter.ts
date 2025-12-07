/**
 * Rate Limiter - Controla a taxa de requisições
 * 
 * Previne que muitas requisições sejam feitas em um curto período de tempo
 */

interface RateLimitConfig {
  maxRequests: number;  // Número máximo de requisições
  windowMs: number;     // Janela de tempo em milissegundos
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private records: Map<string, RequestRecord> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = { maxRequests: 5, windowMs: 60000 }) {
    this.config = config;
  }

  /**
   * Verifica se a requisição pode ser feita
   * @param key - Identificador único (ex: 'createMachine', 'updateEmployee')
   * @returns true se pode fazer a requisição, false se excedeu o limite
   */
  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const record = this.records.get(key);

    // Se não existe registro ou o tempo resetou, criar novo
    if (!record || now > record.resetTime) {
      this.records.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return true;
    }

    // Se ainda está dentro do limite
    if (record.count < this.config.maxRequests) {
      record.count++;
      return true;
    }

    // Excedeu o limite
    console.warn(`[Rate Limiter] Limite excedido para "${key}". Tente novamente em ${Math.ceil((record.resetTime - now) / 1000)}s`);
    return false;
  }

  /**
   * Obtém o tempo restante até o reset (em segundos)
   */
  getTimeUntilReset(key: string): number {
    const record = this.records.get(key);
    if (!record) return 0;

    const now = Date.now();
    const remaining = Math.max(0, record.resetTime - now);
    return Math.ceil(remaining / 1000);
  }

  /**
   * Reseta o contador para uma chave específica
   */
  reset(key: string): void {
    this.records.delete(key);
  }

  /**
   * Reseta todos os contadores
   */
  resetAll(): void {
    this.records.clear();
  }

  /**
   * Obtém informações sobre o limite atual
   */
  getStatus(key: string): { remaining: number; resetIn: number } {
    const record = this.records.get(key);
    if (!record) {
      return {
        remaining: this.config.maxRequests,
        resetIn: 0
      };
    }

    const now = Date.now();
    if (now > record.resetTime) {
      return {
        remaining: this.config.maxRequests,
        resetIn: 0
      };
    }

    return {
      remaining: Math.max(0, this.config.maxRequests - record.count),
      resetIn: this.getTimeUntilReset(key)
    };
  }
}

// Instância global com configuração padrão
// 5 requisições por minuto
export const rateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60000 // 1 minuto
});

// Instância mais restritiva para operações críticas
// 3 requisições por minuto
export const strictRateLimiter = new RateLimiter({
  maxRequests: 3,
  windowMs: 60000
});

// Instância para operações de leitura (mais permissiva)
// 20 requisições por minuto
export const readRateLimiter = new RateLimiter({
  maxRequests: 20,
  windowMs: 60000
});

export default RateLimiter;
