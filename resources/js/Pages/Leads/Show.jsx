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
  MessageSquare
} from 'lucide-react';

export default function LeadsShow({ lead, vendedores = [] }) {
  const { auth } = usePage().props;
  const user = auth?.user;
  const canAssign = user?.rol?.nombre === 'Administrador' || user?.rol?.nombre === 'Coordinador';

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  // Formulario Asignación Manual
  const assignForm = useForm({
    id_vendedor: vendedores[0]?.id_usuario || '',
  });

  // Formulario Transferencia con Motivo
  const transferForm = useForm({
    id_vendedor: vendedores[0]?.id_usuario || '',
    motivo: '',
  });

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

          <div className="flex items-center gap-2">
            <Link href={`/leads/${lead.id_lead}/edit`}>
              <Button variant="secondary" className="flex items-center gap-1.5 text-xs py-2">
                <Edit2 size={15} />
                <span>Editar Datos</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Grilla Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna Izquierda: Información de Contacto y Estado */}
          <div className="md:col-span-2 space-y-6">
            {/* Tarjeta de Contacto */}
            <Card>
              <h2 className="text-sm font-bold text-[var(--text-heading)] uppercase tracking-wider mb-4 pb-2 border-b border-[var(--border-color-light)] flex items-center gap-2">
                <Phone size={16} className="text-[var(--brand-primary)]" />
                <span>Datos de Contacto</span>
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
                  <span className="text-xs text-[var(--text-muted)] block">Ciudad de Residencia</span>
                  <span className="text-sm font-semibold text-[var(--text-heading)] block mt-0.5">
                    {lead.ciudad || <em className="text-gray-400 font-normal">No especificada</em>}
                  </span>
                </div>
              </div>
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
      </div>
    </AppLayout>
  );
}
