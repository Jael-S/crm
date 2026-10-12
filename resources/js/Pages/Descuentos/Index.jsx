import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Shared/Card';
import Button from '@/Shared/Button';
import Badge from '@/Shared/Badge';
import Modal from '@/Shared/Modal';
import { Tag, Plus, Edit2, CheckCircle2, XCircle, Percent, AlertCircle } from 'lucide-react';

export default function DescuentosIndex({ descuentos = [] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDescuento, setEditingDescuento] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    porcentaje: '',
    descripcion: '',
    activo: true,
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const openCreateModal = () => {
    setEditingDescuento(null);
    setForm({ nombre: '', porcentaje: '', descripcion: '', activo: true });
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (d) => {
    setEditingDescuento(d);
    setForm({
      nombre: d.nombre,
      porcentaje: d.porcentaje,
      descripcion: d.descripcion || '',
      activo: Boolean(d.activo),
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);

    if (editingDescuento) {
      router.put(`/descuentos/${editingDescuento.id_descuento}`, form, {
        onSuccess: () => {
          setModalOpen(false);
          setProcessing(false);
        },
        onError: (errs) => {
          setErrors(errs);
          setProcessing(false);
        },
      });
    } else {
      router.post('/descuentos', form, {
        onSuccess: () => {
          setModalOpen(false);
          setProcessing(false);
        },
        onError: (errs) => {
          setErrors(errs);
          setProcessing(false);
        },
      });
    }
  };

  const handleToggle = (id) => {
    router.patch(`/descuentos/${id}/toggle`, {}, { preserveScroll: true });
  };

  return (
    <AppLayout>
      <Head title="Descuentos Comerciales" />

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-heading)] flex items-center gap-2">
              <Tag size={24} className="text-[var(--brand-primary)]" />
              <span>Descuentos Comerciales</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Catálogo de promociones institucionales aplicables a los prospectos (máximo 1 por lead).
            </p>
          </div>

          <Button onClick={openCreateModal} className="flex items-center gap-1.5 text-xs py-2">
            <Plus size={16} />
            <span>Nuevo Descuento</span>
          </Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color-light)] text-[var(--text-muted)] text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Nombre de la Promoción</th>
                  <th className="py-3 px-4 font-semibold">Porcentaje</th>
                  <th className="py-3 px-4 font-semibold">Descripción / Condiciones</th>
                  <th className="py-3 px-4 font-semibold text-center">Leads Aplicados</th>
                  <th className="py-3 px-4 font-semibold text-center">Estado</th>
                  <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color-light)]">
                {descuentos.length > 0 ? (
                  descuentos.map((d) => (
                    <tr key={d.id_descuento} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4 font-medium text-[var(--text-heading)]">
                        {d.nombre}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                          <Percent size={12} />
                          {d.porcentaje}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[var(--text-muted)] max-w-xs truncate">
                        {d.descripcion || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs font-semibold">
                        {d.leads_count || 0}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(d.id_descuento)}
                          className="cursor-pointer transition transform active:scale-95"
                          title="Clic para cambiar estado"
                        >
                          <Badge variant={d.activo ? 'success' : 'danger'}>
                            {d.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          onClick={() => openEditModal(d)}
                          className="text-xs p-1.5"
                          title="Editar descuento"
                        >
                          <Edit2 size={15} />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[var(--text-muted)]">
                      No hay descuentos registrados actualmente en el sistema.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal para Crear / Editar Descuento */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDescuento ? 'Editar Descuento Comercial' : 'Crear Nuevo Descuento Comercial'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1">
              Nombre de la Promoción <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Pronto Pago, Descuento Exalumno..."
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--brand-primary)]"
              required
            />
            {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1">
              Porcentaje de Descuento (%) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Percent size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="100"
                placeholder="Ej. 10.00"
                value={form.porcentaje}
                onChange={(e) => setForm({ ...form, porcentaje: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--brand-primary)]"
                required
              />
            </div>
            {errors.porcentaje && <p className="text-xs text-red-500 mt-1">{errors.porcentaje}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1">
              Descripción o Condiciones
            </label>
            <textarea
              rows={3}
              placeholder="Ej. Aplica para pagos al contado realizados antes del inicio de módulo..."
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="descuento-activo"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              className="rounded text-[var(--brand-primary)] focus:ring-0"
            />
            <label htmlFor="descuento-activo" className="text-xs font-medium text-[var(--text-heading)] cursor-pointer">
              Promoción activa y disponible para vendedores
            </label>
          </div>

          <div className="pt-3 border-t border-[var(--border-color-light)] flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? 'Guardando...' : editingDescuento ? 'Actualizar Descuento' : 'Crear Descuento'}
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
