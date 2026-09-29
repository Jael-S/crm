import React from 'react';
import Button from '@/Shared/Button';
import { AlertCircle, HelpCircle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Confirmar acción?',
  message = '¿Estás seguro de realizar esta acción?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary', // 'primary' | 'danger' | 'warning' | 'purple'
  icon: CustomIcon,
  processing = false,
}) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-red-50 text-red-600 border-red-100',
          btnVariant: 'danger',
          defaultIcon: AlertCircle,
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
          btnVariant: 'warning',
          defaultIcon: AlertCircle,
        };
      case 'brand':
        return {
          iconBg: 'bg-[#ebf0f9] text-[var(--brand-primary)] border-[#d5ddea]',
          btnVariant: 'primary',
          confirmBtnClass: 'bg-[var(--brand-primary)] hover:bg-[#32467d] text-white',
          defaultIcon: HelpCircle,
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
          btnVariant: 'primary',
          confirmBtnClass: 'bg-purple-600 hover:bg-purple-700 text-white',
          defaultIcon: HelpCircle,
        };
      case 'primary':
      default:
        return {
          iconBg: 'bg-blue-50 text-[var(--color-primary)] border-blue-100',
          btnVariant: 'primary',
          defaultIcon: HelpCircle,
        };
    }
  };

  const { iconBg, btnVariant, confirmBtnClass, defaultIcon } = getVariantStyles();
  const IconComponent = CustomIcon || defaultIcon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-color-light)] shadow-2xl p-6 relative animate-in zoom-in-95 duration-150"
        style={{ borderRadius: 'var(--radius-xl)' }}
      >
        {/* Botón cerrar esquina */}
        <button
          onClick={onClose}
          disabled={processing}
          className="absolute right-4 top-4 text-[var(--color-secondary)] hover:text-[var(--text-heading)] p-1 rounded-full hover:bg-gray-100 transition"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          {/* Icono temático */}
          <div className={`p-3 rounded-full border ${iconBg} shrink-0`}>
            <IconComponent size={24} />
          </div>

          {/* Contenido de texto */}
          <div className="space-y-1.5 flex-1 pr-4">
            <h3 className="text-base font-bold text-[var(--text-heading)] leading-snug">
              {title}
            </h3>
            <p className="text-xs text-[var(--text-main)] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-6 pt-4 border-t border-[var(--border-color-light)] flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={processing}
            className="text-xs py-2 px-4"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={btnVariant}
            onClick={onConfirm}
            disabled={processing}
            className={`text-xs py-2 px-4 ${confirmBtnClass || ''}`}
          >
            {processing ? 'Procesando...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
