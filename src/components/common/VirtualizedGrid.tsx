import React, { useEffect, useState, useRef, useMemo } from 'react';

interface ResponsiveGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  gap?: number;
  className?: string;
  enableVirtualization?: boolean;
}

/**
 * Grid responsivo com virtualização opcional
 * Renderiza apenas itens visíveis para melhor performance
 */
function ResponsiveGrid<T>({
  items,
  renderItem,
  gap = 32,
  className = '',
  enableVirtualization = true
}: ResponsiveGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [containerWidth, setContainerWidth] = useState(1200);

  // Calcular número de colunas responsivamente
  const columnCount = useMemo(() => {
    let cols = 4; // Desktop padrão
    if (containerWidth < 640) cols = 1; // Mobile
    else if (containerWidth < 768) cols = 1; // Mobile landscape  
    else if (containerWidth < 1024) cols = 2; // Tablet
    else if (containerWidth < 1280) cols = 3; // Laptop
    else if (containerWidth < 1536) cols = 4; // Desktop
    else cols = 5; // Large desktop
    return cols;
  }, [containerWidth]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
    };
  }, []);

  // Virtualização com Intersection Observer
  useEffect(() => {
    if (!enableVirtualization) {
      setVisibleRange({ start: 0, end: items.length });
      return;
    }

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;
      const itemHeight = 400; // Altura aproximada do card
      const rowHeight = itemHeight + gap;
      
      const startRow = Math.max(0, Math.floor((scrollTop - 200) / rowHeight));
      const endRow = Math.ceil((scrollTop + viewportHeight + 200) / rowHeight);
      
      const start = startRow * columnCount;
      const end = Math.min(items.length, (endRow + 1) * columnCount);
      
      setVisibleRange({ start, end });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items.length, columnCount, gap, enableVirtualization]);

  const visibleItems = enableVirtualization 
    ? items.slice(visibleRange.start, visibleRange.end)
    : items;

  // Calcular a classe do grid responsivo
  const gridClass = useMemo(() => {
    const baseClass = 'grid gap-8';
    return `${baseClass} grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5`;
  }, []);

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nenhum item encontrado
        </div>
      ) : (
        <div className={gridClass}>
          {visibleItems.map((item, idx) => (
            <div key={visibleRange.start + idx}>
              {renderItem(item, visibleRange.start + idx)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResponsiveGrid;
