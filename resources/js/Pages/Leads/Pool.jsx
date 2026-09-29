import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Shared/Card';
import Button from '@/Shared/Button';
import Modal from '@/Shared/Modal';
import ConfirmModal from '@/Shared/ConfirmModal';
import {
  Inbox,
  Search,
  Shuffle,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  Square,
  Eye,
  Filter,
  X,
  UserCheck
} from 'lucide-react';

export default function LeadsPool({ leads, filters, origenes = [], vendedores = [] }) {
  const { auth } = usePage().props;
  const user = auth?.user;
  const isAdmin = user?.rol?.nombre === 'Administrador';
  const isVendedor = user?.rol?.nombre === 'Vendedor';
  const canAssign = isAdmin || user?.rol?.nombre === 'Coordinador';

  const [search, setSearch] = useState(filters?.search || '');
  const [originFilter, setOriginFilter] = useState(filters?.id_origen || '');
  const [selectedLeads, setSelectedLeads] = useState([]);
  
  // Modal de asignación manual
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetLead, setTargetLead] = useState(null);

  // Modales bonitos de confirmación
  const [confirmRoundRobinOpen, setConfirmRoundRobinOpen] = useState(false);
  const [leadToClaim, setLeadToClaim] = useState(null);

  const assignForm = useForm({
    id_vendedor: vendedores[0]?.id_usuario || '',
  });

  const roundRobinForm = useForm({
    lead_ids: [],
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    router.get('/leads/bolsa-comun', {
      search,
      id_origen: originFilter,
    }, { preserveState: true });
  };

  const handleClearFilters = () => {
    setSearch('');
    setOriginFilter('');
    router.get('/leads/bolsa-comun');
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.data.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.data.map((l) => l.id_lead));
    }
  };

  const toggleSelectLead = (idLead) => {
    if (selectedLeads.includes(idLead)) {
      setSelectedLeads(selectedLeads.filter((id) => id !== idLead));
    } else {
      setSelectedLeads([...selectedLeads, idLead]);
    }
  };

  const executeRoundRobin = () => {
    roundRobinForm.setData('lead_ids', selectedLeads);
    roundRobinForm.post('/leads/asignar-automatico', {
      preserveScroll: true,
      onSuccess: () => {
        setConfirmRoundRobinOpen(false);
        setSelectedLeads([]);
      },
    });
  };

  const openAssignModal = (lead) => {
    setTargetLead(lead);
    assignForm.setData('id_vendedor', vendedores[0]?.id_usuario || '');
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!targetLead) return;

    assignForm.post(`/leads/${targetLead.id_lead}/asignar`, {
      preserveScroll: true,
      onSuccess: () => {
        setAssignModalOpen(false);
        setTargetLead(null);
      },
    });
  };

  const executeTomarLead = () => {
    if (!leadToClaim) return;

    router.post(`/leads/${leadToClaim.id_lead}/asignar`, {
      id_vendedor: user.id_usuario,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setLeadToClaim(null);
      },
    });
  };

  return (
    <AppLayout>
      <Head title="Bolsa Común de Prospectos" />

      <div className="space-y-6">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-heading)] flex items-center gap-2">
              <Inbox className="text-[var(--brand-primary)]" size={28} />
              <span>Bolsa Común de Prospectos</span>
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Prospectos libres sin asesor comercial asignado. Distribución por Round-Robin o asignación directa.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/leads">
              <Button variant="secondary" className="text-xs py-2">
                Ver Todos los Prospectos
              </Button>
            </Link>

            {isAdmin && leads.total > 0 && (
              <Button
                variant="primary"
                onClick={() => setConfirmRoundRobinOpen(true)}
                disabled={roundRobinForm.processing}
                className="flex items-center gap-2 text-xs py-2 bg-[var(--brand-primary)] hover:bg-[#32467d] text-white shadow-sm"
              >
                <Shuffle size={16} />
                <span>
                  {roundRobinForm.processing
                    ? 'Distribuyendo...'
                    : selectedLeads.length > 0
                    ? `Round-Robin (${selectedLeads.length} selec.)`
                    : 'Reparto Automático'}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Barra de Filtros */}
        <Card compact>
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div className="relative sm:col-span-2">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]" />
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono o correo en la bolsa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[#7aa5ff]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={originFilter}
                onChange={(e) => setOriginFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none"
              >
                <option value="">Todos los Orígenes</option>
                {origenes.map((origen) => (
                  <option key={origen.id_origen} value={origen.id_origen}>
                    {origen.nombre}
                  </option>
                ))}
              </select>

              <Button type="submit" variant="primary" className="text-sm py-2">
                <Filter size={15} />
              </Button>

              {(search || originFilter) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-[var(--radius-sm)]"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </form>
        </Card>

        {/* Tabla de Bolsa Común */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-main)]">
              <thead className="bg-[var(--bg-highlight)] text-xs font-semibold uppercase text-[var(--text-heading)] border-b border-[var(--border-color-light)]">
                <tr>
                  {isAdmin && (
                    <th className="px-4 py-3.5 w-10 text-center">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-[var(--brand-primary)] hover:text-blue-800"
                        title="Seleccionar todos"
                      >
                        {leads.data && leads.data.length > 0 && selectedLeads.length === leads.data.length ? (
                          <CheckSquare size={18} />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    </th>
                  )}
                  <th className="px-6 py-3.5">Prospecto</th>
                  <th className="px-6 py-3.5">Contacto</th>
                  <th className="px-6 py-3.5">Origen</th>
                  <th className="px-6 py-3.5">Fecha Ingreso</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color-light)]">
                {leads.data && leads.data.length > 0 ? (
                  leads.data.map((lead) => {
                    const isSelected = selectedLeads.includes(lead.id_lead);
                    return (
                      <tr
                        key={lead.id_lead}
                        className={`transition ${isSelected ? 'bg-blue-50/60' : 'hover:bg-gray-50/70'}`}
                      >
                        {isAdmin && (
                          <td className="px-4 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleSelectLead(lead.id_lead)}
                              className="text-[var(--brand-primary)]"
                            >
                              {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                            </button>
                          </td>
                        )}

                        {/* Prospecto */}
                        <td className="px-6 py-4">
                          <Link
                            href={`/leads/${lead.id_lead}`}
                            className="font-bold text-[var(--text-heading)] hover:text-[var(--color-primary)] transition block"
                          >
                            {lead.nombre}
                          </Link>
                          <span className="text-xs text-[var(--text-muted)]">
                            Registrado por: {lead.creador?.nombre_completo || 'Sistema'}
                          </span>
                        </td>

                        {/* Contacto */}
                        <td className="px-6 py-4 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)]">
                            <Phone size={13} className="text-[var(--color-secondary)]" />
                            <span>{lead.telefono}</span>
                          </div>
                          {lead.correo && (
                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                              <Mail size={13} className="text-[var(--color-secondary)]" />
                              <span className="truncate max-w-[180px]">{lead.correo}</span>
                            </div>
                          )}
                        </td>

                        {/* Origen */}
                        <td className="px-6 py-4">
                          <span className="inline-block px-2.5 py-1 text-xs font-medium bg-[#ebf0f9] text-[var(--brand-primary)] rounded-[var(--radius-sm)]">
                            {lead.origen?.nombre || 'Desconocido'}
                          </span>
                        </td>

                        {/* Fecha */}
                        <td className="px-6 py-4 text-xs text-[var(--text-muted)]">
                          <div className="flex items-center gap-1">
                            <Calendar size={13} />
                            <span>{new Date(lead.created_at).toLocaleString()}</span>
                          </div>
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2 justify-end">
                            <Link
                              href={`/leads/${lead.id_lead}`}
                              className="p-1.5 text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--bg-highlight)] rounded transition"
                              title="Ver Ficha"
                            >
                              <Eye size={17} />
                            </Link>

                            {/* Botón para que el vendedor tome el lead */}
                            {isVendedor && (
                              <Button
                                variant="secondary"
                                onClick={() => setLeadToClaim(lead)}
                                className="text-xs py-1.5 px-3"
                              >
                                Tomar Lead
                              </Button>
                            )}

                            {/* Botón para que el Admin/Coordinador asigne manualmente */}
                            {canAssign && (
                              <Button
                                variant="primary"
                                onClick={() => openAssignModal(lead)}
                                className="text-xs py-1.5 px-3 flex items-center gap-1"
                              >
                                <UserPlus size={14} />
                                <span>Asignar</span>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                      <Inbox size={40} className="mx-auto mb-2 text-gray-300" />
                      <p className="font-semibold text-[var(--text-heading)]">No hay prospectos en la Bolsa Común</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Todos los prospectos actuales ya han sido asignados a sus respectivos asesores comerciales.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {leads.links && leads.links.length > 3 && (
            <div className="px-6 py-4 border-t border-[var(--border-color-light)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">
                Mostrando {leads.from || 0} a {leads.to || 0} de {leads.total} en bolsa
              </span>
              <div className="flex gap-1">
                {leads.links.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.url || '#'}
                    className={`px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition ${
                      link.active
                        ? 'bg-[var(--color-primary)] text-white'
                        : link.url
                        ? 'bg-white text-[var(--text-main)] border border-[var(--border-color-dark)] hover:bg-gray-50'
                        : 'text-gray-300 pointer-events-none'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Modal de Asignación Manual */}
        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title={`Asignar Asesor a: ${targetLead?.nombre || ''}`}
        >
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <p className="text-xs text-[var(--text-muted)]">
              Selecciona el asesor comercial que atenderá a este prospecto desde este momento:
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
                {assignForm.processing ? 'Asignando...' : 'Asignar Asesor'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal de Confirmación Round-Robin */}
        <ConfirmModal
          isOpen={confirmRoundRobinOpen}
          onClose={() => setConfirmRoundRobinOpen(false)}
          onConfirm={executeRoundRobin}
          title="¿Ejecutar Reparto Automático (Round-Robin)?"
          message={`Se distribuirán de manera rotativa y equitativa ${
            selectedLeads.length > 0 ? selectedLeads.length : leads.total
          } prospecto(s) entre todos los asesores comerciales activos.`}
          confirmText="Sí, Repartir Prospectos"
          cancelText="Cancelar"
          variant="brand"
          icon={Shuffle}
          processing={roundRobinForm.processing}
        />

        {/* Modal de Confirmación Tomar Lead (Vendedor) */}
        <ConfirmModal
          isOpen={Boolean(leadToClaim)}
          onClose={() => setLeadToClaim(null)}
          onConfirm={executeTomarLead}
          title="¿Tomar este prospecto?"
          message={`¿Deseas incorporar a "${leadToClaim?.nombre || 'este prospecto'}" a tu cartera personal de atención comercial?`}
          confirmText="Sí, Tomar Prospecto"
          cancelText="Cancelar"
          variant="primary"
          icon={UserCheck}
        />
      </div>
    </AppLayout>
  );
}
