import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Shared/Card';
import Button from '@/Shared/Button';
import {
  Edit2,
  ArrowLeft,
  User,
  Phone,
  Mail,
  Share2,
  Layers,
  MapPin,
  CreditCard,
  Calendar
} from 'lucide-react';

export default function LeadsEdit({ lead, origenes = [], etapas = [] }) {
  const { data, setData, put, processing, errors } = useForm({
    nombre: lead.nombre || '',
    telefono: lead.telefono || '',
    correo: lead.correo || '',
    id_origen: lead.id_origen || '',
    id_etapa: lead.id_etapa || '',
    ci: lead.ci || '',
    nombre_completo: lead.nombre_completo || '',
    ciudad: lead.ciudad || '',
    fecha_nacimiento: lead.fecha_nacimiento || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(`/leads/${lead.id_lead}`);
  };

  return (
    <AppLayout>
      <Head title={`Editar: ${lead.nombre}`} />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Cabecera */}
        <div className="flex items-center gap-3">
          <Link
            href={`/leads/${lead.id_lead}`}
            className="p-2 bg-white border border-[var(--border-color-light)] text-[var(--text-muted)] hover:text-[var(--text-heading)] rounded-[var(--radius-sm)] shadow-sm transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-heading)] flex items-center gap-2">
              <Edit2 className="text-[var(--brand-primary)]" size={24} />
              <span>Editar Prospecto</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Modifica los datos personales y comerciales de {lead.nombre}.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1.5">
                Nombre de Referencia <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]" />
                <input
                  type="text"
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
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]" />
                  <input
                    type="email"
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

            {/* Origen y Etapa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1.5">
                  Canal de Origen <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Share2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]" />
                  <select
                    value={data.id_origen}
                    onChange={(e) => setData('id_origen', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[#7aa5ff]"
                    required
                  >
                    {origenes.map((origen) => (
                      <option key={origen.id_origen} value={origen.id_origen}>
                        {origen.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-1.5">
                  Etapa en Pipeline
                </label>
                <div className="relative">
                  <Layers size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]" />
                  <select
                    value={data.id_etapa}
                    onChange={(e) => setData('id_etapa', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[#7aa5ff]"
                  >
                    {etapas.map((etapa) => (
                      <option key={etapa.id_etapa} value={etapa.id_etapa}>
                        {etapa.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sección de Datos Complementarios */}
            <div className="pt-4 border-t border-[var(--border-color-light)]">
              <h3 className="text-xs font-bold text-[var(--text-heading)] uppercase tracking-wider mb-3">
                Datos Complementarios (Conversión / Matrícula)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                    Nombre Completo Oficial
                  </label>
                  <input
                    type="text"
                    placeholder="Para certificado / matrícula"
                    value={data.nombre_completo}
                    onChange={(e) => setData('nombre_completo', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                    Cédula de Identidad (CI)
                  </label>
                  <div className="relative">
                    <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Ej. 8472910 SC"
                      value={data.ci}
                      onChange={(e) => setData('ci', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                    Ciudad de Residencia
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Ej. Santa Cruz"
                      value={data.ciudad}
                      onChange={(e) => setData('ciudad', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                    Fecha de Nacimiento
                  </label>
                  <div className="relative">
                    <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={data.fecha_nacimiento}
                      onChange={(e) => setData('fecha_nacimiento', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="pt-4 border-t border-[var(--border-color-light)] flex items-center justify-end gap-3">
              <Link href={`/leads/${lead.id_lead}`}>
                <Button variant="ghost" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" variant="primary" disabled={processing}>
                {processing ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
