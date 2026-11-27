import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Shared/Button';
import Badge from '@/Shared/Badge';
import ConfirmModal from '@/Shared/ConfirmModal';
import { Plus, Edit2, Trash2, XCircle, AlertCircle, X, Check } from 'lucide-react';

export default function MotivosPerdidaIndex({ motivos = [] }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMotivo, setEditingMotivo] = useState(null);
  const [deletingMotivo, setDeletingMotivo] = useState(null);

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
    createForm.post('/motivos-perdida', {
      onSuccess: () => {
        createForm.reset();
        setIsCreateOpen(false);
      },
    });
  };

  const handleEditOpen = (motivo) => {
    setEditingMotivo(motivo);
    editForm.setData('nombre', motivo.nombre);
    editForm.clearErrors();
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    editForm.put(`/motivos-perdida/${editingMotivo.id_motivo}`, {
      onSuccess: () => {
        setEditingMotivo(null);
        editForm.reset();
      },
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingMotivo) return;

    router.delete(`/motivos-perdida/${deletingMotivo.id_motivo}`, {
      onFinish: () => setDeletingMotivo(null),
    });
  };

  return (
    <AppLayout title="Motivos de Pérdida">
      <Head title="Motivos de Pérdida - CRM Educativo" />

      <div className="space-y-6">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[var(--border-color-light)]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-heading)] flex items-center gap-2">
              <XCircle className="text-rose-600" size={26} />
              Motivos de Pérdida / Descarte
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Catálogo de causas por las cuales un prospecto es descartado o finaliza el proceso de admisión.
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
            Nuevo Motivo
          </Button>
        </div>

        {/* Tabla de Motivos de Pérdida */}
        <div
          className="bg-[var(--bg-surface)] border border-[var(--border-color-light)] overflow-hidden shadow-sm"
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[var(--bg-highlight)] text-[var(--text-heading)] font-semibold border-b border-[var(--border-color-dark)]">
                  <th className="py-3.5 px-4 w-16">ID</th>
                  <th className="py-3.5 px-4">Motivo de Pérdida</th>
                  <th className="py-3.5 px-4 text-center">Prospectos Descartados</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color-light)]">
                {motivos.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-[var(--text-muted)]">
                      No hay motivos de pérdida registrados en el sistema.
                    </td>
                  </tr>
                ) : (
                  motivos.map((motivo) => (
                    <tr
                      key={motivo.id_motivo}
                      className="hover:bg-[var(--bg-highlight)]/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-muted)]">
                        #{motivo.id_motivo}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[var(--text-heading)]">
                        {motivo.nombre}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={motivo.leads_count > 0 ? 'danger' : 'gray'}
                          className="font-mono"
                        >
                          {motivo.leads_count} prospecto{motivo.leads_count === 1 ? '' : 's'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditOpen(motivo)}
                            title="Editar motivo"
                            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--bg-highlight)] transition cursor-pointer"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingMotivo(motivo)}
                            disabled={motivo.leads_count > 0}
                            title={
                              motivo.leads_count > 0
                                ? 'No se puede eliminar: tiene prospectos asignados a este motivo'
                                : 'Eliminar motivo'
                            }
                            className={`p-1.5 rounded-[var(--radius-sm)] transition ${
                              motivo.leads_count > 0
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

        {/* Modal: Crear Motivo */}
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
                Nuevo Motivo de Pérdida
              </h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Ingresa una causa de descarte clara (ej. Sin presupuesto, No cumple requisitos académicos, Eligió otra institución).
              </p>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-heading)] mb-1.5">
                    Nombre del Motivo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.data.nombre}
                    onChange={(e) => createForm.setData('nombre', e.target.value)}
                    placeholder="Ej. Incompatibilidad de horarios"
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
                    {createForm.processing ? 'Guardando...' : 'Crear Motivo'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Editar Motivo */}
        {editingMotivo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div
              className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-color-light)] shadow-2xl p-6 relative animate-in zoom-in-95 duration-150"
              style={{ borderRadius: 'var(--radius-xl)' }}
            >
              <button
                onClick={() => setEditingMotivo(null)}
                className="absolute right-4 top-4 text-[var(--color-secondary)] hover:text-[var(--text-heading)] p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <h3 className="text-lg font-bold text-[var(--text-heading)] mb-1">
                Editar Motivo de Pérdida
              </h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Modifica la descripción del motivo. Se actualizará en los prospectos correspondientes.
              </p>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-heading)] mb-1.5">
                    Nombre del Motivo <span className="text-red-500">*</span>
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
                    onClick={() => setEditingMotivo(null)}
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
          isOpen={!!deletingMotivo}
          onClose={() => setDeletingMotivo(null)}
          onConfirm={handleDeleteConfirm}
          variant="danger"
          title="¿Eliminar Motivo de Pérdida?"
          message={`¿Estás segura de eliminar permanentemente el motivo "${deletingMotivo?.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Sí, eliminar motivo"
          cancelText="Cancelar"
        />
      </div>
    </AppLayout>
  );
}
