import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Shared/Card';
import Button from '@/Shared/Button';
import {
  UserPlus,
  Search,
  Shield,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Edit2,
  X
} from 'lucide-react';

export default function UsersIndex({ usuarios, roles, filters }) {
  const { auth } = usePage().props;
  const currentUserId = auth?.user?.id_usuario;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [search, setSearch] = useState(filters?.search || '');
  const [roleFilter, setRoleFilter] = useState(filters?.id_rol || '');
  const [statusFilter, setStatusFilter] = useState(filters?.activo || '');

  // Formulario para Crear / Editar
  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    nombre_completo: '',
    correo: '',
    id_rol: roles[2]?.id_rol || 3, // Default Vendedor
    password: '',
    activo: true,
    participa_round_robin: true,
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    router.get('/usuarios', {
      search,
      id_rol: roleFilter,
      activo: statusFilter,
    }, { preserveState: true });
  };

  const openCreateModal = () => {
    setEditingUser(null);
    clearErrors();
    reset();
    setData({
      nombre_completo: '',
      correo: '',
      id_rol: roles[2]?.id_rol || 3,
      password: '',
      activo: true,
      participa_round_robin: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    clearErrors();
    setData({
      nombre_completo: user.nombre_completo,
      correo: user.correo,
      id_rol: user.id_rol,
      password: '',
      activo: Boolean(user.activo),
      participa_round_robin: Boolean(user.participa_round_robin),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    reset();
    clearErrors();
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingUser) {
      put(`/usuarios/${editingUser.id_usuario}`, {
        onSuccess: () => closeModal(),
      });
    } else {
      post('/usuarios', {
        onSuccess: () => closeModal(),
      });
    }
  };

  const toggleStatus = (userId) => {
    if (userId === currentUserId) {
      alert('El administrador no puede bloquearse a sí mismo o desactivar su cuenta.');
      return;
    }
    router.patch(`/usuarios/${userId}/status`, {}, { preserveScroll: true });
  };

  const toggleRoundRobin = (userId) => {
    router.patch(`/usuarios/${userId}/round-robin`, {}, { preserveScroll: true });
  };

  const getRoleBadge = (roleName) => {
    switch (roleName) {
      case 'Administrador':
        return 'bg-blue-100 text-[var(--brand-primary)] border-blue-200';
      case 'Coordinador':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Vendedor':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AppLayout>
      <Head title="Gestión de Usuarios" />

      {/* Cabecera de Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-heading)]">Gestión de Usuarios</h1>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <UserPlus size={18} />
          <span>Nuevo Usuario</span>
        </Button>
      </div>

      {/* Filtros de Búsqueda */}
      <Card compact>
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[#7aa5ff]"
            />
          </div>

          <div className="w-full md:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none"
            >
              <option value="">Todos los Roles</option>
              {roles.map((r) => (
                <option key={r.id_rol} value={r.id_rol}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none"
            >
              <option value="">Cualquier Estado</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          <Button type="submit" variant="secondary" className="w-full md:w-auto">
            Filtrar
          </Button>
        </form>
      </Card>

      {/* Tabla de Usuarios */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[var(--bg-highlight)] text-[var(--text-heading)] border-b border-[var(--border-color-light)]">
              <tr>
                <th className="px-6 py-3.5 font-bold">Usuario</th>
                <th className="px-6 py-3.5 font-bold">Rol</th>
                <th className="px-6 py-3.5 font-bold text-center">Round-Robin</th>
                <th className="px-6 py-3.5 font-bold text-center">Estado</th>
                <th className="px-6 py-3.5 font-bold">Último Acceso</th>
                <th className="px-6 py-3.5 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color-light)]">
              {usuarios.data && usuarios.data.length > 0 ? (
                usuarios.data.map((u) => (
                  <tr key={u.id_usuario} className="hover:bg-gray-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--text-heading)]">{u.nombre_completo}</div>
                      <div className="text-xs text-[var(--text-muted)]">{u.correo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadge(u.rol?.nombre)}`}>
                        {u.rol?.nombre}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {u.id_rol === 3 ? (
                        <button
                          type="button"
                          onClick={() => toggleRoundRobin(u.id_usuario)}
                          title="Clic para cambiar participación en Round-Robin"
                          className={`cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition ${
                            u.participa_round_robin
                              ? 'bg-blue-50 text-[var(--color-primary)] border border-blue-200 hover:bg-blue-100'
                              : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          <RefreshCw size={12} className={u.participa_round_robin ? 'animate-spin-slow' : ''} />
                          {u.participa_round_robin ? 'Participa' : 'Excluido'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {u.id_usuario === currentUserId ? (
                        <span
                          title="No puedes desactivar tu propia cuenta de Administrador"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed opacity-90"
                        >
                          <CheckCircle2 size={12} />
                          Activo (Tú)
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleStatus(u.id_usuario)}
                          title="Clic para activar o desactivar cuenta"
                          className={`cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition ${
                            u.activo
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {u.activo ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--text-muted)]">
                      {u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleString('es-BO') : 'Sin registros'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(u)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[var(--brand-primary)] hover:bg-blue-50 rounded border border-blue-100 transition cursor-pointer"
                      >
                        <Edit2 size={13} />
                        <span>Editar</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-[var(--text-muted)]">
                    No se encontraron usuarios con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {usuarios.links && usuarios.links.length > 3 && (
          <div className="p-4 border-t border-[var(--border-color-light)] flex justify-between items-center text-xs text-[var(--text-muted)]">
            <span>Total: {usuarios.total} usuarios</span>
            <div className="flex gap-1">
              {usuarios.links.map((link, idx) => (
                <button
                  key={idx}
                  disabled={!link.url || link.active}
                  onClick={() => router.get(link.url, {}, { preserveState: true })}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                  className={`px-3 py-1 rounded border text-xs font-medium ${
                    link.active
                      ? 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  } ${!link.url ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Modal Crear / Editar Usuario */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-[var(--radius-xl)] shadow-xl w-full max-w-lg border border-[var(--border-color-light)] overflow-hidden animate-fadeIn">
            {/* Cabecera Modal */}
            <div className="bg-[var(--brand-primary)] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Shield size={18} />
                {editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-white/80 hover:text-white transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario Modal */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-heading)] uppercase mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={data.nombre_completo}
                  onChange={(e) => setData('nombre_completo', e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  required
                  className="w-full px-3 py-2 text-sm border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[#7aa5ff]"
                />
                {errors.nombre_completo && (
                  <p className="text-xs text-[var(--color-danger)] mt-1">{errors.nombre_completo}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-heading)] uppercase mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={data.correo}
                  onChange={(e) => setData('correo', e.target.value)}
                  placeholder="juan.perez@crm.bo"
                  required
                  className="w-full px-3 py-2 text-sm border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[#7aa5ff]"
                />
                {errors.correo && (
                  <p className="text-xs text-[var(--color-danger)] mt-1">{errors.correo}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-heading)] uppercase mb-1">
                  Rol de Acceso *
                </label>
                <select
                  value={data.id_rol}
                  onChange={(e) => setData('id_rol', parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[#7aa5ff] bg-white"
                >
                  {roles.map((r) => (
                    <option key={r.id_rol} value={r.id_rol}>
                      {r.nombre} — {r.descripcion}
                    </option>
                  ))}
                </select>
                {errors.id_rol && (
                  <p className="text-xs text-[var(--color-danger)] mt-1">{errors.id_rol}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-heading)] uppercase mb-1">
                  Contraseña {editingUser ? '(Opcional, dejar vacío para mantener la actual)' : '*'}
                </label>
                <input
                  type="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  placeholder={editingUser ? '••••••••' : 'Mínimo 6 caracteres'}
                  required={!editingUser}
                  className="w-full px-3 py-2 text-sm border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[#7aa5ff]"
                />
                {errors.password && (
                  <p className="text-xs text-[var(--color-danger)] mt-1">{errors.password}</p>
                )}
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-[var(--border-color-light)] space-y-2">
                {editingUser?.id_usuario === currentUserId ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-[var(--brand-primary)]">
                    <strong>Cuenta de Administrador protegida:</strong> Tu usuario debe permanecer activo para no bloquear el acceso al sistema.
                  </div>
                ) : (
                  <label className="flex items-center space-x-2 text-xs text-[var(--text-heading)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.activo}
                      onChange={(e) => setData('activo', e.target.checked)}
                      className="rounded border-[var(--border-color-dark)] text-[var(--color-primary)]"
                    />
                    <span className="font-semibold">Cuenta Activa (Habilita el inicio de sesión)</span>
                  </label>
                )}

                {Number(data.id_rol) === 3 && (
                  <label className="flex items-center space-x-2 text-xs text-[var(--text-heading)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.participa_round_robin}
                      onChange={(e) => setData('participa_round_robin', e.target.checked)}
                      className="rounded border-[var(--border-color-dark)] text-[var(--color-primary)]"
                    />
                    <span className="font-semibold">Participar en reparto automático Round-Robin (RF 2.3)</span>
                  </label>
                )}
              </div>

              {/* Acciones */}
              <div className="pt-4 flex justify-end gap-2 border-t border-[var(--border-color-light)]">
                <Button type="button" variant="ghost" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Guardando...' : editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
