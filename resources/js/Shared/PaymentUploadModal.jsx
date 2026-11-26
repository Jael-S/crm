import React, { useState, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import Modal from '@/Shared/Modal';
import Button from '@/Shared/Button';
import {
  UploadCloud,
  Tag,
  AlertTriangle,
  GraduationCap,
  Layers,
  CheckCircle2,
  FileText,
  CreditCard,
  QrCode,
  Building
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

  // Helper para buscar el precio de un interés individual en el catálogo
  const findItemPrice = (interes) => {
    if (!interes) return 0;
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
        for (const g of (mod.grupos || [])) {
          if (String(g.id) === moduloId) {
            return parseFloat(mod.precio ?? 0);
          }
        }
      }
    }
    return 0;
  };

  // Verificar cuáles intereses ya tienen comprobante subido o están matriculados
  const interestStatusList = useMemo(() => {
    if (!lead || !lead.intereses) return [];

    return lead.intereses.map((it) => {
      const comprobanteExistente = lead.comprobantes?.find(
        (c) => c.id_interes === it.id_interes && (c.estado === 'PENDIENTE' || c.estado === 'APROBADO')
      );
      const estaMatriculado = it.estado === 'MATRICULADO';
      const bloqueado = Boolean(comprobanteExistente) || estaMatriculado;
      const motivoBloqueo = estaMatriculado
        ? 'Ya Matriculado'
        : comprobanteExistente
        ? 'Comprobante ya en revisión'
        : null;

      return {
        ...it,
        precio: findItemPrice(it),
        bloqueado,
        motivoBloqueo,
      };
    });
  }, [lead, catalogo]);

  const allInterestsBlocked = useMemo(() => {
    return interestStatusList.length > 0 && interestStatusList.every((i) => i.bloqueado);
  }, [interestStatusList]);

  // Desglose del interés seleccionado
  const selectedInterest = useMemo(() => {
    if (!selectedInterestId) return null;
    return interestStatusList.find((i) => String(i.id_interes) === String(selectedInterestId));
  }, [selectedInterestId, interestStatusList]);

  const calculation = useMemo(() => {
    if (!selectedInterest) {
      const baseTotal = interestStatusList
        .filter((i) => !i.bloqueado)
        .reduce((acc, curr) => acc + curr.precio, 0);

      const desc = lead?.descuento ? parseFloat(lead.descuento.porcentaje || 0) : 0;
      const montoDesc = (baseTotal * desc) / 100;
      return {
        baseTotal,
        porcentajeDescuento: desc,
        montoDescuento: montoDesc,
        totalNeto: Math.max(0, baseTotal - montoDesc),
      };
    }

    const base = selectedInterest.precio;
    // Si el interés tiene su propio descuento específico
    const descObj = selectedInterest.descuento || lead?.descuento;
    const descPorc = descObj ? parseFloat(descObj.porcentaje || 0) : 0;
    const montoDesc = (base * descPorc) / 100;
    const total = Math.max(0, base - montoDesc);

    return {
      baseTotal: base,
      porcentajeDescuento: descPorc,
      montoDescuento: montoDesc,
      totalNeto: total,
    };
  }, [selectedInterest, interestStatusList, lead]);

  // Inicializar selección al abrir
  useEffect(() => {
    if (isOpen && lead) {
      setFile(null);
      setErrors({});
      // Seleccionar automáticamente el primer interés disponible que NO esté bloqueado
      const primerDisponible = interestStatusList.find((i) => !i.bloqueado);
      if (primerDisponible) {
        setSelectedInterestId(String(primerDisponible.id_interes));
      } else {
        setSelectedInterestId('');
      }
    }
  }, [isOpen, lead, interestStatusList]);

  useEffect(() => {
    if (calculation.totalNeto > 0) {
      setMonto(calculation.totalNeto.toFixed(2));
    } else {
      setMonto('');
    }
  }, [calculation.totalNeto]);

  if (!lead) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (allInterestsBlocked) {
      alert('Todos los cursos de este prospecto ya cuentan con comprobante registrado.');
      return;
    }
    if (!file) {
      setErrors({ comprobante: 'Debes adjuntar el archivo del comprobante (JPG, PNG o PDF).' });
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
      title="Registrar Comprobante de Pago"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Cabecera del Prospecto */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="font-bold text-base text-slate-900 leading-tight">
            {lead.nombre}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            CI: {lead.ci || 'Sin CI'} · Tel: {lead.telefono || 'Sin teléfono'} · Asesor: {lead.vendedor?.nombre_completo || 'Bolsa Común'}
          </p>
        </div>

        {/* Alerta si todos los cursos ya tienen comprobante */}
        {allInterestsBlocked ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-bold">Comprobantes ya registrados</p>
              <p className="text-xs text-emerald-700">
                Todos los programas de este prospecto ya cuentan con comprobante en proceso de revisión o están formalmente matriculados en Proyecto 2. No se requiere subir nuevos pagos por el momento.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* 1. Selector de Curso Específico */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <GraduationCap size={15} className="text-blue-600" />
                <span>¿Qué curso o módulo específico se cancela?</span>
                <span className="text-red-500">*</span>
              </label>

              <select
                value={selectedInterestId}
                onChange={(e) => setSelectedInterestId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-medium"
                required
              >
                {interestStatusList.map((it) => (
                  <option
                    key={it.id_interes}
                    value={it.id_interes}
                    disabled={it.bloqueado}
                  >
                    {it.nombre_snapshot} {it.bloqueado ? `— (${it.motivoBloqueo})` : `(Bs. ${it.precio.toFixed(2)})`}
                  </option>
                ))}
              </select>
              {selectedInterest?.bloqueado && (
                <p className="text-xs text-amber-600 mt-1 font-medium">
                  Este curso ya cuenta con un comprobante registrado. Selecciona otro programa pendiente.
                </p>
              )}
            </div>

            {/* 2. Tarjeta Resumen de Arancel */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Arancel de lista:</span>
                <span className="font-semibold text-slate-800">
                  Bs. {calculation.baseTotal.toFixed(2)}
                </span>
              </div>

              {calculation.porcentajeDescuento > 0 && (
                <div className="flex items-center justify-between text-sm text-emerald-700">
                  <span className="flex items-center gap-1">
                    <Tag size={14} />
                    <span>Descuento aplicado ({calculation.porcentajeDescuento}%):</span>
                  </span>
                  <span className="font-semibold">
                    - Bs. {calculation.montoDescuento.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-base font-bold text-slate-900">
                <span>Total a Pagar:</span>
                <span className="text-blue-700 text-lg">
                  Bs. {calculation.totalNeto.toFixed(2)}
                </span>
              </div>
            </div>

            {/* 3. Método de Pago y Referencia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Método de Pago
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                  <option value="QR">Pago con QR Simple</option>
                  <option value="TARJETA">Tarjeta de Débito / Crédito</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  N° de Referencia / Comprobante
                </label>
                <input
                  type="text"
                  placeholder="Ej. OP-981244"
                  value={referenciaTransaccion}
                  onChange={(e) => setReferenciaTransaccion(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            {/* 4. Archivo del Comprobante */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Archivo del Comprobante <span className="text-red-500">*</span></span>
                <span className="text-slate-400 font-normal text-[11px]">JPG, PNG, PDF (Máx 5MB)</span>
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setFile(e.target.files[0] || null)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                required
              />
              {errors.comprobante && (
                <p className="text-xs text-red-600 mt-1 font-medium">{errors.comprobante}</p>
              )}
            </div>
          </>
        )}

        {/* Acciones */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={processing}
            className="text-sm px-4 py-2"
          >
            {allInterestsBlocked ? 'Cerrar' : 'Cancelar'}
          </Button>

          {!allInterestsBlocked && (
            <Button
              type="submit"
              variant="primary"
              disabled={processing || selectedInterest?.bloqueado}
              className="text-sm px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center gap-2"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  <span>Registrar Comprobante</span>
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
