import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Shared/Card';
import Button from '@/Shared/Button';
import Badge from '@/Shared/Badge';
import {
  UserCheck,
  UserPlus,
  Search,
  Inbox,
  Phone,
  Mail,
  Filter,
  Eye,
  Edit2,
  Calendar,
  X
} from 'lucide-react';

export default function LeadsIndex({ leads, filters, origenes = [], etapas = [], vendedores = [] }) {
  const [search, setSearch] = useState(filters?.search || '');
  const [stageFilter, setStageFilter] = useState(filters?.id_etapa || '');
  const [originFilter, setOriginFilter] = useState(filters?.id_origen || '');
  const [vendorFilter, setVendorFilter] = useState(filters?.id_vendedor || '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    router.get('/leads', {
      search,
      id_etapa: stageFilter,
      id_origen: originFilter,
      id_vendedor: vendorFilter,
    }, { preserveState: true });
  };

  const handleClearFilters = () => {
    setSearch('');
    setStageFilter('');
    setOriginFilter('');
    setVendorFilter('');
    router.get('/leads');
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
      <Head title="Prospectos (Leads)" />

      <div className="space-y-6">
        {/* Cabecera de Página */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-heading)] flex items-center gap-2">
              <UserCheck className="text-[var(--brand-primary)]" size={28} />
              <span>Prospectos (Leads)</span>
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Cartera comercial de prospectos y postulantes a diplomados y programas.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/leads/bolsa-comun">
              <Button variant="secondary" className="flex items-center gap-2">
                <Inbox size={18} />
                <span>Bolsa Común</span>
              </Button>
            </Link>

            <Link href="/leads/create">
              <Button variant="primary" className="flex items-center gap-2">
                <UserPlus size={18} />
                <span>Nuevo Prospecto</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Barra de Filtros */}
        <Card compact>
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
            {/* Buscador */}
            <div className="relative lg:col-span-2">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]" />
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono o correo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[#7aa5ff]"
              />
            </div>

            {/* Filtro Etapa */}
            <div>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[#7aa5ff]"
              >
                <option value="">Todas las Etapas</option>
                {etapas.map((etapa) => (
                  <option key={etapa.id_etapa} value={etapa.id_etapa}>
                    {etapa.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Origen */}
            <div>
              <select
                value={originFilter}
                onChange={(e) => setOriginFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[#7aa5ff]"
              >
                <option value="">Todos los Orígenes</option>
                {origenes.map((origen) => (
                  <option key={origen.id_origen} value={origen.id_origen}>
                    {origen.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" className="flex-1 text-sm py-2">
                <Filter size={16} className="mr-1.5" />
                Filtrar
              </Button>
              {(search || stageFilter || originFilter || vendorFilter) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  title="Limpiar filtros"
                  className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-[var(--radius-sm)] transition"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </form>
        </Card>

        {/* Tabla de Prospectos */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-main)]">
              <thead className="bg-[var(--bg-highlight)] text-xs font-semibold uppercase text-[var(--text-heading)] border-b border-[var(--border-color-light)]">
                <tr>
                  <th className="px-6 py-3.5">Prospecto</th>
                  <th className="px-6 py-3.5">Contacto</th>
                  <th className="px-6 py-3.5">Origen</th>
                  <th className="px-6 py-3.5">Etapa</th>
                  <th className="px-6 py-3.5">Vendedor Asignado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color-light)]">
                {leads.data && leads.data.length > 0 ? (
                  leads.data.map((lead) => (
                    <tr key={lead.id_lead} className="hover:bg-gray-50/70 transition">
                      {/* Nombre & Snapshot */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/leads/${lead.id_lead}`}
                          className="font-bold text-[var(--text-heading)] hover:text-[var(--color-primary)] transition"
                        >
                          {lead.nombre}
                        </Link>
                        <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                          <Calendar size={12} />
                          <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Contacto */}
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-main)] font-medium">
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

                      {/* Etapa */}
                      <td className="px-6 py-4">
                        <Badge variant={getStageBadgeVariant(lead.etapa?.nombre)}>
                          {lead.etapa?.nombre || 'Nuevo'}
                        </Badge>
                      </td>

                      {/* Vendedor */}
                      <td className="px-6 py-4">
                        {lead.vendedor ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[var(--brand-primary)] text-white text-xs font-bold flex items-center justify-center">
                              {lead.vendedor.nombre_completo.charAt(0)}
                            </div>
                            <span className="text-xs font-semibold text-[var(--text-heading)]">
                              {lead.vendedor.nombre_completo}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                            <Inbox size={12} />
                            Bolsa Común
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <Link
                            href={`/leads/${lead.id_lead}`}
                            className="p-1.5 text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--bg-highlight)] rounded transition"
                            title="Ver Ficha Detallada"
                          >
                            <Eye size={17} />
                          </Link>
                          <Link
                            href={`/leads/${lead.id_lead}/edit`}
                            className="p-1.5 text-[var(--color-secondary)] hover:text-[var(--brand-primary)] hover:bg-[var(--bg-highlight)] rounded transition"
                            title="Editar Datos"
                          >
                            <Edit2 size={17} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                      <Inbox size={40} className="mx-auto mb-2 text-gray-300" />
                      <p className="font-semibold text-[var(--text-heading)]">No se encontraron prospectos</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Intenta ajustar los filtros de búsqueda o registra un nuevo prospecto.
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
                Mostrando {leads.from || 0} a {leads.to || 0} de {leads.total} prospectos
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
      </div>
    </AppLayout>
  );
}
