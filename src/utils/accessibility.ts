/**
 * Utilitários de Acessibilidade
 * Funções para melhorar a acessibilidade do aplicativo
 */

/**
 * Gerencia o foco em modais
 * Captura o foco dentro do modal e retorna ao elemento anterior ao fechar
 */
export class FocusTrap {
  private previousFocus: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];
  private container: HTMLElement | null = null;

  constructor(containerSelector: string) {
    this.container = document.querySelector(containerSelector);
  }

  activate() {
    if (!this.container) return;

    // Salvar elemento com foco atual
    this.previousFocus = document.activeElement as HTMLElement;

    // Encontrar todos os elementos focáveis
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    this.focusableElements = Array.from(
      this.container.querySelectorAll(focusableSelectors)
    );

    // Focar no primeiro elemento
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }

    // Adicionar listener para Tab
    document.addEventListener('keydown', this.handleKeyDown);
  }

  deactivate() {
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // Retornar foco ao elemento anterior
    if (this.previousFocus) {
      this.previousFocus.focus();
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
}

/**
 * Anuncia mensagens para leitores de tela
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remover após 1 segundo
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Verifica se o contraste entre duas cores é adequado
 * Retorna true se o contraste for >= 4.5:1 (WCAG AA)
 */
export const hasGoodContrast = (foreground: string, background: string): boolean => {
  const getLuminance = (color: string): number => {
    // Converter hex para RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calcular luminância relativa
    const [rs, gs, bs] = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return ratio >= 4.5;
};

/**
 * Gera um ID único para associar labels a inputs
 */
export const generateA11yId = (prefix: string = 'a11y'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Adiciona suporte a navegação por teclado em elementos customizados
 */
export const makeKeyboardAccessible = (
  element: HTMLElement,
  onClick: () => void,
  role: string = 'button'
) => {
  element.setAttribute('role', role);
  element.setAttribute('tabindex', '0');

  element.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  });
};

/**
 * Verifica se o usuário prefere movimento reduzido
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Cria um skip link para navegação rápida
 */
export const createSkipLink = (targetId: string, text: string = 'Pular para o conteúdo principal') => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white';
  
  document.body.insertBefore(skipLink, document.body.firstChild);
};

/**
 * Valida se um elemento tem texto alternativo adequado
 */
export const hasProperAltText = (img: HTMLImageElement): boolean => {
  const alt = img.getAttribute('alt');
  
  // Imagens decorativas devem ter alt=""
  if (img.getAttribute('role') === 'presentation' || img.getAttribute('aria-hidden') === 'true') {
    return alt === '';
  }
  
  // Imagens informativas devem ter alt descritivo
  return alt !== null && alt.trim().length > 0 && alt.trim().length < 150;
};

/**
 * Adiciona descrição acessível a um elemento
 */
export const addAriaDescription = (element: HTMLElement, description: string) => {
  const descId = generateA11yId('desc');
  const descElement = document.createElement('span');
  descElement.id = descId;
  descElement.className = 'sr-only';
  descElement.textContent = description;
  
  element.appendChild(descElement);
  element.setAttribute('aria-describedby', descId);
};

/**
 * Gerencia estado de loading acessível
 */
export const setLoadingState = (element: HTMLElement, isLoading: boolean, loadingText: string = 'Carregando...') => {
  if (isLoading) {
    element.setAttribute('aria-busy', 'true');
    element.setAttribute('aria-label', loadingText);
  } else {
    element.removeAttribute('aria-busy');
    element.removeAttribute('aria-label');
  }
};

/**
 * Valida se um formulário tem labels adequados
 */
export const validateFormAccessibility = (form: HTMLFormElement): string[] => {
  const errors: string[] = [];
  const inputs = form.querySelectorAll('input, select, textarea');
  
  inputs.forEach((input) => {
    const id = input.getAttribute('id');
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');
    const label = id ? form.querySelector(`label[for="${id}"]`) : null;
    
    if (!label && !ariaLabel && !ariaLabelledBy) {
      errors.push(`Campo sem label: ${input.getAttribute('name') || 'sem nome'}`);
    }
  });
  
  return errors;
};
