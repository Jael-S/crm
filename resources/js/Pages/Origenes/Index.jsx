import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Shared/Button';
import Badge from '@/Shared/Badge';
import ConfirmModal from '@/Shared/ConfirmModal';
import { Plus, Edit2, Trash2, Share2, AlertCircle, X, Check } from 'lucide-react';

export default function OrigenesIndex({ origenes = [] }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingOrigen, setEditingOrigen] = useState(null);
  const [deletingOrigen, setDeletingOrigen] = useState(null);

  // Formulario para crear
  const createForm = useForm({
    nombre: '',
  });

  // Formulario para editar
  const editForm = useForm({
    nombre: '',
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createForm.post('/origenes', {
      onSuccess: () => {
        createForm.reset();
        setIsCreateOpen(false);
      },
    });
  };

  const handleEditOpen = (origen) => {
    setEditingOrigen(origen);
    editForm.setData('nombre', origen.nombre);
    editForm.clearErrors();
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    editForm.put(`/origenes/${editingOrigen.id_origen}`, {
      onSuccess: () => {
        setEditingOrigen(null);
        editForm.reset();
      },
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingOrigen) return;

    router.delete(`/origenes/${deletingOrigen.id_origen}`, {
      onFinish: () => setDeletingOrigen(null),
    });
  };

  return (
    <AppLayout title="Canales de Origen">
      <Head title="Canales de Origen - CRM Educativo" />

      <div className="space-y-6">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[var(--border-color-light)]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-heading)] flex items-center gap-2">
              <Share2 className="text-[var(--brand-primary)]" size={26} />
              Canales de Origen
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Administra los medios de prospección desde donde llegan los interesados a la facultad.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() => {
              createForm.reset();
              createForm.clearErrors();
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus size={18} />
            Nuevo Canal
          </Button>
        </div>

        {/* Tabla de Orígenes */}
        <div
          className="bg-[var(--bg-surface)] border border-[var(--border-color-light)] overflow-hidden shadow-sm"
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[var(--bg-highlight)] text-[var(--text-heading)] font-semibold border-b border-[var(--border-color-dark)]">
                  <th className="py-3.5 px-4 w-16">ID</th>
                  <th className="py-3.5 px-4">Nombre del Canal</th>
                  <th className="py-3.5 px-4 text-center">Prospectos Vinculados</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color-light)]">
                {origenes.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-[var(--text-muted)]">
                      No hay canales de origen registrados en el sistema.
                    </td>
                  </tr>
                ) : (
                  origenes.map((origen) => (
                    <tr
                      key={origen.id_origen}
                      className="hover:bg-[var(--bg-highlight)]/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-muted)]">
                        #{origen.id_origen}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[var(--text-heading)]">
                        {origen.nombre}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={origen.leads_count > 0 ? 'primary' : 'gray'}
                          className="font-mono"
                        >
                          {origen.leads_count} prospecto{origen.leads_count === 1 ? '' : 's'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditOpen(origen)}
                            title="Editar nombre"
                            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--bg-highlight)] transition cursor-pointer"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingOrigen(origen)}
                            disabled={origen.leads_count > 0}
                            title={
                              origen.leads_count > 0
                                ? 'No se puede eliminar: tiene prospectos asignados'
                                : 'Eliminar canal'
                            }
                            className={`p-1.5 rounded-[var(--radius-sm)] transition ${
                              origen.leads_count > 0
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 cursor-pointer'
                            }`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Crear Canal */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div
              className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-color-light)] shadow-2xl p-6 relative animate-in zoom-in-95 duration-150"
              style={{ borderRadius: 'var(--radius-xl)' }}
            >
              <button
                onClick={() => setIsCreateOpen(false)}
                className="absolute right-4 top-4 text-[var(--color-secondary)] hover:text-[var(--text-heading)] p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <h3 className="text-lg font-bold text-[var(--text-heading)] mb-1">
                Nuevo Canal de Origen
              </h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Ingresa el nombre del medio o campaña de captación (ej. TikTok, Feria Expocruz, Radio).
              </p>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-heading)] mb-1.5">
                    Nombre del Canal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.data.nombre}
                    onChange={(e) => createForm.setData('nombre', e.target.value)}
                    placeholder="Ej. Campaña TikTok 2026"
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-color-dark)] text-sm rounded-[var(--radius-sm)] text-[var(--text-heading)] focus:outline-none focus:border-[var(--color-primary)] transition"
                    autoFocus
                  />
                  {createForm.errors.nombre && (
                    <p className="text-xs text-red-600 mt-1">{createForm.errors.nombre}</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border-color-light)]">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsCreateOpen(false)}
                    disabled={createForm.processing}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={createForm.processing || !createForm.data.nombre.trim()}
                  >
                    {createForm.processing ? 'Guardando...' : 'Crear Canal'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Editar Canal */}
        {editingOrigen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div
              className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-color-light)] shadow-2xl p-6 relative animate-in zoom-in-95 duration-150"
              style={{ borderRadius: 'var(--radius-xl)' }}
            >
              <button
                onClick={() => setEditingOrigen(null)}
                className="absolute right-4 top-4 text-[var(--color-secondary)] hover:text-[var(--text-heading)] p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <h3 className="text-lg font-bold text-[var(--text-heading)] mb-1">
                Editar Canal de Origen
              </h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Modifica el nombre de este canal. Se actualizará en los prospectos vinculados.
              </p>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-heading)] mb-1.5">
                    Nombre del Canal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.data.nombre}
                    onChange={(e) => editForm.setData('nombre', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-color-dark)] text-sm rounded-[var(--radius-sm)] text-[var(--text-heading)] focus:outline-none focus:border-[var(--color-primary)] transition"
                    autoFocus
                  />
                  {editForm.errors.nombre && (
                    <p className="text-xs text-red-600 mt-1">{editForm.errors.nombre}</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border-color-light)]">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditingOrigen(null)}
                    disabled={editForm.processing}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={editForm.processing || !editForm.data.nombre.trim()}
                  >
                    {editForm.processing ? 'Actualizando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Confirmar Eliminación */}
        <ConfirmModal
          isOpen={!!deletingOrigen}
          onClose={() => setDeletingOrigen(null)}
          onConfirm={handleDeleteConfirm}
          variant="danger"
          title="¿Eliminar Canal de Origen?"
          message={`¿Estás segura de eliminar permanentemente el canal "${deletingOrigen?.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Sí, eliminar canal"
          cancelText="Cancelar"
        />
      </div>
    </AppLayout>
  );
}
