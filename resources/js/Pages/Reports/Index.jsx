import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Shared/Card';
import Badge from '@/Shared/Badge';
import Button from '@/Shared/Button';
import {
  BarChart3,
  TrendingUp,
  Users,
  GraduationCap,
  Clock,
  AlertTriangle,
  Filter,
  CheckCircle2,
  Share2,
  UserCheck,
  RotateCcw,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';

export default function ReportsIndex({
  kpis = {},
  embudo = [],
  origenes = [],
  motivos_perdida = [],
  asesores = [],
  versiones_filtro = [],
  filtros_aplicados = {},
  es_coordinador = false,
  mensaje = null,
}) {
  const [periodo, setPeriodo] = useState(filtros_aplicados?.periodo || 'todo');
  const [versionId, setVersionId] = useState(filtros_aplicados?.id_version_externo || '');

  const aplicarFiltros = (nuevoPeriodo = periodo, nuevaVersion = versionId) => {
    router.get(
      '/reportes',
      {
        periodo: nuevoPeriodo,
        id_version_externo: nuevaVersion || undefined,
      },
      {
        preserveState: true,
        replace: true,
      }
    );
  };

  const handlePeriodoChange = (e) => {
    const val = e.target.value;
    setPeriodo(val);
    aplicarFiltros(val, versionId);
  };

  const handleVersionChange = (e) => {
    const val = e.target.value;
    setVersionId(val);
    aplicarFiltros(periodo, val);
  };

  const limpiarFiltros = () => {
    setPeriodo('todo');
    setVersionId('');
    aplicarFiltros('todo', '');
  };

  // Colores para las 6 etapas del embudo
  const getEtapaColor = (orden) => {
    switch (orden) {
      case 1:
        return { bg: 'bg-slate-100', bar: 'bg-slate-500', text: 'text-slate-700' };
      case 2:
        return { bg: 'bg-blue-50', bar: 'bg-blue-600', text: 'text-blue-700' };
      case 3:
        return { bg: 'bg-indigo-50', bar: 'bg-indigo-600', text: 'text-indigo-700' };
      case 4:
        return { bg: 'bg-amber-50', bar: 'bg-amber-500', text: 'text-amber-700' };
      case 5:
        return { bg: 'bg-emerald-50', bar: 'bg-emerald-600', text: 'text-emerald-700' };
      case 6:
        return { bg: 'bg-rose-50', bar: 'bg-rose-500', text: 'text-rose-700' };
      default:
        return { bg: 'bg-gray-50', bar: 'bg-gray-500', text: 'text-gray-700' };
    }
  };

  return (
    <AppLayout>
      <Head title="Reportes y BI" />

      <div className="space-y-6">
        {/* Encabezado Principal y Alcance */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-heading)] flex items-center gap-2">
                <BarChart3 className="text-[var(--brand-primary)]" size={28} />
                <span>Reportes y Analítica Comercial</span>
              </h1>
            </div>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {es_coordinador
                ? 'Monitoreo de demanda académica, embudo de conversión y asesores para tus programas asignados.'
                : 'Tablero consolidado de rendimiento comercial y conversión para toda la institución.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-sm)] border bg-white text-[var(--text-heading)] border-[var(--border-color-dark)] shadow-sm">
              <Layers size={14} className="text-[var(--color-primary)]" />
              {es_coordinador ? 'Alcance: Coordinador Académico' : 'Alcance: Global Institucional'}
            </span>
          </div>
        </div>

        {/* Barra de Filtros Interactivos */}
        <Card className="p-4 bg-[var(--bg-highlight)] border border-[var(--border-color-light)]">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <Filter size={15} />
              <span>Filtros de Análisis</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Filtro por Versión / Programa */}
              {versiones_filtro.length > 0 && (
                <div className="w-full sm:w-auto min-w-[220px]">
                  <select
                    value={versionId}
                    onChange={handleVersionChange}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value="">
                      {es_coordinador ? 'Todos mis programas asignados' : 'Todos los programas (Global)'}
                    </option>
                    {versiones_filtro.map((v) => (
                      <option key={v.id_version_externo} value={v.id_version_externo}>
                        {v.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Filtro por Período */}
              <div className="w-full sm:w-auto min-w-[150px]">
                <select
                  value={periodo}
                  onChange={handlePeriodoChange}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[var(--border-color-dark)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="todo">Historial completo</option>
                  <option value="30dias">Últimos 30 días</option>
                  <option value="este_mes">Este mes</option>
                  <option value="este_ano">Este año</option>
                </select>
              </div>

              {(periodo !== 'todo' || versionId !== '') && (
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:text-rose-600 transition"
                  title="Restablecer filtros"
                >
                  <RotateCcw size={13} />
                  <span>Limpiar</span>
                </button>
              )}
            </div>
          </div>
        </Card>

        {mensaje && (
          <div className="flex items-center gap-3 p-4 rounded-[var(--radius-md)] bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <Info size={20} className="shrink-0 text-amber-600" />
            <span>{mensaje}</span>
          </div>
        )}

        {/* 1. Tarjetas de KPIs Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card compact className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-blue-50 text-[var(--color-primary)] flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <div className="text-xl font-bold text-[var(--text-heading)]">{kpis.total_leads ?? 0}</div>
              <div className="text-xs text-[var(--text-muted)]">Total Prospectos</div>
            </div>
          </Card>

          <Card compact className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-emerald-50 text-[var(--color-success)] flex items-center justify-center shrink-0">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="text-xl font-bold text-[var(--text-heading)]">{kpis.leads_convertidos ?? 0}</div>
              <div className="text-xs text-[var(--text-muted)]">Matriculados Exitosos</div>
            </div>
          </Card>

          <Card compact className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="text-xl font-bold text-[var(--text-heading)]">{kpis.tasa_conversion ?? 0}%</div>
              <div className="text-xs text-[var(--text-muted)]">Tasa de Conversión</div>
            </div>
          </Card>

          <Card compact className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-xl font-bold text-[var(--text-heading)]">{kpis.leads_activos ?? 0}</div>
              <div className="text-xs text-[var(--text-muted)]">En Seguimiento Activo</div>
            </div>
          </Card>

          <Card compact className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="text-xl font-bold text-[var(--text-heading)]">{kpis.tasa_perdida ?? 0}%</div>
              <div className="text-xs text-[var(--text-muted)]">Tasa de Pérdida</div>
            </div>
          </Card>
        </div>

        {/* 2. Embudo de Conversión (6 Etapas Comerciales) */}
        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-color-light)] pb-3 gap-2">
            <div>
              <h2 className="text-base font-bold text-[var(--text-heading)] flex items-center gap-2">
                <BarChart3 size={18} className="text-[var(--brand-primary)]" />
                <span>Embudo de Conversión de Prospectos (6 Etapas)</span>
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Progresión de prospectos a lo largo del ciclo comercial.
              </p>
            </div>
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              {kpis.total_leads ?? 0} registros analizados
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {embudo.map((etapa) => {
              const color = getEtapaColor(etapa.orden);
              return (
                <div key={etapa.id_etapa} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full ${color.bg} ${color.text} font-bold flex items-center justify-center text-[10px]`}>
                        {etapa.orden}
                      </span>
                      <span className="font-semibold text-[var(--text-heading)]">{etapa.nombre}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[var(--text-heading)]">{etapa.total} prospectos</span>
                      <span className="text-[var(--text-muted)] w-12 text-right">{etapa.porcentaje}%</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color.bar} transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.max(etapa.porcentaje, etapa.total > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 3. Grid de Orígenes y Motivos de Pérdida */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Canales de Captación */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color-light)] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-heading)] flex items-center gap-2">
                  <Share2 size={16} className="text-[var(--color-primary)]" />
                  <span>Canales de Captación (Efectividad)</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)]">Distribución de prospectos según origen de contacto.</p>
              </div>
            </div>

            <div className="space-y-3">
              {origenes.length > 0 ? (
                origenes.map((origen) => (
                  <div key={origen.id_origen} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[var(--text-heading)]">{origen.nombre}</span>
                      <span className="font-bold text-[var(--text-heading)]">
                        {origen.total} ({origen.porcentaje}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
                        style={{ width: `${origen.porcentaje}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--text-muted)] py-4 text-center">
                  No hay datos registrados de canales en el período seleccionado.
                </p>
              )}
            </div>
          </Card>

          {/* Motivos de Pérdida */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color-light)] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-heading)] flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-600" />
                  <span>Top Motivos de Pérdida</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)]">Causales de abandono o descarte comercial.</p>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                {kpis.leads_perdidos ?? 0} perdidos
              </span>
            </div>

            <div className="space-y-3">
              {motivos_perdida.length > 0 ? (
                motivos_perdida.map((motivo) => (
                  <div key={motivo.id_motivo_perdida} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[var(--text-heading)]">{motivo.nombre}</span>
                      <span className="font-bold text-rose-700">
                        {motivo.total} ({motivo.porcentaje}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-500"
                        style={{ width: `${motivo.porcentaje}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--text-muted)] py-4 text-center">
                  No se registran descartes comerciales para este período o selección.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* 4. Monitoreo de Asesores Comerciales */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[var(--border-color-light)]">
            <h3 className="text-base font-bold text-[var(--text-heading)] flex items-center gap-2">
              <UserCheck size={18} className="text-[var(--color-success)]" />
              <span>Monitoreo de Asesores Comerciales</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Rendimiento de los vendedores que atienden prospectos en estos programas.
            </p>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-main)]">
              <thead className="bg-[var(--bg-highlight)] border-b border-[var(--border-color-light)] text-xs font-semibold uppercase text-[var(--text-heading)]">
                <tr>
                  <th className="px-4 py-3">Asesor Comercial</th>
                  <th className="px-3 py-3 text-center">Prospectos Atendidos</th>
                  <th className="px-3 py-3 text-center">En Seguimiento</th>
                  <th className="px-3 py-3 text-center">Matriculados</th>
                  <th className="px-3 py-3 text-center">Perdidos</th>
                  <th className="px-4 py-3 text-right">Efectividad de Cierre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color-light)] text-xs">
                {asesores.length > 0 ? (
                  asesores.map((v) => (
                    <tr key={v.id_usuario} className="hover:bg-gray-50/70 transition">
                      <td className="px-4 py-3 font-semibold text-[var(--text-heading)]">
                        <div>{v.nombre}</div>
                        <div className="text-[11px] font-normal text-[var(--text-muted)]">{v.correo}</div>
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-[var(--text-heading)]">
                        {v.total_atendidos}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="rounded-full bg-sky-50 px-2 py-0.5 font-semibold text-sky-700">
                          {v.en_proceso}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                          {v.convertidos}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-700">
                          {v.perdidos}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-purple-700">
                        {v.tasa_cierre}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-xs text-[var(--text-muted)]">
                      No hay prospectos asignados a asesores comerciales en esta selección.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
