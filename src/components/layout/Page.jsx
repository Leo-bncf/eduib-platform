/**
 * Reusable page wrapper with consistent spacing and background
 */
import React from 'react';

export default function Page({
  children,
  bgGradient = true,
  className = '',
}) {
  return (
    <div
      className={`min-h-screen ${
        bgGradient
          ? 'bg-gradient-to-br from-slate-50 to-slate-100'
          : 'bg-slate-50'
      } p-4 md:p-6 ${className}`}
    >
      {children}
    </div>
  );
}