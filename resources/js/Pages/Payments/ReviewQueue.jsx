import React, { useState } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Shared/Card';
import Button from '@/Shared/Button';
import Badge from '@/Shared/Badge';
import Modal from '@/Shared/Modal';
import PaymentUploadModal from '@/Shared/PaymentUploadModal';
import {
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  Clock,
  User,
  AlertCircle,
  UploadCloud,
  DollarSign,
  Phone,
  MessageCircle,
  Tag,
  GraduationCap,
  Layers,
  ArrowRight,
  Eye,
  Image as ImageIcon
} from 'lucide-react';

export default function ReviewQueue({
  comprobantes = { data: [] },
  leadsEnPromesa = [],
  catalogo = { programas: [], modulos_sueltos: [] }
}) {
  const { auth } = usePage().props;
  const user = auth?.user;
  const isAdmin = user?.rol?.nombre === 'Administrador';

  // Control de pestañas: 'promesas' (Prospectos esperando comprobante) o 'revision' (Cola de comprobantes)
  const [activeTab, setActiveTab] = useState('promesas');

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

  // Modal para subir comprobante enriquecido
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedLeadForUpload, setSelectedLeadForUpload] = useState(null);

  const handleOpenUpload = (lead) => {
    setSelectedLeadForUpload(lead);
    setUploadModalOpen(true);
  };

  const handleApprove = (id) => {
    if (confirm('¿Confirmar aprobación del comprobante? Esta acción avanzará al prospecto a Convertido y enviará los datos de matrícula a la API externa.')) {
      router.post(`/pagos/${id}/aprobar`, {}, { preserveScroll: true });
    }
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
      onSuccess: () => {
        setRejectModalOpen(false);
        setRejectProcessing(false);
      },
      onError: () => setRejectProcessing(false),
    });
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return <Badge variant="warning">Pendiente de Revisión</Badge>;
      case 'APROBADO': return <Badge variant="success">Aprobado</Badge>;
      case 'RECHAZADO': return <Badge variant="danger">Rechazado</Badge>;
      case 'ERROR': return <Badge variant="danger">Error en Matrícula (No Aprobado)</Badge>;
      default: return <Badge variant="info">{estado}</Badge>;
    }
  };

  const pendingProofsCount = comprobantes?.data?.filter((c) => c.estado === 'PENDIENTE' || c.estado === 'ERROR')?.length || 0;

  return (
    <AppLayout>
      <Head title="Revisión y Seguimiento de Pagos" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Cabecera Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-heading)] flex items-center gap-2">
              <CheckCircle2 size={24} className="text-[var(--brand-primary)]" />
              <span>Gestión y Revisión de Pagos</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Control de prospectos en promesa de pago, registro de comprobantes con aranceles oficiales y aprobación de matrículas.
            </p>
          </div>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex border-b border-[var(--border-color-light)] gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('promesas')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'promesas'
                ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
          >
            <Clock size={16} />
            <span>Prospectos en Promesa de Pago</span>
            <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold">
              {leadsEnPromesa.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('revision')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'revision'
                ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
          >
            <FileText size={16} />
            <span>Cola de Comprobantes Subidos</span>
            {pendingProofsCount > 0 && (
              <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                {pendingProofsCount} pendientes
              </span>
            )}
          </button>
        </div>

        {/* PESTAÑA 1: PROSPECTOS EN PROMESA DE PAGO */}
        {activeTab === 'promesas' && (
          <Card>
            <div className="p-4 bg-cyan-50/50 border-b border-cyan-100 flex items-start justify-between">
              <div>
                <h2 className="text-sm font-bold text-cyan-950 flex items-center gap-1.5">
                  <Clock size={16} className="text-cyan-600" />
                  <span>Prospectos en Seguimiento de Pago (Etapa 4)</span>
                </h2>
                <p className="text-xs text-cyan-800 mt-0.5">
                  Prospectos que acordaron inscribirse. Registra aquí su comprobante con el cálculo automático de aranceles y descuentos.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-color-light)] text-[var(--text-muted)] text-xs uppercase tracking-wider bg-gray-50/50">
                    <th className="py-3 px-4 font-semibold">Prospecto / Contacto</th>
                    <th className="py-3 px-4 font-semibold">Interés Académico (API 2)</th>
                    <th className="py-3 px-4 font-semibold">Asesor Asignado</th>
                    <th className="py-3 px-4 font-semibold">Descuento Comercial</th>
                    <th className="py-3 px-4 font-semibold text-center">Estado Comprobante</th>
                    <th className="py-3 px-4 font-semibold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color-light)]">
                  {leadsEnPromesa.length > 0 ? (
                    leadsEnPromesa.map((lead) => {
                      const cleanPhone = (lead.telefono || '').replace(/\D/g, '');
                      const tieneComprobantePendiente = lead.comprobantes?.some((c) => c.estado === 'PENDIENTE');
                      const tieneComprobanteAprobado = lead.comprobantes?.some((c) => c.estado === 'APROBADO');

                      return (
                        <tr key={lead.id_lead} className="hover:bg-gray-50/60 transition">
                          {/* Prospecto */}
                          <td className="py-3.5 px-4">
                            <Link
                              href={`/leads/${lead.id_lead}`}
                              className="font-bold text-[var(--text-heading)] hover:text-[var(--brand-primary)] block"
                            >
                              {lead.nombre}
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                              <span className="flex items-center gap-1 font-mono">
                                <Phone size={11} /> {lead.telefono || 'Sin teléfono'}
                              </span>
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/591${cleanPhone}?text=Hola%20${encodeURIComponent(lead.nombre)},%20te%20escribo%20del%20área%20de%20admisiones.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 p-0.5 rounded-full"
                                  title="Enviar WhatsApp"
                                >
                                  <MessageCircle size={12} />
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Interés Académico */}
                          <td className="py-3.5 px-4 text-xs">
                            {lead.intereses && lead.intereses.length > 0 ? (
                              <div className="space-y-1">
                                {lead.intereses.map((it, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-[var(--text-heading)]">
                                    <GraduationCap size={13} className="text-[var(--brand-primary)] shrink-0" />
                                    <span className="font-medium line-clamp-1">
                                      {it.nombre_snapshot || it.tipo}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-amber-600 font-semibold flex items-center gap-1">
                                <AlertCircle size={13} /> Sin interés vinculado
                              </span>
                            )}
                          </td>

                          {/* Asesor */}
                          <td className="py-3.5 px-4 text-xs text-[var(--text-muted)]">
                            {lead.vendedor?.nombre_completo || 'Bolsa Común'}
                          </td>

                          {/* Descuento */}
                          <td className="py-3.5 px-4 text-xs">
                            {lead.descuento ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                                <Tag size={12} />
                                {lead.descuento.nombre} ({lead.descuento.porcentaje}%)
                              </span>
                            ) : (
                              <span className="text-gray-400">Sin descuento</span>
                            )}
                          </td>

                          {/* Estado Comprobante */}
                          <td className="py-3.5 px-4 text-center">
                            {tieneComprobanteAprobado ? (
                              <Badge variant="success">Pago Aprobado</Badge>
                            ) : tieneComprobantePendiente ? (
                              <Badge variant="warning">En Revisión</Badge>
                            ) : (
                              <span className="text-xs text-gray-400">Sin comprobante</span>
                            )}
                          </td>

                          {/* Acción */}
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              variant="primary"
                              onClick={() => handleOpenUpload(lead)}
                              className="text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 inline-flex items-center gap-1.5"
                            >
                              <UploadCloud size={14} />
                              <span>Subir Comprobante</span>
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-xs text-[var(--text-muted)]">
                        No hay prospectos actualmente en la etapa de <strong>Promesa de Pago</strong>.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* PESTAÑA 2: COLA DE COMPROBANTES SUBIDOS */}
        {activeTab === 'revision' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-color-light)] text-[var(--text-muted)] text-xs uppercase tracking-wider bg-gray-50/50">
                    <th className="py-3 px-4 font-semibold">Fecha de Subida</th>
                    <th className="py-3 px-4 font-semibold">Prospecto / Alumno</th>
                    <th className="py-3 px-4 font-semibold">Monto Declarado</th>
                    <th className="py-3 px-4 font-semibold">Comprobante</th>
                    <th className="py-3 px-4 font-semibold text-center">Estado</th>
                    <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color-light)]">
                  {comprobantes?.data?.length > 0 ? (
                    comprobantes.data.map((c) => (
                      <tr key={c.id_comprobante} className="hover:bg-gray-50/60 transition">
                        <td className="py-3.5 px-4 text-xs text-[var(--text-muted)]">
                          <span className="block font-medium text-[var(--text-heading)]">
                            {new Date(c.created_at).toLocaleDateString()}
                          </span>
                          <span>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/leads/${c.lead?.id_lead}`}
                            className="font-bold text-[var(--text-heading)] hover:text-[var(--brand-primary)] block"
                          >
                            {c.lead?.nombre}
                          </Link>
                          <span className="text-xs text-[var(--text-muted)]">
                            Subido por: {c.subido_por?.nombre_completo || 'Asesor'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[var(--text-heading)]">
                          {c.monto ? `Bs. ${c.monto}` : <em className="text-gray-400 font-normal">No especificado</em>}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            {c.tipo_archivo === 'imagen' ? (
                              <button
                                type="button"
                                onClick={() => handleOpenPreview(c)}
                                className="w-11 h-11 shrink-0 rounded-[var(--radius-sm)] border border-[var(--border-color-dark)] overflow-hidden bg-gray-100 hover:opacity-85 hover:ring-2 hover:ring-[var(--brand-primary)] transition cursor-pointer relative group"
                                title="Clic para ver comprobante"
                              >
                                <img
                                  src={c.archivo_url}
                                  alt={`Comprobante ${c.lead?.nombre}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                  <Eye size={14} className="text-white" />
                                </div>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenPreview(c)}
                                className="w-11 h-11 shrink-0 rounded-[var(--radius-sm)] border border-red-200 bg-red-50 flex items-center justify-center text-red-600 hover:bg-red-100 transition cursor-pointer"
                                title="Clic para ver PDF"
                              >
                                <FileText size={20} />
                              </button>
                            )}

                            <div className="flex flex-col text-xs">
                              <button
                                type="button"
                                onClick={() => handleOpenPreview(c)}
                                className="font-semibold text-[var(--brand-primary)] hover:underline inline-flex items-center gap-1 text-left cursor-pointer"
                              >
                                <Eye size={13} />
                                <span>Ver Foto / Archivo</span>
                              </button>
                              <a
                                href={c.archivo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-heading)] inline-flex items-center gap-1 mt-0.5"
                              >
                                <span>Abrir enlace</span>
                                <ExternalLink size={10} />
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {getStatusBadge(c.estado)}
                          {c.comentario_rechazo && (
                            <p className="text-[11px] text-red-600 mt-1 max-w-xs truncate mx-auto" title={c.comentario_rechazo}>
                              Motivo: {c.comentario_rechazo}
                            </p>
                          )}
                          {/* Estado de Despacho de Matrícula (Proyecto 2) */}
                          {c.envio_matricula && (
                            <div className="mt-1.5 pt-1.5 border-t border-gray-100 flex flex-col items-center">
                              {c.envio_matricula.estado === 'ENVIADO' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                                  <CheckCircle2 size={11} />
                                  <span>Matriculado en Proyecto 2</span>
                                </span>
                              ) : (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-semibold">
                                    <AlertCircle size={11} />
                                    <span>Error Matrícula P2</span>
                                  </span>
                                  <p className="text-[10px] text-rose-600 max-w-xs mx-auto truncate" title={c.envio_matricula.respuesta_api}>
                                    {c.envio_matricula.respuesta_api}
                                  </p>
                                  {isAdmin && (
                                    <button
                                      type="button"
                                      onClick={() => router.post(`/pagos/envios/${c.envio_matricula.id_envio}/reintentar`, {}, { preserveScroll: true })}
                                      className="text-[10px] text-[var(--brand-primary)] hover:underline font-semibold block mx-auto cursor-pointer"
                                    >
                                      ↻ Reintentar matrícula
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {c.estado === 'PENDIENTE' || c.estado === 'ERROR' ? (
                            isAdmin ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="secondary"
                                  onClick={() => openRejectModal(c)}
                                  className="text-xs py-1.5 px-2.5 text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  Rechazar
                                </Button>
                                <Button
                                  variant="primary"
                                  onClick={() => handleApprove(c.id_comprobante)}
                                  className="text-xs py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700"
                                >
                                  {c.estado === 'ERROR' ? 'Reintentar Aprobación' : 'Aprobar Pago'}
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-amber-600 font-medium">
                                {c.estado === 'ERROR' ? 'Matrícula con error' : 'Esperando revisión de Administración'}
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-gray-400">Revisado</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-[var(--text-muted)]">
                        No hay comprobantes de pago en la cola de revisión.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Modal para Subir Comprobante Enriquecido */}
      {selectedLeadForUpload && (
        <PaymentUploadModal
          isOpen={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false);
            setSelectedLeadForUpload(null);
          }}
          lead={selectedLeadForUpload}
          catalogo={catalogo}
        />
      )}

      {/* Modal para Rechazo de Comprobante (Administrador) */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Rechazar Comprobante de Pago"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <p className="text-xs text-[var(--text-muted)]">
            Indica la justificación por la cual el comprobante no es válido (ej. monto insuficiente, imagen ilegible, cuenta errónea).
          </p>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1">
              Motivo del Rechazo <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ej. El número de transacción no coincide con el extracto bancario..."
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div className="pt-3 border-t border-[var(--border-color-light)] flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setRejectModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger" disabled={rejectProcessing}>
              {rejectProcessing ? 'Rechazando...' : 'Confirmar Rechazo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal para Visualizar Comprobante de Pago en Alta Resolución */}
      {previewComprobante && (
        <Modal
          isOpen={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false);
            setPreviewComprobante(null);
          }}
          title={`Comprobante de Pago - ${previewComprobante.lead?.nombre || 'Prospecto'}`}
        >
          <div className="space-y-4">
            {/* Resumen Informativo */}
            <div className="p-3 bg-gray-50 rounded-[var(--radius-md)] border border-[var(--border-color-light)] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-[var(--text-muted)] block">Monto Declarado:</span>
                <span className="text-sm font-bold text-emerald-700">
                  {previewComprobante.monto ? `Bs. ${previewComprobante.monto}` : 'No declarado'}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Subido por:</span>
                <span className="font-medium text-[var(--text-heading)]">
                  {previewComprobante.subido_por?.nombre_completo || 'Asesor'}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Fecha de Envío:</span>
                <span className="font-medium text-[var(--text-heading)]">
                  {new Date(previewComprobante.created_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Estado:</span>
                <div>{getStatusBadge(previewComprobante.estado)}</div>
              </div>
            </div>

            {/* Visor de Imagen o PDF */}
            <div className="bg-slate-950/5 p-2 rounded-[var(--radius-md)] border border-gray-200 flex items-center justify-center min-h-[280px] max-h-[60vh] overflow-auto">
              {previewComprobante.tipo_archivo === 'imagen' ? (
                <img
                  src={previewComprobante.archivo_url}
                  alt={`Comprobante ${previewComprobante.lead?.nombre}`}
                  className="max-h-[55vh] max-w-full rounded object-contain shadow-sm"
                />
              ) : (
                <div className="w-full py-12 flex flex-col items-center justify-center text-center">
                  <FileText size={48} className="text-red-500 mb-2" />
                  <p className="text-sm font-semibold text-gray-800">Documento en formato PDF</p>
                  <p className="text-xs text-gray-500 mb-3">Puedes visualizarlo o descargarlo en una ventana independiente.</p>
                  <a
                    href={previewComprobante.archivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-[var(--brand-primary)] text-white text-xs font-semibold rounded-[var(--radius-sm)] inline-flex items-center gap-1.5 hover:opacity-90"
                  >
                    <span>Abrir PDF en pestaña nueva</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </div>

            {/* Acciones al pie del visor */}
            <div className="pt-3 border-t border-[var(--border-color-light)] flex flex-wrap items-center justify-between gap-2">
              <a
                href={previewComprobante.archivo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--brand-primary)] hover:underline inline-flex items-center gap-1 font-medium"
              >
                <ExternalLink size={13} />
                <span>Abrir archivo en tamaño original</span>
              </a>

              <div className="flex items-center gap-2">
                {(previewComprobante.estado === 'PENDIENTE' || previewComprobante.estado === 'ERROR') && isAdmin && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const c = previewComprobante;
                        setPreviewModalOpen(false);
                        openRejectModal(c);
                      }}
                      className="text-xs py-1.5 px-3 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Rechazar
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        const cId = previewComprobante.id_comprobante;
                        setPreviewModalOpen(false);
                        handleApprove(cId);
                      }}
                      className="text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700"
                    >
                      {previewComprobante.estado === 'ERROR' ? 'Reintentar Aprobación' : 'Aprobar Pago'}
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setPreviewModalOpen(false)}
                  className="text-xs"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}
