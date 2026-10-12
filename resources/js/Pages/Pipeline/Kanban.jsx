import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Shared/Button';
import Badge from '@/Shared/Badge';
import PaymentUploadModal from '@/Shared/PaymentUploadModal';
import {
  Kanban as KanbanIcon,
  Search,
  Filter,
  Plus,
  Phone,
  MessageCircle,
  User,
  Share2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  ExternalLink,
  Clock,
  Sparkles,
  UploadCloud
} from 'lucide-react';

export default function PipelineKanban({
  columnas = [],
  totalLeads = 0,
  motivosPerdida = [],
  vendedores = [],
  filters = {},
  catalogo = { programas: [], modulos_sueltos: [] },
}) {
  const { auth } = usePage().props;
  const user = auth?.user;
  const isVendedor = user?.rol?.nombre === 'Vendedor';
  const canHandlePayments = user?.rol?.nombre === 'Administrador' || user?.rol?.nombre === 'Vendedor';

  // Estado local para permitir actualización optimista y drag & drop
  const [boardColumns, setBoardColumns] = useState(columnas);
  const [draggedLead, setDraggedLead] = useState(null);
  const [dragSourceStageId, setDragSourceStageId] = useState(null);
  const [dragOverStageId, setDragOverStageId] = useState(null);

  // Filtros de búsqueda local/remota
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedVendedor, setSelectedVendedor] = useState(filters.id_vendedor || '');

  // Modales interactivos
  const [lostModalData, setLostModalData] = useState(null); // { lead, targetStageId }
  const [lostReasonId, setLostReasonId] = useState('');
  const [lostComment, setLostComment] = useState('');
  const [lostError, setLostError] = useState('');

  const [conversionModalData, setConversionModalData] = useState(null); // { lead, targetStageId }
  const [conversionForm, setConversionForm] = useState({
    ci: '',
    nombre_completo: '',
    fecha_nacimiento: '',
    ciudad: '',
  });
  const [conversionError, setConversionError] = useState('');

  // Modal para comprobante de pago digital
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalLead, setPaymentModalLead] = useState(null);

  // Sincronizar estado cuando las props cambian
  useEffect(() => {
    setBoardColumns(columnas);
  }, [columnas]);

  // Manejador de filtros
  const handleFilterSubmit = (e) => {
    if (e) e.preventDefault();
    router.get(
      '/pipeline',
      {
        search: searchTerm || undefined,
        id_vendedor: selectedVendedor || undefined,
      },
      { preserveState: true, replace: true }
    );
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, lead, sourceStageId) => {
    if (isVendedor && lead.id_vendedor !== user.id_usuario) {
      e.preventDefault();
      return;
    }
    setDraggedLead(lead);
    setDragSourceStageId(sourceStageId);
    e.dataTransfer.setData('text/plain', lead.id_lead);
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    if (dragOverStageId !== stageId) {
      setDragOverStageId(stageId);
    }
  };

  const handleDragLeave = () => {
    setDragOverStageId(null);
  };

  const handleDrop = (e, targetStageId) => {
    e.preventDefault();
    setDragOverStageId(null);

    if (!draggedLead || dragSourceStageId === targetStageId) {
      setDraggedLead(null);
      setDragSourceStageId(null);
      return;
    }

    triggerStageTransition(draggedLead, targetStageId);
    setDraggedLead(null);
    setDragSourceStageId(null);
  };

  // Orquestador de transiciones
  const triggerStageTransition = (lead, targetStageId) => {
    // 1. Regla RF3.3: Marcar como Perdido (etapa 6) exige motivo
    if (targetStageId === 6) {
      setLostModalData({ lead, targetStageId });
      setLostReasonId('');
      setLostComment('');
      setLostError('');
      return;
    }

    // 2. Regla RF3.4: Marcar como Convertido (etapa 5) exige datos de alumno
    if (targetStageId === 5) {
      const needsData =
        !lead.ci || !lead.fecha_nacimiento || !lead.ciudad;

      if (needsData) {
        setConversionModalData({ lead, targetStageId });
        setConversionForm({
          ci: lead.ci || '',
          nombre_completo: lead.nombre_completo || lead.nombre || '',
          fecha_nacimiento: lead.fecha_nacimiento ? lead.fecha_nacimiento.split('T')[0] : '',
          ciudad: lead.ciudad || '',
        });
        setConversionError('');
        return;
      }
    }

    // 3. Regla Promesa de Pago (etapa 4): realizar transición y abrir modal de carga de comprobante si tiene permisos
    if (targetStageId === 4) {
      executeStageChange(lead, targetStageId, {});
      if (canHandlePayments && (!isVendedor || lead.id_vendedor === user?.id_usuario)) {
        setPaymentModalLead({ ...lead, id_etapa: 4 });
        setPaymentModalOpen(true);
      }
      return;
    }

    // 4. Transición ordinaria directa
    executeStageChange(lead, targetStageId, {});
  };

  // Ejecución de la petición con rollback optimista
  const executeStageChange = (lead, targetStageId, payload = {}) => {
    const previousColumns = JSON.parse(JSON.stringify(boardColumns));

    // Actualización visual optimista instantánea
    setBoardColumns((prev) =>
      prev.map((col) => {
        if (col.id_etapa === lead.id_etapa) {
          return { ...col, leads: col.leads.filter((l) => l.id_lead !== lead.id_lead) };
        }
        if (col.id_etapa === targetStageId) {
          return {
            ...col,
            leads: [{ ...lead, id_etapa: targetStageId, ...payload }, ...col.leads],
          };
        }
        return col;
      })
    );

    router.patch(
      `/leads/${lead.id_lead}/etapa`,
      {
        id_etapa: targetStageId,
        ...payload,
      },
      {
        preserveScroll: true,
        onError: (errors) => {
          // Revertir estado visual en caso de error
          setBoardColumns(previousColumns);
          const msg = Object.values(errors)[0] || 'No se pudo mover el prospecto de etapa.';
          alert(msg);
        },
      }
    );
  };

  // Envío del modal de pérdida
  const handleLostSubmit = (e) => {
    e.preventDefault();
    if (!lostReasonId) {
      setLostError('Debes seleccionar obligatoriamente un motivo de pérdida.');
      return;
    }

    const { lead, targetStageId } = lostModalData;
    executeStageChange(lead, targetStageId, {
      id_motivo_perdida: lostReasonId,
      comentario_perdida: lostComment,
    });
    setLostModalData(null);
  };

  // Envío del modal de conversión
  const handleConversionSubmit = (e) => {
    e.preventDefault();
    if (!conversionForm.ci.trim() || !conversionForm.fecha_nacimiento || !conversionForm.ciudad.trim()) {
      setConversionError('Todos los campos marcados con asterisco (*) son obligatorios.');
      return;
    }

    const { lead, targetStageId } = conversionModalData;
    executeStageChange(lead, targetStageId, {
      ...conversionForm,
    });
    setConversionModalData(null);
  };

  // Colores temáticos por etapa
  const getStageBadgeStyle = (stageId) => {
    switch (stageId) {
      case 1: // Nuevo
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' };
      case 2: // En Contacto
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
      case 3: // Seguimiento
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' };
      case 4: // Promesa de Pago
        return { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', dot: 'bg-cyan-500' };
      case 5: // Convertido
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
      case 6: // Perdido
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' };
      default:
        return { bg: 'bg-gray-50 text-gray-700 border-gray-200', dot: 'bg-gray-500' };
    }
  };

  return (
    <AppLayout title="Pipeline Kanban">
      <Head title="Pipeline Comercial (Kanban) - CRM Educativo" />

      <div className="space-y-6">
        {/* Cabecera y Filtros */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-[var(--border-color-light)]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-heading)] flex items-center gap-2">
              <KanbanIcon className="text-[var(--brand-primary)]" size={26} />
              Pipeline de Ventas
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Tablero comercial interactivo: arrastra y suelta prospectos entre las 6 etapas del embudo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Buscador */}
            <form onSubmit={handleFilterSubmit} className="relative flex items-center">
              <Search
                size={16}
                className="absolute left-3 text-[var(--color-secondary)] pointer-events-none"
              />
              <input
                type="text"
                placeholder="Buscar prospecto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] text-[var(--text-heading)] focus:outline-none focus:border-[var(--color-primary)] w-48 sm:w-56"
              />
            </form>

            {/* Filtro por vendedor (Admin y Coordinador) */}
            {!isVendedor && vendedores.length > 0 && (
              <select
                value={selectedVendedor}
                onChange={(e) => {
                  setSelectedVendedor(e.target.value);
                  router.get(
                    '/pipeline',
                    {
                      search: searchTerm || undefined,
                      id_vendedor: e.target.value || undefined,
                    },
                    { preserveState: true, replace: true }
                  );
                }}
                className="py-2 px-3 text-xs bg-[var(--bg-surface)] border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] text-[var(--text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">Todos los asesores</option>
                {vendedores.map((v) => (
                  <option key={v.id_usuario} value={v.id_usuario}>
                    {v.nombre_completo}
                  </option>
                ))}
              </select>
            )}

            <Button
              type="button"
              variant="primary"
              onClick={() => router.visit('/leads/create')}
              className="inline-flex items-center gap-1.5 text-xs py-2 px-3 cursor-pointer"
            >
              <Plus size={16} />
              Nuevo Prospecto
            </Button>
          </div>
        </div>

        {/* Tablero Kanban (6 Columnas con scroll horizontal fluido) */}
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-w-[1280px]">
            {boardColumns.map((columna) => {
              const style = getStageBadgeStyle(columna.id_etapa);
              const isOver = dragOverStageId === columna.id_etapa;

              return (
                <div
                  key={columna.id_etapa}
                  onDragOver={(e) => handleDragOver(e, columna.id_etapa)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, columna.id_etapa)}
                  className={`flex flex-col bg-[var(--bg-sidebar)] border rounded-[var(--radius-lg)] transition-all min-h-[560px] max-h-[calc(100vh-220px)] ${
                    isOver
                      ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 bg-blue-50/20'
                      : 'border-[var(--border-color-light)]'
                  }`}
                >
                  {/* Cabecera de Columna */}
                  <div className="p-3 bg-[var(--bg-surface)] border-b border-[var(--border-color-light)] rounded-t-[var(--radius-lg)] flex items-center justify-between sticky top-0 z-10 shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                      <span className="text-xs font-bold text-[var(--text-heading)] truncate">
                        {columna.nombre}
                      </span>
                      {columna.id_etapa === 4 && canHandlePayments && (
                        <Link
                          href="/pagos/revision"
                          className="text-[var(--brand-primary)] hover:text-blue-700 transition ml-0.5"
                          title="Ir a Cola de Revisión de Pagos"
                        >
                          <ExternalLink size={12} />
                        </Link>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${style.bg}`}
                    >
                      {columna.leads?.length || 0}
                    </span>
                  </div>

                  {/* Lista de Tarjetas de Prospectos */}
                  <div className="p-2 space-y-2.5 flex-1 overflow-y-auto">
                    {columna.leads?.length === 0 ? (
                      <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-xs text-[var(--text-muted)] border-2 border-dashed border-[var(--border-color-light)] rounded-[var(--radius-md)]">
                        <span>Sin prospectos</span>
                        <span className="text-[10px] mt-0.5">Arrastra aquí para mover</span>
                      </div>
                    ) : (
                      columna.leads.map((lead) => {
                        const canDrag = !isVendedor || lead.id_vendedor === user?.id_usuario;
                        const cleanPhone = (lead.telefono || '').replace(/\D/g, '');

                        return (
                          <div
                            key={lead.id_lead}
                            draggable={canDrag}
                            onDragStart={(e) => handleDragStart(e, lead, columna.id_etapa)}
                            className={`bg-[var(--bg-surface)] border border-[var(--border-color-light)] p-3 rounded-[var(--radius-md)] shadow-xs transition-all relative group ${
                              canDrag
                                ? 'cursor-grab active:cursor-grabbing hover:shadow-md hover:border-[var(--border-color-dark)] hover:-translate-y-0.5'
                                : 'opacity-85 cursor-default'
                            }`}
                          >
                            {/* Nombre del Prospecto y Link a Detalle */}
                            <div className="flex items-start justify-between gap-1.5 mb-1.5">
                              <Link
                                href={`/leads/${lead.id_lead}`}
                                className="text-xs font-bold text-[var(--text-heading)] hover:text-[var(--color-primary)] transition line-clamp-1 flex-1"
                                title={lead.nombre}
                              >
                                {lead.nombre}
                              </Link>
                              <Link
                                href={`/leads/${lead.id_lead}`}
                                title="Ver ficha completa"
                                className="text-[var(--text-muted)] hover:text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition p-0.5"
                              >
                                <ExternalLink size={13} />
                              </Link>
                            </div>

                            {/* Teléfono y WhatsApp rápido */}
                            <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-2">
                              <span className="flex items-center gap-1 font-mono">
                                <Phone size={12} />
                                {lead.telefono}
                              </span>
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/591${cleanPhone}?text=Hola%20${encodeURIComponent(
                                    lead.nombre
                                  )},%20te%20escribo%20de%20la%20facultad.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Abrir WhatsApp"
                                  className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 p-1 rounded-full transition"
                                >
                                  <MessageCircle size={13} />
                                </a>
                              )}
                            </div>

                            {/* Canal de Origen */}
                            {lead.origen && (
                              <div className="mb-2">
                                <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-[var(--radius-sm)] font-medium inline-flex items-center gap-1">
                                  <Share2 size={10} />
                                  {lead.origen.nombre}
                                </span>
                              </div>
                            )}

                            {/* Info de Pérdida en la columna 6 */}
                            {columna.id_etapa === 6 && lead.motivo_perdida && (
                              <div className="mb-2 p-1.5 bg-rose-50 border border-rose-100 rounded-[var(--radius-sm)] text-[10px] text-rose-700">
                                <span className="font-semibold block text-[9px] uppercase tracking-wider text-rose-500">Motivo de descarte:</span>
                                {lead.motivo_perdida.nombre}
                              </div>
                            )}

                            {/* Pie de tarjeta: Asesor asignado */}
                            <div className="mt-2 pt-2 border-t border-[var(--border-color-light)] flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-1 text-[var(--text-muted)] truncate">
                                <User size={12} />
                                <span className="truncate">
                                  {lead.vendedor ? lead.vendedor.nombre_completo : 'Bolsa Común'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MODAL RF3.3: Motivo de Pérdida Obligatorio */}
        {lostModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div
              className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-color-light)] shadow-2xl p-6 relative animate-in zoom-in-95 duration-150"
              style={{ borderRadius: 'var(--radius-xl)' }}
            >
              <button
                onClick={() => setLostModalData(null)}
                className="absolute right-4 top-4 text-[var(--color-secondary)] hover:text-[var(--text-heading)] p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-3 text-rose-600">
                <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-full">
                  <XCircle size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-heading)] leading-snug">
                    Marcar Prospecto como Perdido
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Prospecto: <strong className="text-[var(--text-heading)]">{lostModalData.lead.nombre}</strong>
                  </p>
                </div>
              </div>

              {lostError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[var(--radius-sm)] flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{lostError}</span>
                </div>
              )}

              <form onSubmit={handleLostSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-heading)] mb-1.5">
                    Motivo de Descarte <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={lostReasonId}
                    onChange={(e) => {
                      setLostReasonId(e.target.value);
                      setLostError('');
                    }}
                    className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-color-dark)] text-xs rounded-[var(--radius-sm)] text-[var(--text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value="">-- Selecciona un motivo --</option>
                    {motivosPerdida.map((m) => (
                      <option key={m.id_motivo} value={m.id_motivo}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-heading)] mb-1.5">
                    Comentario adicional (opcional)
                  </label>
                  <textarea
                    rows={3}
                    value={lostComment}
                    onChange={(e) => setLostComment(e.target.value)}
                    placeholder="Detalles sobre por qué el prospecto desistió o no continuará..."
                    className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-color-dark)] text-xs rounded-[var(--radius-sm)] text-[var(--text-heading)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-color-light)]">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setLostModalData(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="danger"
                    disabled={!lostReasonId}
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    Confirmar Descarte
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL RF3.4: Validación de Datos de Alumno para Convertido */}
        {conversionModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div
              className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-color-light)] shadow-2xl p-6 relative animate-in zoom-in-95 duration-150"
              style={{ borderRadius: 'var(--radius-xl)' }}
            >
              <button
                onClick={() => setConversionModalData(null)}
                className="absolute right-4 top-4 text-[var(--color-secondary)] hover:text-[var(--text-heading)] p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-3 text-emerald-600">
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-full">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-heading)] leading-snug">
                    Convertir a Alumno Matriculado
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Prospecto: <strong className="text-[var(--text-heading)]">{conversionModalData.lead.nombre}</strong>
                  </p>
                </div>
              </div>

              <p className="text-xs text-[var(--text-main)] mb-4 bg-emerald-50/50 p-3 rounded-[var(--radius-sm)] border border-emerald-100 leading-relaxed">
                Para completar la conversión a la etapa <strong>Convertido</strong> y preparar la matrícula, el sistema requiere verificar y registrar los datos oficiales de identidad del estudiante.
              </p>

              {conversionError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[var(--radius-sm)] flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{conversionError}</span>
                </div>
              )}

              <form onSubmit={handleConversionSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-heading)] mb-1">
                    Nombre Completo Oficial <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={conversionForm.nombre_completo}
                    onChange={(e) =>
                      setConversionForm({ ...conversionForm, nombre_completo: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-color-dark)] text-xs rounded-[var(--radius-sm)] text-[var(--text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-heading)] mb-1">
                      Cédula de Identidad (CI) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 8765432 SC"
                      value={conversionForm.ci}
                      onChange={(e) =>
                        setConversionForm({ ...conversionForm, ci: e.target.value })
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
                      value={conversionForm.fecha_nacimiento}
                      onChange={(e) =>
                        setConversionForm({
                          ...conversionForm,
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
                    Ciudad de Residencia <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Santa Cruz de la Sierra"
                    value={conversionForm.ciudad}
                    onChange={(e) =>
                      setConversionForm({ ...conversionForm, ciudad: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-color-dark)] text-xs rounded-[var(--radius-sm)] text-[var(--text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-color-light)]">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setConversionModalData(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Guardar y Convertir a Alumno
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL RF4.1: Subir Comprobante de Pago Enriquecido */}
        {paymentModalLead && (
          <PaymentUploadModal
            isOpen={paymentModalOpen}
            onClose={() => {
              setPaymentModalOpen(false);
              setPaymentModalLead(null);
            }}
            lead={paymentModalLead}
            catalogo={catalogo}
            onSuccess={() => {
              router.reload({ only: ['columnas'] });
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}
