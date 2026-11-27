import React, { useState } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Shared/Button';
import Modal from '@/Shared/Modal';
import PaymentUploadModal from '@/Shared/PaymentUploadModal';
import {
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  Clock,
  AlertCircle,
  UploadCloud,
  Phone,
  MessageCircle,
  GraduationCap,
  Eye,
  LoaderCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function ReviewQueue({
  comprobantes = { data: [] },
  leadsEnPromesa = [],
  catalogo = { programas: [], modulos_sueltos: [] }
}) {
  const { auth } = usePage().props;
  const user = auth?.user;
  const isAdmin = user?.rol?.nombre === 'Administrador';

  // Control de pestañas: 'promesas' (Prospectos en Promesa) o 'revision' (Cola de comprobantes)
  const [activeTab, setActiveTab] = useState('promesas');

  // Estado de aprobación con LOADER explícito
  const [approvingId, setApprovingId] = useState(null);

  // Modal para rechazar comprobante (solo Admin)
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedComprobante, setSelectedComprobante] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [rejectProcessing, setRejectProcessing] = useState(false);

  // Modal para ver foto/archivo de comprobante
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewComprobante, setPreviewComprobante] = useState(null);

  const handleOpenPreview = (c) => {
    setPreviewComprobante(c);
    setPreviewModalOpen(true);
  };

  // Modal para subir comprobante
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedLeadForUpload, setSelectedLeadForUpload] = useState(null);

  const handleOpenUpload = (lead) => {
    setSelectedLeadForUpload(lead);
    setUploadModalOpen(true);
  };

  // Modal para completar datos faltantes antes de matricular
  const [studentModalData, setStudentModalData] = useState(null);

  // Disparar Aprobación con feedback y Spinner
  const handleApprove = (c) => {
    const lead = c.lead;
    const missing = !lead?.ci || !lead?.fecha_nacimiento || !lead?.ciudad;

    if (missing) {
      setStudentModalData({
        comprobante: c,
        lead: lead,
        ci: lead?.ci || '',
        fecha_nacimiento: lead?.fecha_nacimiento ? lead.fecha_nacimiento.split('T')[0] : '',
        ciudad: lead?.ciudad || lead?.ciudad_expedido || '',
      });
      return;
    }

    if (confirm('¿Confirmar aprobación del comprobante y matricular en el microservicio de Proyecto 2?')) {
      setApprovingId(c.id_comprobante);
      router.post(`/pagos/${c.id_comprobante}/aprobar`, {}, {
        preserveScroll: true,
        onFinish: () => setApprovingId(null),
      });
    }
  };

  const handleStudentModalSubmit = (e) => {
    e.preventDefault();
    if (!studentModalData) return;
    const c = studentModalData.comprobante;
    setApprovingId(c.id_comprobante);

    router.post(`/pagos/${c.id_comprobante}/aprobar`, {
      ci: studentModalData.ci,
      fecha_nacimiento: studentModalData.fecha_nacimiento,
      ciudad: studentModalData.ciudad,
    }, {
      preserveScroll: true,
      onSuccess: () => setStudentModalData(null),
      onFinish: () => setApprovingId(null),
    });
  };

  const openRejectModal = (c) => {
    setSelectedComprobante(c);
    setMotivoRechazo('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    setRejectProcessing(true);

    router.post(`/pagos/${selectedComprobante.id_comprobante}/rechazar`, { motivo: motivoRechazo }, {
      preserveScroll: true,
      onSuccess: () => {
        setRejectModalOpen(false);
        setRejectProcessing(false);
      },
      onError: () => setRejectProcessing(false),
    });
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock size={12} />
            <span>Pendiente</span>
          </span>
        );
      case 'APROBADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={12} />
            <span>Aprobado</span>
          </span>
        );
      case 'RECHAZADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle size={12} />
            <span>Rechazado</span>
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-300">
            <AlertCircle size={12} />
            <span>Error en Matrícula</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {estado}
          </span>
        );
    }
  };

  const pendingCount = comprobantes?.data?.filter((c) => c.estado === 'PENDIENTE' || c.estado === 'ERROR')?.length || 0;

  return (
    <AppLayout>
      <Head title="Gestión y Revisión de Pagos" />

      <div className="space-y-6">

        {/* Cabecera Uniforme */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="text-blue-600" size={24} />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Revisión de Pagos
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
              {pendingCount} pendientes
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-800 font-semibold border border-cyan-200">
              {leadsEnPromesa.length} en promesa
            </span>
          </div>
        </div>

        {/* Loader Overlay de Aprobación */}
        {approvingId && (
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-center gap-3 animate-in fade-in">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
            <p className="text-xs sm:text-sm font-bold">Matriculando en microservicio de Proyecto 2...</p>
          </div>
        )}

        {/* 2. Selector de Pestañas Limpio */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('promesas')}
            className={`pb-3 px-5 text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'promesas'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock size={16} />
            <span>Prospectos en Promesa de Pago</span>
            <span className="ml-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
              {leadsEnPromesa.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('revision')}
            className={`pb-3 px-5 text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'revision'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText size={16} />
            <span>Cola de Comprobantes</span>
            {pendingCount > 0 && (
              <span className="ml-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                {pendingCount} pendientes
              </span>
            )}
          </button>
        </div>

        {/* PESTAÑA 1: PROSPECTOS EN PROMESA DE PAGO */}
        {activeTab === 'promesas' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="py-4 px-5 font-bold">Prospecto</th>
                    <th className="py-4 px-5 font-bold">Programas de Interés</th>
                    <th className="py-4 px-5 font-bold">Asesor</th>
                    <th className="py-4 px-5 font-bold text-center">Estado Comprobante</th>
                    <th className="py-4 px-5 font-bold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {leadsEnPromesa.length > 0 ? (
                    leadsEnPromesa.map((lead) => {
                      const cleanPhone = (lead.telefono || '').replace(/\D/g, '');

                      // Verificar si todos sus cursos ya tienen comprobante o están matriculados
                      const allBlocked = (lead.intereses || []).length > 0 && (lead.intereses || []).every((it) => {
                        const hasProof = lead.comprobantes?.some(
                          (c) => c.id_interes === it.id_interes && (c.estado === 'PENDIENTE' || c.estado === 'APROBADO')
                        );
                        return hasProof || it.estado === 'MATRICULADO';
                      });

                      const tieneComprobantePendiente = lead.comprobantes?.some((c) => c.estado === 'PENDIENTE');
                      const tieneComprobanteAprobado = lead.comprobantes?.some((c) => c.estado === 'APROBADO');

                      return (
                        <tr key={lead.id_lead} className="hover:bg-slate-50/80 transition">
                          {/* Prospecto */}
                          <td className="py-4 px-5">
                            <Link
                              href={`/leads/${lead.id_lead}`}
                              className="font-bold text-slate-900 hover:text-blue-600 block text-base"
                            >
                              {lead.nombre}
                            </Link>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                              <span>CI: {lead.ci || 'Sin CI'}</span>
                              <span>·</span>
                              <span className="font-mono">{lead.telefono || 'Sin teléfono'}</span>
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/591${cleanPhone}?text=Hola%20${encodeURIComponent(lead.nombre)},%20te%20escribimos%20de%20UNEXO.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700"
                                  title="Enviar WhatsApp"
                                >
                                  <MessageCircle size={14} />
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Intereses Académicos */}
                          <td className="py-4 px-5">
                            {lead.intereses && lead.intereses.length > 0 ? (
                              <div className="space-y-1.5 max-w-sm">
                                {lead.intereses.map((it) => (
                                  <div key={it.id_interes} className="flex items-center justify-between text-xs gap-2">
                                    <div className="flex items-center gap-1.5 truncate">
                                      <GraduationCap size={14} className="text-blue-600 shrink-0" />
                                      <span className="font-medium text-slate-800 truncate">
                                        {it.nombre_snapshot}
                                      </span>
                                    </div>
                                    <span
                                      className={`px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 ${
                                        it.estado === 'MATRICULADO'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : it.estado === 'EN_PAGO'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {it.estado || 'EN_SEGUIMIENTO'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">Sin intereses vinculados</span>
                            )}
                          </td>

                          {/* Asesor */}
                          <td className="py-4 px-5 text-xs text-slate-600">
                            {lead.vendedor?.nombre_completo || 'Bolsa Común'}
                          </td>

                          {/* Estado Comprobante */}
                          <td className="py-4 px-5 text-center">
                            {tieneComprobanteAprobado ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800">
                                <CheckCircle2 size={12} />
                                <span>Aprobado</span>
                              </span>
                            ) : tieneComprobantePendiente ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800">
                                <Clock size={12} />
                                <span>Pendiente</span>
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">Sin comprobante</span>
                            )}
                          </td>

                          {/* Acción */}
                          <td className="py-4 px-5 text-right">
                            {allBlocked ? (
                              <span
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-500 cursor-not-allowed"
                                title="Todos los cursos de este prospecto ya cuentan con comprobante en revisión o están matriculados"
                              >
                                <CheckCircle2 size={14} className="text-slate-400" />
                                <span>Comprobantes Subidos</span>
                              </span>
                            ) : (
                              <Button
                                variant="primary"
                                onClick={() => handleOpenUpload(lead)}
                                className="text-xs py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl inline-flex items-center gap-1.5 font-semibold"
                              >
                                <UploadCloud size={15} />
                                <span>Subir Comprobante</span>
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                        No hay prospectos actualmente en la etapa de <strong>Promesa de Pago</strong>.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: COLA DE COMPROBANTES SUBIDOS */}
        {activeTab === 'revision' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="py-4 px-5 font-bold">Fecha</th>
                    <th className="py-4 px-5 font-bold">Prospecto / Curso</th>
                    <th className="py-4 px-5 font-bold">Monto / Método</th>
                    <th className="py-4 px-5 font-bold">Comprobante</th>
                    <th className="py-4 px-5 font-bold text-center">Estado</th>
                    <th className="py-4 px-5 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {comprobantes?.data?.length > 0 ? (
                    comprobantes.data.map((c) => {
                      const isApproving = approvingId === c.id_comprobante;

                      return (
                        <tr key={c.id_comprobante} className="hover:bg-slate-50/80 transition">
                          
                          {/* Fecha */}
                          <td className="py-4 px-5 text-xs text-slate-500">
                            <span className="font-semibold text-slate-800 block">
                              {new Date(c.created_at).toLocaleDateString()}
                            </span>
                            <span>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </td>

                          {/* Prospecto y Curso */}
                          <td className="py-4 px-5">
                            <Link
                              href={`/leads/${c.lead?.id_lead}`}
                              className="font-bold text-slate-900 hover:text-blue-600 block text-base"
                            >
                              {c.lead?.nombre}
                            </Link>
                            {c.interes ? (
                              <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold mt-1">
                                <GraduationCap size={13} className="shrink-0" />
                                <span className="truncate max-w-xs">{c.interes.nombre_snapshot}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 block mt-0.5">Interés general</span>
                            )}
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              Asesor: {c.subido_por?.nombre_completo || 'Bolsa Común'}
                            </span>
                          </td>

                          {/* Monto y Método */}
                          <td className="py-4 px-5">
                            <span className="font-extrabold text-base text-slate-900 block">
                              {c.monto ? `Bs. ${Number(c.monto).toFixed(2)}` : 'Monto no declarado'}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                              {c.metodo_pago && (
                                <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                                  c.metodo_pago === 'QR' || c.metodo_pago === 'BILLETERA'
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : c.metodo_pago === 'TARJETA'
                                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {c.metodo_pago === 'QR' || c.metodo_pago === 'BILLETERA' ? 'PAGO QR' : c.metodo_pago === 'TARJETA' ? 'TARJETA STRIPE' : c.metodo_pago}
                                </span>
                              )}
                              {c.referencia_transaccion && (
                                <span className="font-mono text-slate-500">
                                  Ref: {c.referencia_transaccion}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Archivo Comprobante */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              {c.tipo_archivo === 'imagen' ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenPreview(c)}
                                  className="w-12 h-12 shrink-0 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 hover:ring-2 hover:ring-blue-500 transition cursor-pointer relative group"
                                  title="Ver comprobante"
                                >
                                  <img
                                    src={c.archivo_url}
                                    alt="Comprobante"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                    <Eye size={16} className="text-white" />
                                  </div>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenPreview(c)}
                                  className="w-12 h-12 shrink-0 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center text-red-600 hover:bg-red-100 transition cursor-pointer"
                                  title="Ver PDF"
                                >
                                  <FileText size={22} />
                                </button>
                              )}

                              <div className="flex flex-col text-xs">
                                <button
                                  type="button"
                                  onClick={() => handleOpenPreview(c)}
                                  className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-1 text-left cursor-pointer"
                                >
                                  <Eye size={13} />
                                  <span>Visualizar</span>
                                </button>
                                <a
                                  href={c.archivo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-slate-400 hover:text-slate-700 inline-flex items-center gap-1 mt-0.5"
                                >
                                  <span>Abrir</span>
                                  <ExternalLink size={10} />
                                </a>
                              </div>
                            </div>
                          </td>

                          {/* Estado */}
                          <td className="py-4 px-5 text-center">
                            {getStatusBadge(c.estado)}

                            {c.comentario_rechazo && (
                              <p className="text-xs text-rose-600 mt-1 max-w-xs mx-auto text-left leading-relaxed">
                                {c.comentario_rechazo}
                              </p>
                            )}

                            {c.envio_matricula && (
                              <div className="mt-2 text-xs">
                                {c.envio_matricula.estado === 'ENVIADO' ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                                    <CheckCircle2 size={12} />
                                    <span>Matriculado</span>
                                  </span>
                                ) : (
                                  <div className="space-y-1">
                                    <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium">
                                      <AlertCircle size={12} />
                                      <span>Error en Proyecto 2</span>
                                    </span>
                                    {isAdmin && (
                                      <button
                                        type="button"
                                        onClick={() => router.post(`/pagos/envios/${c.envio_matricula.id_envio}/reintentar`, {}, { preserveScroll: true })}
                                        className="text-[11px] text-blue-600 hover:underline font-semibold block mx-auto cursor-pointer"
                                      >
                                        ↻ Reintentar matrícula
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Acciones */}
                          <td className="py-4 px-5 text-right">
                            {c.estado === 'PENDIENTE' || c.estado === 'ERROR' ? (
                              isAdmin ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="secondary"
                                    onClick={() => openRejectModal(c)}
                                    disabled={isApproving}
                                    className="text-xs py-2 px-3 text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-xl"
                                  >
                                    Rechazar
                                  </Button>

                                  <Button
                                    variant="primary"
                                    onClick={() => handleApprove(c)}
                                    disabled={isApproving}
                                    className="text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                                  >
                                    {isApproving ? (
                                      <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Matriculando</span>
                                      </>
                                    ) : (
                                      <span>{c.estado === 'ERROR' ? 'Reintentar Aprobación' : 'Aprobar'}</span>
                                    )}
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-xs text-amber-600 font-medium">
                                  Esperando revisión de Administración
                                </span>
                              )
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">Revisado</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                        No hay comprobantes pendientes en la cola de revisión.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Modal Rechazar Comprobante */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => !rejectProcessing && setRejectModalOpen(false)}
        title="Rechazar Comprobante de Pago"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Ingresa la justificación de rechazo. El prospecto y el asesor podrán ver el motivo para corregir el comprobante.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Motivo de Rechazo <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ej. Imagen borrosa, el monto no coincide con el depósito bancario..."
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setRejectModalOpen(false)}
              disabled={rejectProcessing}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={rejectProcessing || !motivoRechazo.trim()}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
            >
              {rejectProcessing ? 'Rechazando...' : 'Confirmar Rechazo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Preview de Comprobante */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={`Comprobante: ${previewComprobante?.lead?.nombre || 'Prospecto'}`}
      >
        <div className="space-y-4">
          {previewComprobante?.tipo_archivo === 'imagen' ? (
            <div className="max-h-[70vh] overflow-auto rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center p-2">
              <img
                src={previewComprobante.archivo_url}
                alt="Comprobante"
                className="max-w-full h-auto object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <FileText size={48} className="text-red-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Documento PDF</p>
              <a
                href={previewComprobante?.archivo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700"
              >
                <span>Abrir PDF en pestaña nueva</span>
                <ExternalLink size={13} />
              </a>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setPreviewModalOpen(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Subir Comprobante */}
      {selectedLeadForUpload && (
        <PaymentUploadModal
          isOpen={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false);
            setSelectedLeadForUpload(null);
          }}
          lead={selectedLeadForUpload}
          catalogo={catalogo}
          onSuccess={() => {
            router.reload({ preserveScroll: true });
          }}
        />
      )}

      {/* Modal Completar Datos del Estudiante antes de Aprobar Matrícula */}
      {studentModalData && (
        <Modal
          isOpen={!!studentModalData}
          onClose={() => !approvingId && setStudentModalData(null)}
          title="Completar Datos para Formalizar Matrícula"
        >
          <div className="space-y-4">
            <div className="bg-slate-100 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs space-y-1.5 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Datos de contacto registrados (Solo lectura)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800 dark:text-slate-200">
                <div>
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Nombre:</span>{' '}
                  <strong className="font-bold text-slate-900 dark:text-slate-100">{studentModalData.lead?.nombre}</strong>
                </div>
                <div>
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Teléfono:</span>{' '}
                  <strong className="font-bold text-slate-900 dark:text-slate-100">{studentModalData.lead?.telefono || 'Sin teléfono'}</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Correo:</span>{' '}
                  <strong className="font-bold text-slate-900 dark:text-slate-100">{studentModalData.lead?.correo || 'Sin correo'}</strong>
                </div>
              </div>
            </div>

            <form onSubmit={handleStudentModalSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-heading)] mb-1">
                    Cédula de Identidad (CI) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 8765432"
                    value={studentModalData.ci}
                    onChange={(e) =>
                      setStudentModalData({ ...studentModalData, ci: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-color-dark)] text-xs rounded-[var(--radius-sm)] text-[var(--text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-heading)] mb-1">
                    Fecha de Nacimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={studentModalData.fecha_nacimiento}
                    onChange={(e) =>
                      setStudentModalData({
                        ...studentModalData,
                        fecha_nacimiento: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-color-dark)] text-xs rounded-[var(--radius-sm)] text-[var(--text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-heading)] mb-1">
                  Ciudad de Expedición / Residencia <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. Santa Cruz de la Sierra"
                  value={studentModalData.ciudad}
                  onChange={(e) =>
                    setStudentModalData({ ...studentModalData, ciudad: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-color-dark)] text-xs rounded-[var(--radius-sm)] text-[var(--text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-color-light)]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStudentModalData(null)}
                  disabled={!!approvingId}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!!approvingId}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {approvingId ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Matriculando</span>
                    </>
                  ) : (
                    <span>Guardar y Aprobar Matrícula</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
