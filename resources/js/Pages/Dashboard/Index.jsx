import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Shared/Card';
import {
  Users,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Award,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  Phone,
  Flame,
  UserMinus,
  GraduationCap,
  Inbox,
  ChevronRight,
  BookOpen
} from 'lucide-react';

export default function DashboardIndex({
  stats,
  userRol,
  esCoordinador = false,
  programaAsignadoNombre = null,
  reporteEmbudo = [],
  metricasGlobales = {},
  matrizVendedores = [],
  reporteOrigenes = [],
  reporteMotivosPerdida = [],
  comentariosPerdidaRecientes = [],
  dashboardVendedor = null,
}) {
  const [activeTab, setActiveTab] = useState('embudo'); // 'embudo', 'conversion', 'canales', 'perdidas'

  // Paleta Oficial UNEXO adaptada a los estilos del sistema (Tonalidades suaves y equilibradas)
  const etapaColores = {
    1: { fill: '#64748b', bg: 'bg-slate-50/80 dark:bg-slate-800/40', text: 'text-slate-700 dark:text-slate-300 font-bold', border: 'border-slate-200 dark:border-slate-700' },
    2: { fill: '#00b4d8', bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-300 font-bold', border: 'border-cyan-200 dark:border-cyan-800' },
    3: { fill: '#0284c7', bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300 font-bold', border: 'border-sky-200 dark:border-sky-800' },
    4: { fill: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300 font-bold', border: 'border-amber-200 dark:border-amber-800' },
    5: { fill: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300 font-bold', border: 'border-emerald-200 dark:border-emerald-800' },
    6: { fill: '#e63946', bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300 font-bold', border: 'border-rose-200 dark:border-rose-800' },
  };

  const totalLeadsGlobal = Number(metricasGlobales?.total_leads || 0);
  const convertidosGlobal = Number(metricasGlobales?.convertidos || 0);
  const perdidosGlobal = Number(metricasGlobales?.perdidos || 0);
  const enProcesoGlobal = Number(metricasGlobales?.en_proceso || 0);
  const tasaConversionGlobal = Number(metricasGlobales?.tasa_conversion || 0);
  const tasaDesercionGlobal = Number(metricasGlobales?.tasa_desercion || 0);

  const maxLeadsEmbudo = Math.max(...reporteEmbudo.map((e) => Number(e.total_leads || 0)), 1);
  const maxLeadsOrigen = Math.max(...reporteOrigenes.map((o) => Number(o.total_leads || 0)), 1);
  const maxLeadsPerdida = Math.max(...reporteMotivosPerdida.map((m) => Number(m.total_perdidos || 0)), 1);

  const esRolVendedor = userRol === 'Vendedor';

  return (
    <AppLayout>
      <Head title="Embudo General · Reportes" />

      {/* Cabecera Sobria y Puntual */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-color-light)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--text-heading)] tracking-tight">
            {esRolVendedor ? 'Panel de Ventas' : 'Embudo General'}
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
            {esRolVendedor
              ? 'Tus métricas de seguimiento comercial'
              : esCoordinador && programaAsignadoNombre
              ? `Reporte filtrado por programa: ${programaAsignadoNombre}`
              : 'Indicadores globales de conversión institucional'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {esCoordinador && programaAsignadoNombre && (
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1.5">
              <BookOpen size={14} />
              <span>{programaAsignadoNombre}</span>
            </span>
          )}
          <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[var(--bg-highlight)] text-[var(--text-main)] border border-[var(--border-color-light)]">
            Rol: {userRol}
          </span>
        </div>
      </div>

      {/* =========================================================================
          VISTA ROL VENDEDOR (Reporte 5: DASHBOARDVENDEDOR[])
         ========================================================================= */}
      {esRolVendedor && dashboardVendedor && (
        <div className="space-y-5">
          {/* Tarjetas KPI Vendedor */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card hover className="p-4 border-l-4 border-l-blue-600 bg-[var(--bg-surface)]">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Mi Cartera
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[var(--text-heading)] mt-1">
                {dashboardVendedor.cartera?.total_cartera || 0}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">Prospectos asignados</div>
            </Card>

            <Card hover className="p-4 border-l-4 border-l-amber-500 bg-[var(--bg-surface)]">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                En Seguimiento
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                {dashboardVendedor.cartera?.activos || 0}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">Etapas 1 a 4</div>
            </Card>

            <Card hover className="p-4 border-l-4 border-l-emerald-600 bg-[var(--bg-surface)]">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Matriculados
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
                {dashboardVendedor.cartera?.convertidos || 0}
              </div>
              <div className="text-xs text-emerald-700 font-semibold mt-0.5">Alumnos cerrados</div>
            </Card>

            <Card hover className="p-4 border-l-4 border-l-indigo-600 bg-[var(--bg-surface)]">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Tasa de Cierre
              </div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-700 mt-1">
                {dashboardVendedor.cartera?.tasa_conversion || '0.0'}%
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">Efectividad</div>
            </Card>
          </div>

          {/* Banner Bolsa Común */}
          {Number(dashboardVendedor.disponibles_bolsa || 0) > 0 && (
            <div className="p-3.5 bg-[#002855] text-white rounded-xl shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Inbox size={20} className="text-cyan-400" />
                <span className="font-bold text-xs sm:text-sm">
                  {dashboardVendedor.disponibles_bolsa} prospectos disponibles en Bolsa Común
                </span>
              </div>
              <Link
                href="/leads"
                className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition"
              >
                Tomar Leads
              </Link>
            </div>
          )}

          {/* Embudo Personal + Recordatorios */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7">
              <Card className="p-5 bg-[var(--bg-surface)]">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color-light)]">
                  <h3 className="font-bold text-[var(--text-heading)] text-sm uppercase tracking-wider">
                    Mi Embudo por Etapa
                  </h3>
                  <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                    {dashboardVendedor.cartera?.total_cartera || 0} Leads
                  </span>
                </div>

                <div className="space-y-3 pt-3">
                  {dashboardVendedor.etapas?.map((etapa) => {
                    const count = Number(etapa.total_leads || 0);
                    const colorCfg = etapaColores[etapa.id_etapa] || etapaColores[1];
                    const maxV = Math.max(...dashboardVendedor.etapas.map((e) => Number(e.total_leads || 0)), 1);
                    const pctWidth = Math.max(10, Math.round((count / maxV) * 100));

                    return (
                      <div key={etapa.id_etapa}>
                        <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                          <span className="text-[var(--text-main)] flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorCfg.fill }} />
                            <span>{etapa.etapa_nombre}</span>
                          </span>
                          <span className="font-mono text-[var(--text-heading)] font-bold">
                            {count} ({etapa.porcentaje || 0}%)
                          </span>
                        </div>
                        <div className="w-full bg-[var(--bg-highlight)] h-6 rounded-lg overflow-hidden p-0.5 border border-[var(--border-color-light)]">
                          <div
                            className="h-full rounded-md flex items-center justify-end pr-2 text-white text-xs font-bold"
                            style={{ width: `${pctWidth}%`, backgroundColor: colorCfg.fill }}
                          >
                            {count > 0 && <span>{count}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Recordatorios Pendientes */}
            <div className="lg:col-span-5">
              <Card className="p-5 bg-[var(--bg-surface)]">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color-light)]">
                  <h3 className="font-bold text-[var(--text-heading)] text-sm uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={16} className="text-blue-600" />
                    <span>Tareas de Seguimiento</span>
                  </h3>
                  <Link href="/recordatorios" className="text-xs font-bold text-blue-600 hover:underline">
                    Ver agenda
                  </Link>
                </div>

                <div className="space-y-2.5 pt-3">
                  {dashboardVendedor.recordatorios_pendientes?.length > 0 ? (
                    dashboardVendedor.recordatorios_pendientes.map((rec) => (
                      <div
                        key={rec.id_recordatorio}
                        className="p-3 bg-[var(--bg-highlight)] rounded-xl border border-[var(--border-color-light)]"
                      >
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/leads/${rec.id_lead}`}
                            className="font-bold text-xs text-[var(--text-heading)] hover:text-blue-600"
                          >
                            {rec.lead_nombre}
                          </Link>
                          <span className="text-xs font-mono font-bold text-blue-700">
                            {(rec.fecha_hora || rec.fecha_recordatorio)
                              ? new Date(rec.fecha_hora || rec.fecha_recordatorio).toLocaleDateString('es-BO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : 'Hoy'}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-main)] mt-1 line-clamp-1 italic">
                          "{rec.nota}"
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                      <CheckCircle2 size={28} className="mx-auto text-emerald-500 mb-1" />
                      <span>Sin tareas pendientes para hoy</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VISTA ADMINISTRADOR & COORDINADOR (Reportes 1, 2, 3 y 4)
         ========================================================================= */}
      {!esRolVendedor && (
        <div className="space-y-5">
          {/* 6 Tarjetas Superiores por Etapa (Clickeables) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {reporteEmbudo.map((ep) => {
              const colorCfg = etapaColores[ep.id_etapa] || etapaColores[1];
              return (
                <Link
                  key={ep.id_etapa}
                  href={`/leads?id_etapa=${ep.id_etapa}`}
                  className={`p-3 rounded-xl border ${colorCfg.border} ${colorCfg.bg} hover:shadow-sm transition cursor-pointer block`}
                >
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
                    <span>Etapa {ep.orden}</span>
                    <span className="font-mono font-bold">{ep.porcentaje || 0}%</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[var(--text-heading)] leading-none">
                    {ep.total_leads || 0}
                  </div>
                  <div className={`text-xs font-bold mt-1.5 truncate ${colorCfg.text}`}>
                    {ep.etapa_nombre}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Navegación de Reportes */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[var(--bg-highlight)] rounded-xl border border-[var(--border-color-light)]">
            <button
              onClick={() => setActiveTab('embudo')}
              className={`py-2 px-3.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'embudo'
                  ? 'bg-[#002855] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
              }`}
            >
              <BarChart3 size={15} />
              <span>1. Embudo de Ventas</span>
            </button>

            <button
              onClick={() => setActiveTab('conversion')}
              className={`py-2 px-3.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'conversion'
                  ? 'bg-[#002855] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
              }`}
            >
              <Award size={15} />
              <span>2. Conversión & Asesores</span>
            </button>

            <button
              onClick={() => setActiveTab('canales')}
              className={`py-2 px-3.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'canales'
                  ? 'bg-[#002855] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
              }`}
            >
              <PieChartIcon size={15} />
              <span>3. Canales de Captación</span>
            </button>

            <button
              onClick={() => setActiveTab('perdidas')}
              className={`py-2 px-3.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'perdidas'
                  ? 'bg-[#002855] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
              }`}
            >
              <UserMinus size={15} />
              <span>4. Motivos de Pérdida</span>
            </button>
          </div>

          {/* REPORTE 1: EMBUDO */}
          {activeTab === 'embudo' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-8">
                <Card className="p-5 bg-[var(--bg-surface)]">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color-light)]">
                    <h3 className="font-bold text-[var(--text-heading)] text-sm uppercase tracking-wider">
                      Embudo de Conversión (6 Etapas)
                    </h3>
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                      {totalLeadsGlobal} Leads
                    </span>
                  </div>

                  <div className="space-y-3 pt-4">
                    {reporteEmbudo.map((ep) => {
                      const count = Number(ep.total_leads || 0);
                      const colorCfg = etapaColores[ep.id_etapa] || etapaColores[1];
                      const pctRel = Math.max(12, Math.round((count / maxLeadsEmbudo) * 100));

                      return (
                        <Link
                          key={ep.id_etapa}
                          href={`/leads?id_etapa=${ep.id_etapa}`}
                          className="group block p-1.5 rounded-lg hover:bg-[var(--bg-highlight)] transition"
                        >
                          <div className="flex items-center justify-between text-xs font-bold mb-1">
                            <span className="text-[var(--text-heading)] flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorCfg.fill }} />
                              <span>{ep.orden}. {ep.etapa_nombre}</span>
                            </span>
                            <span className="font-mono text-[var(--text-heading)]">
                              {count} <span className="text-[var(--text-muted)] font-normal">({ep.porcentaje || 0}%)</span>
                            </span>
                          </div>

                          <div className="w-full bg-[var(--bg-highlight)] h-8 rounded-lg overflow-hidden p-0.5 border border-[var(--border-color-light)]">
                            <div
                              className="h-full rounded-md flex items-center justify-between px-3 text-white text-xs font-bold transition-all duration-500"
                              style={{ width: `${pctRel}%`, backgroundColor: colorCfg.fill }}
                            >
                              <span>{count > 0 ? `${count}` : ''}</span>
                              <span className="font-mono">{ep.porcentaje}%</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Métricas Resumen - Tonalidades equilibradas */}
              <div className="lg:col-span-4 space-y-3">
                <Card className="p-4 bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Alumnos Matriculados
                  </span>
                  <div className="text-3xl font-black text-emerald-700 dark:text-emerald-200 mt-1">
                    {convertidosGlobal}
                  </div>
                  <div className="text-xs font-bold text-emerald-800 mt-0.5">
                    {tasaConversionGlobal}% de conversión
                  </div>
                </Card>

                <Card className="p-4 bg-sky-100/70 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                    En Negociación
                  </span>
                  <div className="text-3xl font-black text-sky-700 dark:text-sky-200 mt-1">
                    {enProcesoGlobal}
                  </div>
                  <div className="text-xs font-bold text-sky-800 mt-0.5">
                    Etapas 1 a 4 activas
                  </div>
                </Card>

                <Card className="p-4 bg-rose-100/70 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                    Descartados
                  </span>
                  <div className="text-3xl font-black text-rose-700 dark:text-rose-200 mt-1">
                    {perdidosGlobal}
                  </div>
                  <div className="text-xs font-bold text-rose-800 mt-0.5">
                    {tasaDesercionGlobal}% de deserción
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* REPORTE 2: CONVERSIÓN & ASESORES */}
          {activeTab === 'conversion' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Donut SVG */}
                <div className="lg:col-span-5">
                  <Card className="p-5 bg-[var(--bg-surface)]">
                    <h3 className="font-bold text-[var(--text-heading)] text-sm uppercase tracking-wider mb-4">
                      Estado de Cartera
                    </h3>

                    <div className="flex flex-col items-center">
                      <div className="relative w-44 h-44">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#0284c7"
                            strokeWidth="16"
                            strokeDasharray={`${totalLeadsGlobal > 0 ? (enProcesoGlobal / totalLeadsGlobal) * 238.76 : 0} 238.76`}
                            strokeDashoffset="0"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#10b981"
                            strokeWidth="16"
                            strokeDasharray={`${totalLeadsGlobal > 0 ? (convertidosGlobal / totalLeadsGlobal) * 238.76 : 0} 238.76`}
                            strokeDashoffset={`-${totalLeadsGlobal > 0 ? (enProcesoGlobal / totalLeadsGlobal) * 238.76 : 0}`}
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#e63946"
                            strokeWidth="16"
                            strokeDasharray={`${totalLeadsGlobal > 0 ? (perdidosGlobal / totalLeadsGlobal) * 238.76 : 0} 238.76`}
                            strokeDashoffset={`-${totalLeadsGlobal > 0 ? ((enProcesoGlobal + convertidosGlobal) / totalLeadsGlobal) * 238.76 : 0}`}
                          />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-2xl font-black text-[var(--text-heading)] font-mono">
                            {totalLeadsGlobal}
                          </span>
                          <span className="text-xs font-bold uppercase text-[var(--text-muted)]">
                            Total Leads
                          </span>
                        </div>
                      </div>

                      <div className="w-full space-y-2 mt-4 pt-3 border-t border-[var(--border-color-light)]">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="flex items-center gap-2 text-[var(--text-main)]">
                            <span className="w-3 h-3 rounded-full bg-[#0284c7]" />
                            <span>En Proceso</span>
                          </span>
                          <span className="font-mono text-[var(--text-heading)]">
                            {enProcesoGlobal} ({totalLeadsGlobal > 0 ? ((enProcesoGlobal / totalLeadsGlobal) * 100).toFixed(1) : 0}%)
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="flex items-center gap-2 text-[var(--text-main)]">
                            <span className="w-3 h-3 rounded-full bg-[#10b981]" />
                            <span>Matriculados</span>
                          </span>
                          <span className="font-mono text-emerald-700 font-bold">
                            {convertidosGlobal} ({tasaConversionGlobal}%)
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="flex items-center gap-2 text-[var(--text-main)]">
                            <span className="w-3 h-3 rounded-full bg-[#e63946]" />
                            <span>Perdidos</span>
                          </span>
                          <span className="font-mono text-rose-700 font-bold">
                            {perdidosGlobal} ({tasaDesercionGlobal}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Métricas Globales */}
                <div className="lg:col-span-7 grid grid-cols-2 gap-4 content-start">
                  <Card className="p-5 border-l-4 border-l-emerald-600 bg-[var(--bg-surface)]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Tasa de Conversión
                    </span>
                    <div className="text-3xl font-black text-emerald-700 mt-1">
                      {tasaConversionGlobal}%
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                      {convertidosGlobal} de {totalLeadsGlobal} prospectos cerrados
                    </div>
                  </Card>

                  <Card className="p-5 border-l-4 border-l-rose-600 bg-[var(--bg-surface)]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Tasa de Deserción
                    </span>
                    <div className="text-3xl font-black text-rose-700 mt-1">
                      {tasaDesercionGlobal}%
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                      {perdidosGlobal} prospectos dados de baja
                    </div>
                  </Card>
                </div>
              </div>

              {/* Matriz de Vendedores */}
              <Card className="p-5 bg-[var(--bg-surface)]">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color-light)]">
                  <h3 className="font-bold text-[var(--text-heading)] text-sm uppercase tracking-wider">
                    Rendimiento por Asesor Comercial
                  </h3>
                  <span className="text-xs font-bold text-[var(--text-muted)]">
                    {matrizVendedores.length} Vendedores
                  </span>
                </div>

                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[var(--border-color-light)] text-[var(--text-muted)] uppercase font-bold text-xs">
                        <th className="py-2.5 px-3">Asesor</th>
                        <th className="py-2.5 px-3 text-center">Asignados</th>
                        <th className="py-2.5 px-3 text-center">En Proceso</th>
                        <th className="py-2.5 px-3 text-center">Matriculados</th>
                        <th className="py-2.5 px-3 text-center">Perdidos</th>
                        <th className="py-2.5 px-3">Tasa de Cierre</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color-light)]">
                      {matrizVendedores.map((v) => {
                        const tasa = Number(v.tasa_conversion || 0);
                        return (
                          <tr key={v.id_usuario} className="hover:bg-[var(--bg-highlight)] transition">
                            <td className="py-2.5 px-3 font-bold text-[var(--text-heading)]">
                              {v.nombre_completo}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold">
                              {v.total_asignados}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-blue-700">
                              {v.en_proceso}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-emerald-700 font-bold">
                              {v.convertidos}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-rose-600">
                              {v.perdidos}
                            </td>
                            <td className="py-2.5 px-3 w-48">
                              <div className="flex items-center gap-2">
                                <div className="w-full bg-[var(--bg-highlight)] h-2.5 rounded-full overflow-hidden border border-[var(--border-color-light)]">
                                  <div
                                    className="h-full rounded-full bg-emerald-500"
                                    style={{ width: `${Math.min(100, Math.max(0, tasa))}%` }}
                                  />
                                </div>
                                <span className="font-mono font-bold text-xs text-[var(--text-heading)] w-10 text-right">
                                  {tasa}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* REPORTE 3: CANALES */}
          {activeTab === 'canales' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7">
                <Card className="p-5 bg-[var(--bg-surface)]">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color-light)]">
                    <h3 className="font-bold text-[var(--text-heading)] text-sm uppercase tracking-wider">
                      Captación vs Matrículas por Canal
                    </h3>
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <span className="flex items-center gap-1 text-[var(--text-main)]">
                        <span className="w-2.5 h-2.5 rounded bg-blue-600" />
                        <span>Captados</span>
                      </span>
                      <span className="flex items-center gap-1 text-[var(--text-main)]">
                        <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                        <span>Matriculados</span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-4">
                    {reporteOrigenes.map((orig) => {
                      const total = Number(orig.total_leads || 0);
                      const conv = Number(orig.convertidos || 0);
                      const pctTotal = Math.max(8, Math.round((total / maxLeadsOrigen) * 100));
                      const pctConv = total > 0 ? Math.max(4, Math.round((conv / maxLeadsOrigen) * 100)) : 0;

                      return (
                        <div key={orig.id_origen} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-[var(--text-heading)]">{orig.origen_nombre}</span>
                            <span className="font-mono text-[var(--text-muted)]">
                              {total} captados · {conv} alumnos ({orig.tasa_conversion_canal}%)
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="w-full bg-[var(--bg-highlight)] h-3.5 rounded overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded transition-all duration-500"
                                style={{ width: `${pctTotal}%` }}
                              />
                            </div>
                            <div className="w-full bg-[var(--bg-highlight)] h-3.5 rounded overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded transition-all duration-500"
                                style={{ width: `${pctConv}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Participación de Mercado */}
              <div className="lg:col-span-5">
                <Card className="p-5 bg-[var(--bg-surface)]">
                  <h3 className="font-bold text-[var(--text-heading)] text-sm uppercase tracking-wider pb-3 border-b border-[var(--border-color-light)]">
                    Participación de Mercado
                  </h3>

                  <div className="space-y-3 pt-3">
                    {reporteOrigenes.map((orig) => (
                      <div key={orig.id_origen} className="p-2.5 bg-[var(--bg-highlight)] rounded-xl border border-[var(--border-color-light)]">
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="text-[var(--text-heading)]">{orig.origen_nombre}</span>
                          <span className="font-mono text-blue-700">{orig.porcentaje_participacion}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${orig.porcentaje_participacion}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* REPORTE 4: MOTIVOS DE PÉRDIDA */}
          {activeTab === 'perdidas' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7">
                <Card className="p-5 bg-[var(--bg-surface)]">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color-light)]">
                    <h3 className="font-bold text-[var(--text-heading)] text-sm uppercase tracking-wider">
                      Causales de Deserción
                    </h3>
                    <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md">
                      {perdidosGlobal} Bajas
                    </span>
                  </div>

                  <div className="space-y-3.5 pt-4">
                    {reporteMotivosPerdida.map((m) => {
                      const count = Number(m.total_perdidos || 0);
                      const pctBar = maxLeadsPerdida > 0 ? Math.max(8, Math.round((count / maxLeadsPerdida) * 100)) : 0;

                      return (
                        <div key={m.id_motivo} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-[var(--text-heading)]">{m.motivo_nombre}</span>
                            <span className="font-mono text-rose-700 font-bold">
                              {count} ({m.porcentaje_desercion}%)
                            </span>
                          </div>

                          <div className="w-full bg-[var(--bg-highlight)] h-6 rounded-lg overflow-hidden p-0.5 border border-[var(--border-color-light)]">
                            <div
                              className="h-full rounded-md bg-[#e63946] flex items-center justify-end pr-2 text-white text-xs font-bold transition-all duration-500"
                              style={{ width: `${pctBar}%` }}
                            >
                              {count > 0 && <span>{count}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Justificaciones Cualitativas */}
              <div className="lg:col-span-5">
                <Card className="p-5 bg-[var(--bg-surface)]">
                  <h3 className="font-bold text-[var(--text-heading)] text-sm uppercase tracking-wider pb-3 border-b border-[var(--border-color-light)]">
                    Motivos Registrados
                  </h3>

                  <div className="space-y-2.5 pt-3">
                    {comentariosPerdidaRecientes.length > 0 ? (
                      comentariosPerdidaRecientes.map((cp, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-[var(--bg-highlight)] rounded-xl border border-[var(--border-color-light)]"
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-[var(--text-heading)]">{cp.nombre}</span>
                            <span className="text-rose-700 font-mono">{cp.motivo_nombre || 'Baja'}</span>
                          </div>
                          <p className="text-xs text-[var(--text-main)] italic mt-1 line-clamp-2">
                            "{cp.comentario_perdida}"
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                        Sin comentarios registrados recientemente.
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
