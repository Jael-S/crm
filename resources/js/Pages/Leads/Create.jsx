import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Shared/Card';
import Button from '@/Shared/Button';
import {
  UserPlus,
  ArrowLeft,
  User,
  Phone,
  Mail,
  Share2,
  UserCheck
} from 'lucide-react';

export default function LeadsCreate({ origenes = [], vendedores = [] }) {
  const { data, setData, post, processing, errors } = useForm({
    nombre: '',
    telefono: '',
    correo: '',
    id_origen: origenes[0]?.id_origen || '',
    id_vendedor: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/leads');
  };

  return (
    <AppLayout>
      <Head title="Nuevo Prospecto" />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Cabecera */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/leads"
              className="p-2 bg-white border border-[var(--border-color-light)] text-[var(--text-muted)] hover:text-[var(--text-heading)] rounded-[var(--radius-sm)] shadow-sm transition"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-heading)] flex items-center gap-2">
                <UserPlus className="text-[var(--brand-primary)]" size={26} />
                <span>Registrar Nuevo Prospecto</span>
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                Ingresa los datos del prospecto interesado para iniciar el seguimiento.
              </p>
            </div>
          </div>
        </div>

        {/* Tarjeta del Formulario */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre Completo */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1.5">
                Nombre Completo o Prospecto <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]" />
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez Morales"
                  value={data.nombre}
                  onChange={(e) => setData('nombre', e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-[var(--radius-sm)] focus:outline-none ${
                    errors.nombre ? 'border-red-500' : 'border-[var(--border-color-dark)] focus:border-[#7aa5ff]'
                  }`}
                  required
                />
              </div>
              {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
            </div>

            {/* Teléfono y Correo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1.5">
                  Teléfono / Celular <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]" />
                  <input
                    type="text"
                    placeholder="Ej. 77712345"
                    value={data.telefono}
                    onChange={(e) => setData('telefono', e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-[var(--radius-sm)] focus:outline-none ${
                      errors.telefono ? 'border-red-500' : 'border-[var(--border-color-dark)] focus:border-[#7aa5ff]'
                    }`}
                    required
                  />
                </div>
                {errors.telefono && <p className="text-xs text-red-500 mt-1">{errors.telefono}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1.5">
                  Correo Electrónico (Opcional)
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]" />
                  <input
                    type="email"
                    placeholder="prospecto@correo.com"
                    value={data.correo}
                    onChange={(e) => setData('correo', e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-[var(--radius-sm)] focus:outline-none ${
                      errors.correo ? 'border-red-500' : 'border-[var(--border-color-dark)] focus:border-[#7aa5ff]'
                    }`}
                  />
                </div>
                {errors.correo && <p className="text-xs text-red-500 mt-1">{errors.correo}</p>}
              </div>
            </div>

            {/* Canal de Origen */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1.5">
                Canal de Origen <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Share2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]" />
                <select
                  value={data.id_origen}
                  onChange={(e) => setData('id_origen', e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-[var(--radius-sm)] focus:outline-none ${
                    errors.id_origen ? 'border-red-500' : 'border-[var(--border-color-dark)] focus:border-[#7aa5ff]'
                  }`}
                  required
                >
                  <option value="" disabled>Selecciona el origen</option>
                  {origenes.map((origen) => (
                    <option key={origen.id_origen} value={origen.id_origen}>
                      {origen.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {errors.id_origen && <p className="text-xs text-red-500 mt-1">{errors.id_origen}</p>}
            </div>

            {/* Asignación de Vendedor Inicial (Opcional) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1.5">
                Asignar Vendedor (Opcional)
              </label>
              <div className="relative">
                <UserCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]" />
                <select
                  value={data.id_vendedor}
                  onChange={(e) => setData('id_vendedor', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[#7aa5ff]"
                >
                  <option value="">Dejar en Bolsa Común (Sin vendedor asignado)</option>
                  {vendedores.map((v) => (
                    <option key={v.id_usuario} value={v.id_usuario}>
                      {v.nombre_completo}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Si no seleccionas un vendedor, el prospecto se guardará en la <strong>Bolsa Común</strong> para ser distribuido posteriormente.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="pt-4 border-t border-[var(--border-color-light)] flex items-center justify-end gap-3">
              <Link href="/leads">
                <Button variant="ghost" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" variant="primary" disabled={processing}>
                {processing ? 'Guardando...' : 'Guardar Prospecto'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
