import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-color-light)] shadow-2xl p-6 relative animate-in zoom-in-95 duration-150"
        style={{ borderRadius: 'var(--radius-xl)' }}
      >
        <div className="flex justify-between items-center pb-3 border-b border-[var(--border-color-light)] mb-4">
          <h3 className="text-base font-bold text-[var(--text-heading)]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-secondary)] hover:text-[var(--text-heading)] p-1 rounded-full hover:bg-gray-100 transition cursor-pointer text-sm font-bold"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}