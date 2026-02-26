/**
 * Reusable responsive card grid layout
 */
import React from 'react';

export default function CardGrid({
  children,
  cols = { base: 1, md: 2, lg: 3 },
  gap = 'gap-4 md:gap-6',
  className = '',
}) {
  const colClass =
    cols.lg === 2
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
      : cols.lg === 3
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      : cols.lg === 4
      ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-1';

  return (
    <div className={`grid ${colClass} ${gap} ${className}`}>
      {children}
    </div>
  );
}