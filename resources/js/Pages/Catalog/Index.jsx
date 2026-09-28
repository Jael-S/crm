import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
  Layers,
  GitCommit,
  Share2,
  AlertOctagon,
  CheckCircle2,
  ArrowRight,
  Database,
  Hash,
  Sparkles
} from 'lucide-react';

export default function CatalogIndex({ etapas_pipeline = [], origenes_lead = [], motivos_perdida = [] }) {
  const [activeTab, setActiveTab] = useState('etapas');

  const getStageColor = (nombre) => {
    switch (nombre.toLowerCase()) {
      case 'convertido':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'perdido':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'promesa de pago':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'nuevo':
        return 'bg-blue-50 text-[var(--color-primary)] border-blue-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <AppLayout title="Catálogos Lookups">
      <Head title="Catálogos Lookups" />

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-heading)]">
              Catálogos del Sistema (Lookups)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[var(--brand-primary)]">
              Maestras
            </span>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Tablas de referencia que parametrizan el flujo de leads, etapas del pipeline y motivos de descarte.
          </p>
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('etapas')}
          className={`text-left p-5 rounded-[var(--radius-lg)] border transition cursor-pointer ${
            activeTab === 'etapas'
              ? 'bg-white border-[var(--brand-primary)] shadow-md ring-2 ring-[var(--brand-primary)]/20'
              : 'bg-white border-[var(--border-color-light)] hover:border-gray-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[var(--brand-primary)] flex items-center justify-center">
              <GitCommit size={20} />
            </div>
            <span className="text-2xl font-extrabold text-[var(--text-heading)]">{etapas_pipeline.length}</span>
          </div>
          <h3 className="font-bold text-[var(--text-heading)] mt-3">Etapas del Pipeline</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Fases del embudo comercial en orden</p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('origenes')}
          className={`text-left p-5 rounded-[var(--radius-lg)] border transition cursor-pointer ${
            activeTab === 'origenes'
              ? 'bg-white border-[var(--brand-primary)] shadow-md ring-2 ring-[var(--brand-primary)]/20'
              : 'bg-white border-[var(--border-color-light)] hover:border-gray-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Share2 size={20} />
            </div>
            <span className="text-2xl font-extrabold text-[var(--text-heading)]">{origenes_lead.length}</span>
          </div>
          <h3 className="font-bold text-[var(--text-heading)] mt-3">Orígenes de Lead</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Canales de captación y procedencia</p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('motivos')}
          className={`text-left p-5 rounded-[var(--radius-lg)] border transition cursor-pointer ${
            activeTab === 'motivos'
              ? 'bg-white border-[var(--brand-primary)] shadow-md ring-2 ring-[var(--brand-primary)]/20'
              : 'bg-white border-[var(--border-color-light)] hover:border-gray-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertOctagon size={20} />
            </div>
            <span className="text-2xl font-extrabold text-[var(--text-heading)]">{motivos_perdida.length}</span>
          </div>
          <h3 className="font-bold text-[var(--text-heading)] mt-3">Motivos de Pérdida</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Causas estandarizadas de descarte</p>
        </button>
      </div>

      {/* Contenido según pestaña seleccionada */}
      <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--border-color-light)] shadow-sm overflow-hidden">
        {/* Cabecera de la tabla activa */}
        <div className="p-6 border-b border-[var(--border-color-light)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-heading)]">
              {activeTab === 'etapas' && 'Etapas del Pipeline Comercial'}
              {activeTab === 'origenes' && 'Orígenes y Canales de Captación'}
              {activeTab === 'motivos' && 'Motivos de Pérdida de Prospectos'}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {activeTab === 'etapas' && 'Secuencia estructurada que recorre cada prospecto desde su ingreso hasta el cierre.'}
              {activeTab === 'origenes' && 'Puntos de contacto inicial donde se registran nuevos prospectos en el sistema.'}
              {activeTab === 'motivos' && 'Justificaciones comerciales requeridas al marcar un prospecto como perdido.'}
            </p>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 self-start">
            <Database size={13} />
            <span>Datos sembrados por catálogo</span>
          </span>
        </div>

        {/* Tab 1: Etapas del Pipeline */}
        {activeTab === 'etapas' && (
          <div className="p-6">
            {/* Visual Funnel timeline */}
            <div className="mb-6 p-4 bg-gray-50 rounded-[var(--radius-md)] border border-gray-200">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[var(--brand-primary)]" />
                Flujo del Embudo Comercial
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {etapas_pipeline.map((etapa, idx) => (
                  <React.Fragment key={etapa.id_etapa}>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-gray-200 shadow-2xs text-xs font-semibold text-[var(--text-heading)]">
                      <span className="w-5 h-5 rounded-full bg-[var(--brand-primary)] text-white text-[10px] font-bold flex items-center justify-center">
                        {etapa.orden}
                      </span>
                      <span>{etapa.nombre}</span>
                    </div>
                    {idx < etapas_pipeline.length - 1 && (
                      <ArrowRight size={14} className="text-gray-400" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Tabla Detallada */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--bg-highlight)] text-xs uppercase font-bold text-[var(--text-heading)]">
                  <tr>
                    <th className="px-6 py-3 w-20 text-center">Orden</th>
                    <th className="px-6 py-3">Nombre de la Etapa</th>
                    <th className="px-6 py-3">Tipo de Etapa</th>
                    <th className="px-6 py-3 text-right">ID Interno</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color-light)]">
                  {etapas_pipeline.map((e) => (
                    <tr key={e.id_etapa} className="hover:bg-gray-50/70 transition">
                      <td className="px-6 py-4 text-center font-bold text-[var(--text-heading)]">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold">
                          {e.orden}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-[var(--text-heading)]">
                        {e.nombre}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStageColor(e.nombre)}`}>
                          {e.nombre === 'Convertido' ? 'Cierre Ganado' : e.nombre === 'Perdido' ? 'Cierre Perdido' : 'En Progreso'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-mono text-gray-400">
                        #{e.id_etapa}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Orígenes de Lead */}
        {activeTab === 'origenes' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--bg-highlight)] text-xs uppercase font-bold text-[var(--text-heading)]">
                  <tr>
                    <th className="px-6 py-3 w-24 text-center">ID</th>
                    <th className="px-6 py-3">Canal / Procedencia</th>
                    <th className="px-6 py-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color-light)]">
                  {origenes_lead.map((o) => (
                    <tr key={o.id_origen} className="hover:bg-gray-50/70 transition">
                      <td className="px-6 py-4 text-center font-mono text-xs text-gray-500">
                        #{o.id_origen}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[var(--text-heading)] flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span>{o.nombre}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} />
                          Disponible
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Motivos de Pérdida */}
        {activeTab === 'motivos' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--bg-highlight)] text-xs uppercase font-bold text-[var(--text-heading)]">
                  <tr>
                    <th className="px-6 py-3 w-24 text-center">ID</th>
                    <th className="px-6 py-3">Motivo Registrado</th>
                    <th className="px-6 py-3 text-center">Categoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color-light)]">
                  {motivos_perdida.map((m) => (
                    <tr key={m.id_motivo} className="hover:bg-gray-50/70 transition">
                      <td className="px-6 py-4 text-center font-mono text-xs text-gray-500">
                        #{m.id_motivo}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[var(--text-heading)]">
                        {m.nombre}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Descarte de Lead
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
