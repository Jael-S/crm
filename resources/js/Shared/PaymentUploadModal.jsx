import React, { useState, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import Modal from '@/Shared/Modal';
import Button from '@/Shared/Button';
import Badge from '@/Shared/Badge';
import {
  UploadCloud,
  Tag,
  AlertTriangle,
  GraduationCap,
  DollarSign,
  FileText,
  User,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function PaymentUploadModal({
  isOpen,
  onClose,
  lead,
  catalogo = { programas: [], modulos_sueltos: [] },
  onSuccess
}) {
  const [file, setFile] = useState(null);
  const [monto, setMonto] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Helper para buscar el precio de un interés individual en el catálogo de API 2
  const findItemPrice = (interes) => {
    if (!interes || !catalogo) return 0;

    if (interes.tipo === 'PROGRAMA') {
      const versionId = String(interes.id_version_externo);
      for (const prog of (catalogo.programas || [])) {
        for (const ver of (prog.versiones || [])) {
          if (String(ver.id) === versionId) {
            return parseFloat(ver.precio ?? prog.precio_contado ?? 0);
          }
        }
      }
    } else if (interes.tipo === 'MODULO') {
      const moduloId = String(interes.id_modulo_externo);
      for (const mod of (catalogo.modulos_sueltos || [])) {
        if (String(mod.id) === moduloId) {
          return parseFloat(mod.precio ?? 0);
        }
      }
    }

    return 0;
  };

  // Desglose de precios y descuentos de los intereses del lead
  const calculation = useMemo(() => {
    if (!lead || !lead.intereses || lead.intereses.length === 0) {
      return {
        hasInterests: false,
        items: [],
        baseTotal: 0,
        porcentajeDescuento: 0,
        montoDescuento: 0,
        totalNeto: 0,
      };
    }

    const items = lead.intereses.map((item) => {
      const precio = findItemPrice(item);
      return {
        ...item,
        precio,
      };
    });

    const baseTotal = items.reduce((acc, curr) => acc + curr.precio, 0);

    const porcentajeDescuento = lead.descuento ? parseFloat(lead.descuento.porcentaje || 0) : 0;
    const montoDescuento = (baseTotal * porcentajeDescuento) / 100;
    const totalNeto = Math.max(0, baseTotal - montoDescuento);

    return {
      hasInterests: true,
      items,
      baseTotal,
      porcentajeDescuento,
      montoDescuento,
      totalNeto,
    };
  }, [lead, catalogo]);

  // Al abrir la modal con un lead, inicializar el campo editable monto con el total sugerido
  useEffect(() => {
    if (isOpen && lead) {
      setFile(null);
      setErrors({});
      if (calculation.totalNeto > 0) {
        setMonto(calculation.totalNeto.toFixed(2));
      } else {
        setMonto('');
      }
    }
  }, [isOpen, lead, calculation.totalNeto]);

  if (!lead) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setErrors({ comprobante: 'Debes seleccionar un archivo de comprobante (JPG, PNG, PDF o WEBP).' });
      return;
    }

    setProcessing(true);
    setErrors({});

    const formData = new FormData();
    formData.append('comprobante', file);
    if (monto) {
      formData.append('monto', monto);
    }

    router.post(`/leads/${lead.id_lead}/comprobantes`, formData, {
      preserveScroll: true,
      onSuccess: () => {
        setProcessing(false);
        onClose();
        if (onSuccess) onSuccess();
      },
      onError: (err) => {
        setProcessing(false);
        setErrors(err);
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !processing && onClose()}
      title="Registrar Comprobante de Pago Digital"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cabecera del Prospecto */}
        <div className="bg-[var(--bg-body)] p-3 rounded-[var(--radius-md)] border border-[var(--border-color-light)] flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <User size={15} className="text-[var(--brand-primary)]" />
              <span className="font-bold text-sm text-[var(--text-heading)]">
                {lead.nombre}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {lead.correo || 'Sin correo'} • Tel: {lead.telefono || 'Sin teléfono'}
            </p>
          </div>
          {lead.vendedor && (
            <Badge variant="info">
              Asesor: {lead.vendedor.nombre_completo}
            </Badge>
          )}
        </div>

        {/* Validación: Si no tiene intereses registrados */}
        {!calculation.hasInterests ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-[var(--radius-md)] text-amber-800 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              <span>Prospecto sin Interés Académico Registrado</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              El prospecto debe tener vinculado al menos un programa o módulo de interés para calcular los aranceles y validar la matrícula.
            </p>
            <div className="pt-1">
              <a
                href={`/leads/${lead.id_lead}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[var(--brand-primary)] hover:underline"
              >
                <span>Ir al perfil del prospecto para agregar interés</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ) : (
          /* Desglose de Precios, Descuentos y Total */
          <div className="space-y-2.5">
            <div className="border border-[var(--border-color-light)] rounded-[var(--radius-md)] overflow-hidden">
              <div className="bg-gray-50/70 px-3 py-2 border-b border-[var(--border-color-light)] flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-heading)] flex items-center gap-1.5">
                  <GraduationCap size={15} className="text-[var(--brand-primary)]" />
                  Interés(es) Académico(s) & Aranceles (API 2)
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">Precio Base</span>
              </div>
              <div className="p-3 space-y-2 divide-y divide-gray-100">
                {calculation.items.map((it, idx) => (
                  <div key={idx} className={`flex items-center justify-between text-xs ${idx > 0 ? 'pt-2' : ''}`}>
                    <div>
                      <span className="font-medium text-[var(--text-heading)] block">
                        {it.nombre_snapshot || (it.tipo === 'PROGRAMA' ? 'Programa Académico' : 'Módulo')}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                        {it.tipo}
                      </span>
                    </div>
                    <span className="font-semibold text-[var(--text-heading)]">
                      {it.precio > 0 ? `Bs. ${it.precio.toFixed(2)}` : <span className="text-gray-400 font-normal">Consultar catálogo</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fila de Resumen Económico */}
            <div className="p-3 bg-gray-50/60 rounded-[var(--radius-md)] border border-[var(--border-color-light)] space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span>Subtotal Arancel Base:</span>
                <span className="font-medium text-[var(--text-heading)]">
                  Bs. {calculation.baseTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-emerald-700">
                  <Tag size={13} />
                  <span>
                    Descuento {lead.descuento ? `(${lead.descuento.nombre} - ${calculation.porcentajeDescuento}%)` : '(Ninguno)'}:
                  </span>
                </span>
                <span className="font-semibold text-emerald-700">
                  {calculation.montoDescuento > 0
                    ? `- Bs. ${calculation.montoDescuento.toFixed(2)}`
                    : 'Bs. 0.00'}
                </span>
              </div>

              <div className="pt-2 border-t border-[var(--border-color-light)] flex items-center justify-between text-sm font-bold text-[var(--text-heading)]">
                <span>Monto Total Esperado:</span>
                <span className="text-emerald-600 text-base">
                  Bs. {calculation.totalNeto.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Errores del Backend */}
        {errors && Object.keys(errors).length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[var(--radius-sm)] flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <div>
              {Object.values(errors).map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          </div>
        )}

        {/* Input Monto Editable */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)]">
              Monto del Comprobante (Bs.) <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-[var(--text-muted)]">
              (Único campo editable)
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-500">
              Bs.
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--brand-primary)] font-semibold"
              required
            />
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Puedes ajustar este monto si el comprobante presenta un pago parcial o valor extraordinario.
          </p>
        </div>

        {/* Input File Comprobante */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1">
            Archivo del Comprobante <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,.webp"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 text-xs bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
            required
          />
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            Formatos válidos: Imagen (JPG, PNG, WEBP) o documento PDF (Máx. 5MB).
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="pt-3 border-t border-[var(--border-color-light)] flex justify-end gap-2">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={processing}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={processing || !calculation.hasInterests}
            className="bg-emerald-600 hover:bg-emerald-700 inline-flex items-center gap-1.5"
          >
            <UploadCloud size={16} />
            {processing ? 'Subiendo...' : 'Subir Comprobante'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
