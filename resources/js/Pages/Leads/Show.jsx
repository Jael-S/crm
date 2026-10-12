import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Shared/Card';
import Button from '@/Shared/Button';
import Badge from '@/Shared/Badge';
import Modal from '@/Shared/Modal';
import {
  UserCheck,
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Share2,
  Clock,
  UserPlus,
  ArrowRightLeft,
  History,
  Inbox,
  Edit2,
  Shield,
  MessageSquare,
  Plus,
  Trash2,
  XCircle,
  Briefcase,
  Percent,
  FileText,
  UploadCloud,
  Bell,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export default function LeadsShow({ lead, vendedores = [], catalogo = { programas: [], modulos_sueltos: [] } }) {
  const { auth } = usePage().props;
  const user = auth?.user;
  const canAssign = user?.rol?.nombre === 'Administrador' || user?.rol?.nombre === 'Coordinador';

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [interestType, setInterestType] = useState('PROGRAMA');
  const interestForm = useForm({
    id_lead: lead.id_lead,
    tipo: 'PROGRAMA',
    id_version_externo: '',
    id_modulo_externo: '',
    nombre_snapshot: '',
  });

  // Formulario Asignación Manual
  const assignForm = useForm({
    id_vendedor: vendedores[0]?.id_usuario || '',
  });

  // Formulario Transferencia con Motivo
  const transferForm = useForm({
    id_vendedor: vendedores[0]?.id_usuario || '',
    motivo: '',
  });

  // Modales y formularios de Nataly (Fase 2 y 3)
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);

  const noteForm = useForm({
    descripcion: '',
  });

  const reminderForm = useForm({
    fecha_hora: '',
    descripcion: '',
  });

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    noteForm.post(`/leads/${lead.id_lead}/notas`, {
      onSuccess: () => {
        setNoteModalOpen(false);
        noteForm.reset();
      },
    });
  };

  const handleReminderSubmit = (e) => {
    e.preventDefault();
    reminderForm.post(`/leads/${lead.id_lead}/recordatorios`, {
      onSuccess: () => {
        setReminderModalOpen(false);
        reminderForm.reset();
      },
    });
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    assignForm.post(`/leads/${lead.id_lead}/asignar`, {
      onSuccess: () => setAssignModalOpen(false),
    });
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    transferForm.post(`/leads/${lead.id_lead}/transferir`, {
      onSuccess: () => setTransferModalOpen(false),
    });
  };

  const interestOptions = interestType === 'PROGRAMA'
    ? catalogo.programas.flatMap((programa) => (programa.versiones || []).map((version) => ({
        id: version.id,
        nombre: `${programa.nombre} - ${version.nombre}`,
      })))
    : catalogo.modulos_sueltos.map((modulo) => ({ id: modulo.id, nombre: modulo.nombre }));

  const handleInterestTypeChange = (type) => {
    setInterestType(type);
    interestForm.setData({
      ...interestForm.data,
      tipo: type,
      id_version_externo: '',
      id_modulo_externo: '',
      nombre_snapshot: '',
    });
  };

  const handleInterestOptionChange = (e) => {
    const option = interestOptions.find((item) => String(item.id) === e.target.value);
    interestForm.setData({
      ...interestForm.data,
      id_version_externo: interestType === 'PROGRAMA' ? e.target.value : '',
      id_modulo_externo: interestType === 'MODULO' ? e.target.value : '',
      nombre_snapshot: option?.nombre || '',
    });
  };

  const handleInterestSubmit = (e) => {
    e.preventDefault();
    interestForm.post(`/leads/${lead.id_lead}/intereses`, {
      preserveScroll: true,
      onSuccess: () => {
        setInterestModalOpen(false);
        interestForm.reset();
        interestForm.setData('id_lead', lead.id_lead);
        interestForm.setData('tipo', 'PROGRAMA');
        setInterestType('PROGRAMA');
      },
    });
  };

  const removeInterest = (interestId) => {
    if (window.confirm('¿Eliminar este interés del lead?')) {
      interestForm.delete(`/leads/${lead.id_lead}/intereses/${interestId}`, { preserveScroll: true });
    }
  };

  const getStageBadgeVariant = (stageName) => {
    switch (stageName) {
      case 'Nuevo':
        return 'info';
      case 'En Contacto':
      case 'Seguimiento':
        return 'warning';
      case 'Promesa de Pago':
      case 'Convertido':
        return 'success';
      case 'Perdido':
        return 'danger';
      default:
        return 'info';
    }
  };

  return (
    <AppLayout>
      <Head title={`Ficha: ${lead.nombre}`} />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Barra superior de navegación y acciones */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/leads"
              className="p-2 bg-white border border-[var(--border-color-light)] text-[var(--text-muted)] hover:text-[var(--text-heading)] rounded-[var(--radius-sm)] shadow-sm transition"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[var(--text-heading)]">{lead.nombre}</h1>
                <Badge variant={getStageBadgeVariant(lead.etapa?.nombre)}>
                  {lead.etapa?.nombre || 'Nuevo'}
                </Badge>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Registrado el {new Date(lead.created_at).toLocaleString()} por {lead.creador?.nombre_completo || 'Sistema'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setNoteModalOpen(true)}
              className="flex items-center gap-1.5 text-xs py-2"
            >
              <MessageSquare size={14} />
              <span>Agregar Nota</span>
            </Button>

            <Button
              variant="secondary"
              onClick={() => setReminderModalOpen(true)}
              className="flex items-center gap-1.5 text-xs py-2"
            >
              <Bell size={14} />
              <span>Recordatorio</span>
            </Button>

            <Link href={`/leads/${lead.id_lead}/edit`}>
              <Button variant="primary" className="flex items-center gap-1.5 text-xs py-2">
                <Edit2 size={14} />
                <span>Editar Datos</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Banner de Prospecto Descartado / Perdido (RF3.3) */}
        {(lead.id_etapa === 6 || lead.motivo_perdida || lead.motivoPerdida) && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-[var(--radius-lg)] text-rose-900 shadow-xs flex items-start gap-3 animate-in fade-in duration-200">
            <div className="p-2 bg-rose-100 rounded-full text-rose-600 shrink-0">
              <XCircle size={22} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-rose-900">Prospecto Descartado (Etapa Perdido)</h3>
                <span className="text-xs bg-rose-200 text-rose-900 font-semibold px-2.5 py-0.5 rounded-full">
                  Motivo: {lead.motivo_perdida?.nombre || lead.motivoPerdida?.nombre || 'No especificado'}
                </span>
              </div>
              {lead.comentario_perdida ? (
                <p className="text-xs text-rose-700 leading-relaxed bg-white/70 p-2.5 rounded border border-rose-100 mt-2">
                  <span className="font-semibold text-rose-900 block mb-0.5">Comentario del asesor:</span>
                  {lead.comentario_perdida}
                </p>
              ) : (
                <p className="text-xs text-rose-700 mt-0.5">
                  Este prospecto fue marcado como no viable para continuar en el proceso comercial.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Grilla Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna Izquierda: Información de Contacto y Estado */}
          <div className="md:col-span-2 space-y-6">
            {/* Tarjeta de Contacto y Comercial */}
            <Card>
              <h2 className="text-sm font-bold text-[var(--text-heading)] uppercase tracking-wider mb-4 pb-2 border-b border-[var(--border-color-light)] flex items-center gap-2">
                <Phone size={16} className="text-[var(--brand-primary)]" />
                <span>Datos de Contacto y Perfil Comercial</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-[var(--bg-body)] rounded-[var(--radius-sm)]">
                  <span className="text-xs text-[var(--text-muted)] block">Teléfono / Celular</span>
                  <a
                    href={`https://wa.me/591${lead.telefono.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1.5 mt-0.5"
                  >
                    <span>{lead.telefono}</span>
                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">WhatsApp</span>
                  </a>
                </div>

                <div className="p-3 bg-[var(--bg-body)] rounded-[var(--radius-sm)]">
                  <span className="text-xs text-[var(--text-muted)] block">Correo Electrónico</span>
                  <span className="text-sm font-semibold text-[var(--text-heading)] block mt-0.5">
                    {lead.correo || <em className="text-gray-400 font-normal">No especificado</em>}
                  </span>
                </div>

                <div className="p-3 bg-[var(--bg-body)] rounded-[var(--radius-sm)]">
                  <span className="text-xs text-[var(--text-muted)] block">Canal de Origen</span>
                  <span className="text-sm font-semibold text-[var(--brand-primary)] block mt-0.5">
                    {lead.origen?.nombre || 'Desconocido'}
                  </span>
                </div>

                <div className="p-3 bg-[var(--bg-body)] rounded-[var(--radius-sm)]">
                  <span className="text-xs text-[var(--text-muted)] block">Profesión / Ocupación</span>
                  <span className="text-sm font-semibold text-[var(--text-heading)] block mt-0.5">
                    {lead.profesion?.nombre || <em className="text-gray-400 font-normal">No especificada</em>}
                  </span>
                </div>

                <div className="p-3 bg-[var(--bg-body)] rounded-[var(--radius-sm)]">
                  <span className="text-xs text-[var(--text-muted)] block">Descuento Comercial Asignado</span>
                  <span className="text-sm font-semibold text-[var(--text-heading)] block mt-0.5">
                    {lead.descuento ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <Percent size={13} />
                        {lead.descuento.porcentaje}% - {lead.descuento.nombre}
                      </span>
                    ) : (
                      <em className="text-gray-400 font-normal">Sin descuento aplicado</em>
                    )}
                  </span>
                </div>

                <div className="p-3 bg-[var(--bg-body)] rounded-[var(--radius-sm)]">
                  <span className="text-xs text-[var(--text-muted)] block">Ciudad de Residencia</span>
                  <span className="text-sm font-semibold text-[var(--text-heading)] block mt-0.5">
                    {lead.ciudad || <em className="text-gray-400 font-normal">No especificada</em>}
                  </span>
                </div>

                {/* Motivo de Pérdida en la tarjeta de contacto si fue descartado */}
                {lead.id_etapa === 6 && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-[var(--radius-sm)] sm:col-span-2">
                    <span className="text-xs text-rose-800 font-semibold block">Motivo de Descarte / Pérdida</span>
                    <span className="text-sm font-bold text-rose-900 block mt-0.5">
                      {lead.motivo_perdida?.nombre || lead.motivoPerdida?.nombre || 'No especificado'}
                    </span>
                    {lead.comentario_perdida && (
                      <p className="text-xs text-rose-700 mt-1">
                        <strong className="text-rose-900">Comentario del asesor:</strong> {lead.comentario_perdida}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Tarjeta de Datos Oficiales de Alumno / Matrícula (RF3.4) */}
            <Card>
              <h2 className="text-sm font-bold text-[var(--text-heading)] uppercase tracking-wider mb-4 pb-2 border-b border-[var(--border-color-light)] flex items-center gap-2">
                <UserCheck size={16} className="text-emerald-600" />
                <span>Datos Oficiales de Alumno (Matrícula)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-[var(--bg-body)] rounded-[var(--radius-sm)]">
                  <span className="text-xs text-[var(--text-muted)] block">Cédula de Identidad (CI)</span>
                  <span className="text-sm font-mono font-bold text-[var(--text-heading)] block mt-0.5">
                    {lead.ci ? lead.ci : <em className="text-gray-400 font-normal">Pendiente de registro</em>}
                  </span>
                </div>

                <div className="p-3 bg-[var(--bg-body)] rounded-[var(--radius-sm)]">
                  <span className="text-xs text-[var(--text-muted)] block">Nombre Completo Oficial</span>
                  <span className="text-sm font-semibold text-[var(--text-heading)] block mt-0.5">
                    {lead.nombre_completo || lead.nombre}
                  </span>
                </div>

                <div className="p-3 bg-[var(--bg-body)] rounded-[var(--radius-sm)]">
                  <span className="text-xs text-[var(--text-muted)] block">Fecha de Nacimiento</span>
                  <span className="text-sm font-semibold text-[var(--text-heading)] block mt-0.5">
                    {lead.fecha_nacimiento
                      ? String(lead.fecha_nacimiento).split('T')[0]
                      : <em className="text-gray-400 font-normal">Pendiente de registro</em>}
                  </span>
                </div>

                <div className="p-3 bg-[var(--bg-body)] rounded-[var(--radius-sm)]">
                  <span className="text-xs text-[var(--text-muted)] block">Ciudad Oficial</span>
                  <span className="text-sm font-semibold text-[var(--text-heading)] block mt-0.5">
                    {lead.ciudad || <em className="text-gray-400 font-normal">No especificada</em>}
                  </span>
                </div>
              </div>
            </Card>

            {/* Tarjeta de Programas y Módulos de Interés (Jael - RF2.2) */}
            <Card>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-color-light)]">
                <h2 className="text-sm font-bold text-[var(--text-heading)] uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare size={16} className="text-[var(--brand-primary)]" />
                  <span>Programas y Módulos de Interés</span>
                </h2>
                <Button onClick={() => setInterestModalOpen(true)} className="text-xs py-1.5">
                  <Plus size={14} className="mr-1" /> Agregar Interés
                </Button>
              </div>

              {lead.intereses && lead.intereses.length > 0 ? (
                <div className="space-y-2">
                  {lead.intereses.map((interes) => (
                    <div
                      key={interes.id_interes}
                      className="flex items-center justify-between gap-3 p-3 bg-[var(--bg-body)] rounded-[var(--radius-sm)] border border-[var(--border-color-light)]"
                    >
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          {interes.tipo}
                        </span>
                        <p className="text-sm font-semibold text-[var(--text-heading)] mt-1">
                          {interes.nombre_snapshot}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeInterest(interes.id_interes)}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition"
                        title="Eliminar interés"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <p className="text-xs text-[var(--text-muted)]">
                    Este prospecto no tiene programas ni módulos de interés vinculados aún.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => setInterestModalOpen(true)}
                    className="text-xs py-1.5 mx-auto"
                  >
                    <Plus size={14} className="mr-1" /> Vincular Interés Ahora
                  </Button>
                </div>
              )}
            </Card>

            {/* Tarjeta de Comprobantes de Pago y Despacho de Matrícula (RF3.4 / RF4.1 / Fase 3) */}
            <Card>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-color-light)]">
                <h2 className="text-sm font-bold text-[var(--text-heading)] uppercase tracking-wider flex items-center gap-2">
                  <UploadCloud size={16} className="text-emerald-600" />
                  <span>Comprobantes de Pago y Matrícula</span>
                </h2>
                {lead.id_etapa === 4 && (user?.rol?.nombre === 'Administrador' || user?.rol?.nombre === 'Vendedor') && (
                  <Link
                    href="/pagos/revision"
                    className="text-xs font-semibold text-[var(--brand-primary)] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Ir a Revisión de Pagos</span>
                    <ExternalLink size={12} />
                  </Link>
                )}
              </div>

              {lead.comprobantes && lead.comprobantes.length > 0 ? (
                <div className="space-y-3">
                  {lead.comprobantes.map((comp) => (
                    <div
                      key={comp.id_comprobante}
                      className="p-3 bg-[var(--bg-body)] rounded-[var(--radius-sm)] border border-[var(--border-color-light)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={comp.estado === 'APROBADO' ? 'success' : comp.estado === 'RECHAZADO' ? 'danger' : 'warning'}>
                            {comp.estado}
                          </Badge>
                          <span className="text-sm font-bold text-[var(--text-heading)]">
                            {comp.monto ? `Bs. ${comp.monto}` : 'Monto no declarado'}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          Subido por: {comp.subido_por?.nombre_completo || 'Asesor'} el {new Date(comp.created_at).toLocaleString()}
                        </p>
                        {comp.comentario_rechazo && (
                          <p className="text-xs text-rose-600 mt-1">
                            Motivo de rechazo: {comp.comentario_rechazo}
                          </p>
                        )}
                        {/* Estado del envío de matrícula si existe */}
                        {comp.envio_matricula && (
                          <div className="mt-2 text-xs flex items-center gap-1.5 font-medium">
                            <span>Estado Matrícula Grupo 6SC:</span>
                            <Badge variant={comp.envio_matricula.estado === 'ENVIADO' ? 'success' : 'danger'}>
                              {comp.envio_matricula.estado}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={comp.archivo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-[var(--brand-primary)] hover:underline inline-flex items-center gap-1"
                        >
                          <FileText size={14} />
                          <span>Ver {comp.tipo_archivo}</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)] py-2 text-center">
                  No se han registrado comprobantes de pago aún.
                </p>
              )}
            </Card>

            {/* Tarjeta de Recordatorios y Tareas Comerciales (RF4.3) */}
            <Card>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-color-light)]">
                <h2 className="text-sm font-bold text-[var(--text-heading)] uppercase tracking-wider flex items-center gap-2">
                  <Bell size={16} className="text-amber-600" />
                  <span>Recordatorios de Contacto</span>
                </h2>
                <Button onClick={() => setReminderModalOpen(true)} className="text-xs py-1.5">
                  <Plus size={14} className="mr-1" /> Agendar Alerta
                </Button>
              </div>

              {lead.recordatorios && lead.recordatorios.length > 0 ? (
                <div className="space-y-2">
                  {lead.recordatorios.map((rec) => (
                    <div
                      key={rec.id_recordatorio}
                      className="p-3 bg-[var(--bg-body)] rounded-[var(--radius-sm)] border border-[var(--border-color-light)] flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={rec.estado === 'COMPLETADO' ? 'success' : 'warning'}>
                            {rec.estado}
                          </Badge>
                          <span className="text-xs font-semibold text-[var(--text-heading)]">
                            {new Date(rec.fecha_hora).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{rec.descripcion}</p>
                      </div>

                      {rec.estado === 'PENDIENTE' && (
                        <Link
                          href={`/recordatorios/${rec.id_recordatorio}/completar`}
                          method="patch"
                          as="button"
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
                        >
                          Listo
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)] py-2 text-center">
                  No hay recordatorios agendados para este prospecto.
                </p>
              )}
            </Card>

            {/* Línea de Tiempo de Bitácora Oficial (RF4.1 / RF4.2) */}
            <Card>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-color-light)]">
                <h2 className="text-sm font-bold text-[var(--text-heading)] uppercase tracking-wider flex items-center gap-2">
                  <History size={16} className="text-[var(--brand-primary)]" />
                  <span>Bitácora de Trazabilidad e Historial</span>
                </h2>
                <Button onClick={() => setNoteModalOpen(true)} className="text-xs py-1.5">
                  <Plus size={14} className="mr-1" /> Agregar Nota
                </Button>
              </div>

              {lead.bitacoras && lead.bitacoras.length > 0 ? (
                <div className="relative border-l-2 border-[var(--border-color-dark)] ml-3 pl-4 space-y-4 my-2">
                  {lead.bitacoras.map((evento) => (
                    <div key={evento.id_evento} className="relative">
                      <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-[var(--brand-primary)] border-2 border-white" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 uppercase">
                            {evento.tipo}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            {new Date(evento.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-heading)] font-medium mt-1">
                          {evento.descripcion}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Registrado por: {evento.usuario?.nombre_completo || 'Sistema'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)] py-2 text-center">
                  No hay eventos registrados en la bitácora aún.
                </p>
              )}
            </Card>

            {/* Historial de Asignaciones y Auditoría */}
            <Card>
              <h2 className="text-sm font-bold text-[var(--text-heading)] uppercase tracking-wider mb-4 pb-2 border-b border-[var(--border-color-light)] flex items-center gap-2">
                <History size={16} className="text-[var(--brand-primary)]" />
                <span>Historial de Asignaciones</span>
              </h2>

              {lead.asignaciones && lead.asignaciones.length > 0 ? (
                <div className="space-y-4">
                  {lead.asignaciones.map((asig) => (
                    <div
                      key={asig.id_asignacion}
                      className="p-3 bg-[var(--bg-body)] rounded-[var(--radius-sm)] border border-[var(--border-color-light)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            asig.tipo === 'ROUND_ROBIN'
                              ? 'bg-purple-100 text-purple-800'
                              : asig.tipo === 'TRANSFERENCIA'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {asig.tipo}
                          </span>
                          <span className="text-xs font-semibold text-[var(--text-heading)]">
                            Asignado a {asig.vendedor_nuevo?.nombre_completo || 'Vendedor'}
                          </span>
                        </div>
                        {asig.motivo && (
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            Motivo: {asig.motivo}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Por: {asig.asignado_por?.nombre_completo || 'Sistema'}
                        </p>
                      </div>

                      <div className="text-right text-[11px] text-[var(--text-muted)] font-medium">
                        {new Date(asig.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)] py-4 text-center">
                  Este prospecto no tiene movimientos de asignación registrados.
                </p>
              )}
            </Card>
          </div>

          {/* Columna Derecha: Tarjeta de Asesor Comercial y Controles */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-sm font-bold text-[var(--text-heading)] uppercase tracking-wider mb-4 pb-2 border-b border-[var(--border-color-light)] flex items-center gap-2">
                <UserCheck size={16} className="text-[var(--brand-primary)]" />
                <span>Asesor Asignado</span>
              </h2>

              {lead.vendedor ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-[var(--bg-highlight)] rounded-[var(--radius-sm)]">
                    <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {lead.vendedor.nombre_completo.charAt(0)}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[var(--text-heading)] block leading-tight">
                        {lead.vendedor.nombre_completo}
                      </span>
                      <span className="text-xs text-[var(--brand-primary)] font-medium">
                        Asesor Comercial
                      </span>
                    </div>
                  </div>

                  {lead.fecha_asignacion && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <Clock size={13} />
                      <span>Asignado el {new Date(lead.fecha_asignacion).toLocaleDateString()}</span>
                    </div>
                  )}

                  {/* Acciones de reasignación y transferencia */}
                  {canAssign && (
                    <div className="pt-3 border-t border-[var(--border-color-light)] space-y-2">
                      <Button
                        variant="secondary"
                        onClick={() => setAssignModalOpen(true)}
                        className="w-full text-xs py-2 justify-center"
                      >
                        <UserPlus size={14} className="mr-1.5" />
                        Reasignar Asesor
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setTransferModalOpen(true)}
                        className="w-full text-xs py-2 justify-center border border-[var(--border-color-dark)]"
                      >
                        <ArrowRightLeft size={14} className="mr-1.5" />
                        Transferir con Motivo
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <div className="inline-flex p-3 bg-amber-50 text-amber-700 rounded-full">
                    <Inbox size={28} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-amber-800 block">En Bolsa Común</span>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Este prospecto está esperando ser asignado a un asesor comercial.
                    </p>
                  </div>

                  {canAssign && (
                    <Button
                      variant="primary"
                      onClick={() => setAssignModalOpen(true)}
                      className="w-full text-xs py-2 justify-center mt-2"
                    >
                      <UserPlus size={14} className="mr-1.5" />
                      Asignar Asesor Ahora
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Modal: Asignación Manual */}
        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title="Asignar Asesor Comercial"
        >
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <p className="text-xs text-[var(--text-muted)]">
              Selecciona el asesor comercial al que se le entregará la atención de <strong>{lead.nombre}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1">
                Asesor Comercial
              </label>
              <select
                value={assignForm.data.id_vendedor}
                onChange={(e) => assignForm.setData('id_vendedor', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[#7aa5ff]"
                required
              >
                {vendedores.map((v) => (
                  <option key={v.id_usuario} value={v.id_usuario}>
                    {v.nombre_completo}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-[var(--border-color-light)] flex justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => setAssignModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={assignForm.processing}>
                {assignForm.processing ? 'Asignando...' : 'Confirmar Asignación'}
              </Button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={interestModalOpen} onClose={() => setInterestModalOpen(false)} title="Agregar Interés Académico">
          <form onSubmit={handleInterestSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Tipo</label>
              <select value={interestType} onChange={(e) => handleInterestTypeChange(e.target.value)} className="w-full px-3 py-2 text-sm border rounded" required>
                <option value="PROGRAMA">Programa / Cohorte</option>
                <option value="MODULO">Módulo independiente</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Elemento</label>
              <select
                value={interestType === 'PROGRAMA' ? interestForm.data.id_version_externo : interestForm.data.id_modulo_externo}
                onChange={handleInterestOptionChange}
                className="w-full px-3 py-2 text-sm border rounded"
                required
              >
                <option value="">Selecciona una opción</option>
                {interestOptions.map((option) => <option key={option.id} value={option.id}>{option.nombre}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => setInterestModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={interestForm.processing}>Guardar Interés</Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Transferencia con Motivo */}
        <Modal
          isOpen={transferModalOpen}
          onClose={() => setTransferModalOpen(false)}
          title="Transferir Prospecto a Otro Asesor"
        >
          <form onSubmit={handleTransferSubmit} className="space-y-4">
            <p className="text-xs text-[var(--text-muted)]">
              Ingresa el nuevo asesor y la justificación o motivo de la transferencia.
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1">
                Nuevo Asesor Comercial
              </label>
              <select
                value={transferForm.data.id_vendedor}
                onChange={(e) => transferForm.setData('id_vendedor', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[#7aa5ff]"
                required
              >
                {vendedores.map((v) => (
                  <option key={v.id_usuario} value={v.id_usuario}>
                    {v.nombre_completo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1">
                Motivo de la Transferencia <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Ej. Reasignación por turno matutino, solicitud expresa del cliente..."
                value={transferForm.data.motivo}
                onChange={(e) => transferForm.setData('motivo', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[#7aa5ff]"
                required
              />
            </div>

            <div className="pt-3 border-t border-[var(--border-color-light)] flex justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => setTransferModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={transferForm.processing}>
                {transferForm.processing ? 'Transferir...' : 'Confirmar Transferencia'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Agregar Nota a la Bitácora */}
        <Modal
          isOpen={noteModalOpen}
          onClose={() => setNoteModalOpen(false)}
          title="Agregar Nota a la Bitácora"
        >
          <form onSubmit={handleNoteSubmit} className="space-y-4">
            <p className="text-xs text-[var(--text-muted)]">
              Registra los detalles de una llamada, mensaje o seguimiento comercial realizado con este prospecto.
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1">
                Contenido de la Nota <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Ej. El cliente solicita que le enviemos el plan de estudios y consultará el arancel con su empresa..."
                value={noteForm.data.descripcion}
                onChange={(e) => noteForm.setData('descripcion', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--brand-primary)]"
                required
              />
            </div>

            <div className="pt-3 border-t border-[var(--border-color-light)] flex justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => setNoteModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={noteForm.processing}>
                {noteForm.processing ? 'Guardando...' : 'Registrar Nota'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Agendar Recordatorio */}
        <Modal
          isOpen={reminderModalOpen}
          onClose={() => setReminderModalOpen(false)}
          title="Agendar Recordatorio Comercial"
        >
          <form onSubmit={handleReminderSubmit} className="space-y-4">
            <p className="text-xs text-[var(--text-muted)]">
              Programa una fecha y hora para realizar una llamada o seguimiento futuro.
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1">
                Fecha y Hora de la Alerta <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={reminderForm.data.fecha_hora}
                onChange={(e) => reminderForm.setData('fecha_hora', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--brand-primary)]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1">
                Descripción de la Tarea <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Llamar para verificar depósito bancario..."
                value={reminderForm.data.descripcion}
                onChange={(e) => reminderForm.setData('descripcion', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--brand-primary)]"
                required
              />
            </div>

            <div className="pt-3 border-t border-[var(--border-color-light)] flex justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => setReminderModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={reminderForm.processing}>
                {reminderForm.processing ? 'Agendando...' : 'Guardar Recordatorio'}
              </Button>
            </div>
          </form>
        </Modal>

      </div>
    </AppLayout>
  );
}
