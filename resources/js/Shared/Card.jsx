import React from 'react';

export default function Card({ children, className = '', compact = false, hover = false }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color-light)',
        borderRadius: 'var(--radius-lg)',
      }}
      className={`border bg-white shadow-sm transition-all duration-300 ${
        compact ? 'p-4' : 'p-6'
      } ${
        hover ? 'hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
