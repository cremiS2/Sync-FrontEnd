/**
 * Sistema de cache simples para otimizar carregamento de dados
 * Evita requisições desnecessárias à API
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class DataCache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number; // Time to live em milissegundos
  private storageKey = '__sync_cache__';

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutos padrão
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    // Tentar restaurar do localStorage
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const obj = JSON.parse(raw) as Record<string, CacheEntry<any>>;
        Object.entries(obj).forEach(([k, v]) => this.cache.set(k, v));
      }
    } catch {}
  }

  /**
   * Armazena dados no cache
   */
  set<T>(key: string, data: T): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now()
    };
    this.cache.set(key, entry);
    this.persist();
  }

  /**
   * Recupera dados do cache se ainda válidos
   */
  get<T>(key: string, ttl?: number): T | null {
    // Lazy load do localStorage se não estiver em memória
    let entry = this.cache.get(key);
    if (!entry) {
      try {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const obj = JSON.parse(raw) as Record<string, CacheEntry<any>>;
          if (obj[key]) {
            entry = obj[key] as CacheEntry<T>;
            this.cache.set(key, entry);
          }
        }
      } catch {}
    }
    if (!entry) return null;

    const maxAge = ttl || this.defaultTTL;
    const age = Date.now() - entry.timestamp;

    if (age > maxAge) {
      // Cache expirado
      this.cache.delete(key);
      this.persist();
      return null;
    }

    return entry.data as T;
  }

  /**
   * Verifica se existe cache válido
   */
  has(key: string, ttl?: number): boolean {
    return this.get(key, ttl) !== null;
  }

  /**
   * Remove um item do cache
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    this.persist();
  }

  /**
   * Remove múltiplos itens do cache por padrão
   */
  invalidatePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
    this.persist();
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
    try { localStorage.removeItem(this.storageKey); } catch {}
  }

  /**
   * Retorna o tamanho do cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Persiste o cache atual no localStorage
   */
  private persist() {
    try {
      const obj: Record<string, CacheEntry<any>> = {};
      this.cache.forEach((v, k) => { obj[k] = v; });
      localStorage.setItem(this.storageKey, JSON.stringify(obj));
    } catch {}
  }
}

// Instância global do cache
export const dataCache = new DataCache();

// Chaves de cache pré-definidas
export const CACHE_KEYS = {
  EMPLOYEES: 'employees',
  MACHINES: 'machines',
  DEPARTMENTS: 'departments',
  SECTORS: 'sectors',
  ALLOCATIONS: 'allocations',
  MAINTENANCES: 'maintenances'
};

// Helper para prefetch assíncrono com cache
export async function prefetch<T>(key: string, fetcher: () => Promise<T>, ttlMs?: number) {
  const cached = dataCache.get<T>(key, ttlMs);
  if (cached) return cached;
  const data = await fetcher();
  dataCache.set(key, data);
  return data;
}
