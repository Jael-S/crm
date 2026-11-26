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
  ExternalLink,
  Layers,
  CreditCard
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
  const [selectedInterestId, setSelectedInterestId] = useState('');
  const [metodoPago, setMetodoPago] = useState('TRANSFERENCIA');
  const [referenciaTransaccion, setReferenciaTransaccion] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Helper para buscar el precio de un interés individual en el catálogo de API 2
  const findItemPrice = (interes) => {
    if (!interes || !catalogo) return 0;

    // Si el interés ya tiene un monto pactado guardado en BD, usarlo directamente
    if (interes.monto_pactado && parseFloat(interes.monto_pactado) > 0) {
      return parseFloat(interes.monto_pactado);
    }

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

    // Si el usuario seleccionó un interés específico, calcular solo sobre ese interés
    const activeItems = selectedInterestId
      ? items.filter((it) => String(it.id_interes) === String(selectedInterestId))
      : items;

    const baseTotal = activeItems.reduce((acc, curr) => acc + curr.precio, 0);

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
  }, [lead, catalogo, selectedInterestId]);

  // Al abrir la modal o cambiar el interés, inicializar el campo editable monto
  useEffect(() => {
    if (isOpen && lead) {
      setFile(null);
      setErrors({});
      // Si el lead tiene intereses, por defecto seleccionar el primero que no esté matriculado
      if (!selectedInterestId && lead.intereses?.length > 0) {
        const pendiente = lead.intereses.find((i) => i.estado !== 'MATRICULADO') || lead.intereses[0];
        setSelectedInterestId(String(pendiente.id_interes));
      }
    }
  }, [isOpen, lead]);

  useEffect(() => {
    if (calculation.totalNeto > 0) {
      setMonto(calculation.totalNeto.toFixed(2));
    } else {
      setMonto('');
    }
  }, [calculation.totalNeto, selectedInterestId]);

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
    if (monto) formData.append('monto', monto);
    if (selectedInterestId) formData.append('id_interes', selectedInterestId);
    if (metodoPago) formData.append('metodo_pago', metodoPago);
    if (referenciaTransaccion) formData.append('referencia_transaccion', referenciaTransaccion);

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

        {/* Validación de Intereses */}
        {!calculation.hasInterests ? (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-[var(--radius-sm)] flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-semibold">Sin programas de interés vinculados</p>
              <p className="mt-0.5">
                Para registrar un pago, primero debes vincular al menos un programa o módulo en la ficha del prospecto.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Selector de Interés Específico (RF1.3) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1 flex items-center gap-1.5">
                <Layers size={13} className="text-[var(--brand-primary)]" />
                <span>¿A qué programa o módulo corresponde este pago?</span>
                <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedInterestId}
                onChange={(e) => setSelectedInterestId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--brand-primary)] font-medium"
              >
                <option value="">-- Pago Integral (Todos los cursos pendientes) --</option>
                {lead.intereses?.map((it) => (
                  <option key={it.id_interes} value={it.id_interes}>
                    [{it.tipo}] {it.nombre_snapshot} {it.estado === 'MATRICULADO' ? '(YA MATRICULADO)' : `(${it.estado})`}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Permite asociar el pago específicamente a un diplomado o módulo cuando el prospecto tiene múltiples intereses simultáneos.
              </p>
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
                <span>Monto a Cancelar Sugerido:</span>
                <span className="text-emerald-600 text-base">
                  Bs. {calculation.totalNeto.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Método de Pago y Referencia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1 flex items-center gap-1">
                  <CreditCard size={13} />
                  <span>Método de Pago</span>
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="TRANSFERENCIA">Transferencia Bancaria / Depósito</option>
                  <option value="QR">Pago QR Simple</option>
                  <option value="TARJETA">Tarjeta de Débito / Crédito</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1">
                  N° Comprobante / Referencia
                </label>
                <input
                  type="text"
                  placeholder="Ej: BNB-TR-998822"
                  value={referenciaTransaccion}
                  onChange={(e) => setReferenciaTransaccion(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--brand-primary)]"
                />
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
              Monto Pagado Declarado (Bs.) <span className="text-red-500">*</span>
            </label>
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
        </div>

        {/* Input File Comprobante */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1">
            Archivo del Comprobante (Voucher) <span className="text-red-500">*</span>
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
