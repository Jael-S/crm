import React, { useState, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import Modal from '@/Shared/Modal';
import Button from '@/Shared/Button';
import QRCode from 'qrcode';
import {
  UploadCloud,
  Tag,
  GraduationCap,
  CheckCircle2,
  FileText,
  CreditCard,
  QrCode,
  ShieldCheck,
  Lock,
  Sparkles
} from 'lucide-react';

export default function PaymentUploadModal({
  isOpen,
  onClose,
  lead,
  catalogo = { programas: [], modulos_sueltos: [] },
  onSuccess
}) {
  // Por defecto en 'TRANSFERENCIA' (comprobante físico) para la defensa con Ing. Miriam Quispe
  const [metodoPago, setMetodoPago] = useState('TRANSFERENCIA'); // 'QR', 'TARJETA', 'TRANSFERENCIA'
  const [qrImageUrl, setQrImageUrl] = useState('');
  
  // Datos Tarjeta Stripe
  const [tarjetaNumero, setTarjetaNumero] = useState('4242 4242 4242 4242');
  const [tarjetaExp, setTarjetaExp] = useState('12/28');
  const [tarjetaCvc, setTarjetaCvc] = useState('888');
  const [tarjetaTitular, setTarjetaTitular] = useState('');

  const [file, setFile] = useState(null);
  const [monto, setMonto] = useState('');
  const [selectedInterestId, setSelectedInterestId] = useState('');
  const [referenciaTransaccion, setReferenciaTransaccion] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Helper para buscar precio
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
        ? 'Comprobante en revisión'
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

  const selectedInterest = useMemo(() => {
    if (!selectedInterestId) return null;
    return interestStatusList.find((i) => String(i.id_interes) === String(selectedInterestId));
  }, [selectedInterestId, interestStatusList]);

  const calculation = useMemo(() => {
    if (!selectedInterest) {
      const baseTotal = interestStatusList
        .filter((i) => !i.bloqueado)
        .reduce((acc, curr) => acc + curr.precio, 0);

      return {
        baseTotal,
        porcentajeDescuento: 0,
        montoDescuento: 0,
        totalNeto: baseTotal,
      };
    }

    const base = selectedInterest.precio;
    const descObj = selectedInterest.descuento;
    const descPorc = descObj ? parseFloat(descObj.porcentaje || 0) : 0;
    const montoDesc = (base * descPorc) / 100;
    const total = Math.max(0, base - montoDesc);

    return {
      baseTotal: base,
      porcentajeDescuento: descPorc,
      montoDescuento: montoDesc,
      totalNeto: total,
    };
  }, [selectedInterest, interestStatusList]);

  // Inicializar al abrir
  useEffect(() => {
    if (isOpen && lead) {
      setFile(null);
      setErrors({});
      setTarjetaTitular(lead.nombre || '');
      const refCode = 'QR-' + Math.floor(100000 + Math.random() * 900000);
      setReferenciaTransaccion(refCode);

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

  // Generar Código QR Dinámico en vivo
  useEffect(() => {
    if (!lead || !calculation.totalNeto) return;

    const qrData = JSON.stringify({
      institucion: 'UNEXO FICCT UAGRM',
      concepto: selectedInterest?.nombre_snapshot || 'Postgrado FICCT',
      alumno: lead.nombre,
      monto_bob: calculation.totalNeto.toFixed(2),
      referencia: referenciaTransaccion,
    });

    QRCode.toDataURL(qrData, {
      width: 220,
      margin: 1,
      color: {
        dark: '#0a2540',
        light: '#ffffff',
      },
    })
      .then((url) => setQrImageUrl(url))
      .catch((err) => console.error('Error generando QR:', err));
  }, [calculation.totalNeto, referenciaTransaccion, selectedInterest, lead]);

  if (!lead) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (allInterestsBlocked) {
      alert('Todos los cursos de este prospecto ya cuentan con comprobante registrado.');
      return;
    }

    if (metodoPago === 'TRANSFERENCIA' && !file) {
      setErrors({ comprobante: 'Debes adjuntar el voucher del depósito o transferencia.' });
      return;
    }

    setProcessing(true);
    setErrors({});

    const formData = new FormData();
    if (file) formData.append('comprobante', file);
    if (monto) formData.append('monto', monto);
    if (selectedInterestId) formData.append('id_interes', selectedInterestId);
    formData.append('metodo_pago', metodoPago);

    if (metodoPago === 'TARJETA') {
      formData.append('referencia_transaccion', 'ch_stripe_' + Math.floor(100000 + Math.random() * 900000));
      formData.append('stripe_titular', tarjetaTitular || lead.nombre);
    } else if (metodoPago === 'QR') {
      formData.append('referencia_transaccion', referenciaTransaccion || ('QR-' + Math.floor(100000 + Math.random() * 900000)));
    } else {
      if (referenciaTransaccion) formData.append('referencia_transaccion', referenciaTransaccion);
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
      title="Gestión de Pago y Matrícula"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Cabecera del Prospecto */}
        <div className="bg-[var(--bg-highlight)] p-3 rounded-xl border border-[var(--border-color-light)] flex items-center justify-between">
          <div>
            <p className="font-bold text-sm text-[var(--text-heading)] leading-tight">
              {lead.nombre}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              CI: {lead.ci || 'Sin CI'} · WhatsApp: {lead.telefono || 'Sin teléfono'}
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-800">
            {lead.vendedor?.nombre_completo || 'Bolsa Común'}
          </span>
        </div>

        {/* Alerta si todos los cursos ya tienen comprobante */}
        {allInterestsBlocked ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Comprobantes ya registrados</p>
              <p className="text-emerald-700 mt-0.5">
                Todos los programas de este prospecto ya cuentan con comprobante en proceso de revisión o están formalmente matriculados en Proyecto 2.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* 1. Selector de Curso Específico */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Programa o Módulo a Cancelar
              </label>

              <select
                value={selectedInterestId}
                onChange={(e) => setSelectedInterestId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color-light)] rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
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
            </div>

            {/* 2. Tarjeta Resumen de Arancel */}
            <div className="p-3 bg-[var(--bg-highlight)] rounded-xl border border-[var(--border-color-light)] flex items-center justify-between">
              <div>
                <span className="text-xs text-[var(--text-muted)] block">Total a Pagar</span>
                {calculation.porcentajeDescuento > 0 && (
                  <span className="text-xs text-emerald-600 font-semibold">
                    Descuento {calculation.porcentajeDescuento}% aplicado
                  </span>
                )}
              </div>
              <div className="text-xl font-black text-blue-700">
                Bs. {calculation.totalNeto.toFixed(2)}
              </div>
            </div>

            {/* =========================================================================
                SECCIÓN BILLETERA VIRTUAL (QR / STRIPE) - COMENTADA PARA ING. MIRIAM QUISPE
                Para reactivar con el docente Evans: Descomentar desde aquí hasta el fin
                del bloque indicado abajo y cambiar metodoPago a 'QR'.
               ========================================================================= */}
            {/*
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Método de Pago
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMetodoPago('QR')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer border ${
                    metodoPago === 'QR'
                      ? 'bg-[#002855] text-white border-blue-600 shadow-sm'
                      : 'bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border-color-light)] hover:bg-slate-50'
                  }`}
                >
                  <QrCode size={18} />
                  <span>Pago con QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago('TARJETA')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer border ${
                    metodoPago === 'TARJETA'
                      ? 'bg-[#002855] text-white border-blue-600 shadow-sm'
                      : 'bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border-color-light)] hover:bg-slate-50'
                  }`}
                >
                  <CreditCard size={18} />
                  <span>Tarjeta Stripe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago('TRANSFERENCIA')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer border ${
                    metodoPago === 'TRANSFERENCIA'
                      ? 'bg-[#002855] text-white border-blue-600 shadow-sm'
                      : 'bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border-color-light)] hover:bg-slate-50'
                  }`}
                >
                  <FileText size={18} />
                  <span>Subir Voucher</span>
                </button>
              </div>
            </div>

            {metodoPago === 'QR' && (
              <div className="p-4 bg-[var(--bg-surface)] border-2 border-dashed border-blue-300 rounded-2xl flex flex-col items-center text-center space-y-3">
                <div className="p-2 bg-white rounded-xl shadow-md border border-slate-200">
                  {qrImageUrl ? (
                    <img src={qrImageUrl} alt="Código QR de Pago" className="w-44 h-44 object-contain" />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
                      Generando QR...
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-[var(--text-heading)]">
                    Escanea con tu Billetera Móvil o App Bancaria (Simple QR)
                  </div>
                  <div className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                    Ref: {referenciaTransaccion} · Monto: Bs. {calculation.totalNeto.toFixed(2)}
                  </div>
                </div>

                <div className="text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 font-medium">
                  El QR generado procesará automáticamente la matrícula en Proyecto 2 al confirmar.
                </div>
              </div>
            )}

            {metodoPago === 'TARJETA' && (
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-r from-slate-900 to-[#002855] text-white rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">
                      STRIPE CHECKOUT · FICCT
                    </span>
                    <span className="text-xs font-bold font-mono">VISA / MASTERCARD</span>
                  </div>

                  <div className="font-mono text-base tracking-widest mb-3">
                    {tarjetaNumero || '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Titular</span>
                      <span className="font-semibold">{tarjetaTitular || lead.nombre}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Expira</span>
                      <span className="font-mono font-semibold">{tarjetaExp || 'MM/AA'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                      Número de Tarjeta
                    </label>
                    <input
                      type="text"
                      value={tarjetaNumero}
                      onChange={(e) => setTarjetaNumero(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color-light)] rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                      Vencimiento (MM/AA)
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={tarjetaExp}
                      onChange={(e) => setTarjetaExp(e.target.value)}
                      placeholder="12/28"
                      className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color-light)] rounded-xl focus:outline-none focus:border-blue-500 font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                      CVC / Código de Seguridad
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={tarjetaCvc}
                      onChange={(e) => setTarjetaCvc(e.target.value)}
                      placeholder="•••"
                      className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color-light)] rounded-xl focus:outline-none focus:border-blue-500 font-mono text-center tracking-widest"
                    />
                  </div>
                </div>
              </div>
            )}
            */}
            {/* FIN SECCIÓN BILLETERA VIRTUAL COMENTADA */}

            {/* SUBIDA DE VOUCHER BANCARIO TRADICIONAL (ACTIVO PARA MIRIAM QUISPE) */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  N° de Referencia Bancaria
                </label>
                <input
                  type="text"
                  value={referenciaTransaccion}
                  onChange={(e) => setReferenciaTransaccion(e.target.value)}
                  placeholder="Ej. OP-981244"
                  className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color-light)] rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                  Archivo del Comprobante (JPG, PNG o PDF) *
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => setFile(e.target.files[0] || null)}
                  className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color-light)] rounded-xl file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 cursor-pointer"
                  required
                />
                {errors.comprobante && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{errors.comprobante}</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Botones de Acción */}
        <div className="pt-3 border-t border-[var(--border-color-light)] flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={processing}
            className="text-xs px-3.5 py-2"
          >
            {allInterestsBlocked ? 'Cerrar' : 'Cancelar'}
          </Button>

          {!allInterestsBlocked && (
            <Button
              type="submit"
              variant="primary"
              disabled={processing || selectedInterest?.bloqueado}
              className="text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              {processing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={15} />
                  <span>Registrar Voucher</span>
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
