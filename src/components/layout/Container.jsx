/**
 * Reusable max-width container for pages
 */
import React from 'react';

export default function Container({
  children,
  maxWidth = 'max-w-7xl',
  className = '',
}) {
  return (
    <div className={`${maxWidth} mx-auto ${className}`}>
      {children}
    </div>
  );
}