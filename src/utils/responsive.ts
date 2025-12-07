/**
 * Utilitários para responsividade consistente em todo o projeto
 * Breakpoints alinhados com Tailwind CSS
 */

export const BREAKPOINTS = {
  xs: 480,   // Mobile small
  sm: 640,   // Mobile
  md: 768,   // Tablet
  lg: 1024,  // Laptop
  xl: 1280,  // Desktop
  '2xl': 1536, // Large desktop
  '3xl': 1920  // Ultra wide
} as const;

export const MEDIA_QUERIES = {
  xs: `(min-width: ${BREAKPOINTS.xs}px)`,
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']}px)`,
  '3xl': `(min-width: ${BREAKPOINTS['3xl']}px)`,
} as const;

/**
 * Hook para detectar tamanho da tela
 */
export const useBreakpoint = () => {
  if (typeof window === 'undefined') return 'lg';
  
  const width = window.innerWidth;
  
  if (width < BREAKPOINTS.sm) return 'xs';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  if (width < BREAKPOINTS['2xl']) return 'xl';
  return '2xl';
};

/**
 * Classes de padding responsivo
 */
export const RESPONSIVE_PADDING = {
  page: 'px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10',
  section: 'p-4 sm:p-6 md:p-8 lg:p-10',
  card: 'p-4 sm:p-6 md:p-8',
  small: 'p-2 sm:p-3 md:p-4',
} as const;

/**
 * Classes de gap responsivo
 */
export const RESPONSIVE_GAP = {
  small: 'gap-2 sm:gap-3 md:gap-4',
  medium: 'gap-3 sm:gap-4 md:gap-6 lg:gap-8',
  large: 'gap-4 sm:gap-6 md:gap-8 lg:gap-10',
} as const;

/**
 * Classes de texto responsivo
 */
export const RESPONSIVE_TEXT = {
  h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
  h2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
  h3: 'text-lg sm:text-xl md:text-2xl lg:text-3xl',
  h4: 'text-base sm:text-lg md:text-xl',
  body: 'text-sm sm:text-base',
  small: 'text-xs sm:text-sm',
} as const;

/**
 * Configuração de grid responsivo
 */
export const RESPONSIVE_GRID = {
  cards: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
  kpis: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  form: 'grid grid-cols-1 md:grid-cols-2',
  auto: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
} as const;

/**
 * Verifica se está em modo mobile
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.md;
};

/**
 * Verifica se está em modo tablet
 */
export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg;
};

/**
 * Verifica se está em modo desktop
 */
export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= BREAKPOINTS.lg;
};
