import React, { useState } from 'react';
import Card from '@/Shared/Card';
import { AlertCircle, Calendar, CheckCircle2, Eye, FileText, X } from 'lucide-react';

const formatDateParts = (value) => {
  if (!value) return { date: '—', time: '' };
  const d = new Date(value);
  if (isNaN(d.getTime())) return { date: String(value), time: '' };
  return {
    date: d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    time: d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
  };
};

export default function ImportHistory({ historial = [], showSummary = true }) {
  const [detalle, setDetalle] = useState(null);

  const totalRows = historial.reduce((sum, item) => sum + Number(item.total_filas || 0), 0);
  const successfulRows = historial.reduce((sum, item) => sum + Number(item.filas_exitosas || 0), 0);
  const failedRows = historial.reduce((sum, item) => sum + Number(item.filas_fallidas || 0), 0);

  return (
    <>
      {showSummary && <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card compact className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-blue-50 text-[var(--color-primary)]">
            <FileText size={20} />
          </div>
          <div><p className="text-xl font-bold text-[var(--text-heading)]">{historial.length}</p><p className="text-xs text-[var(--text-muted)]">Importaciones</p></div>
        </Card>
        <Card compact className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-emerald-50 text-[var(--color-success)]">
            <CheckCircle2 size={20} />
          </div>
          <div><p className="text-xl font-bold text-[var(--text-heading)]">{successfulRows}</p><p className="text-xs text-[var(--text-muted)]">Filas exitosas</p></div>
        </Card>
        <Card compact className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-rose-50 text-rose-600">
            <AlertCircle size={20} />
          </div>
          <div><p className="text-xl font-bold text-[var(--text-heading)]">{failedRows}</p><p className="text-xs text-[var(--text-muted)]">Filas con error</p></div>
        </Card>
      </div>}

      <Card className="w-full max-w-full min-w-0 overflow-hidden p-0">
        <div className="flex flex-col gap-2 border-b border-[var(--border-color-light)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="font-bold text-[var(--text-heading)]">Archivos procesados</h3>
            <p className="text-xs text-[var(--text-muted)]">{totalRows} filas procesadas en total</p>
          </div>
          <span className="text-xs text-[var(--text-muted)]">{showSummary ? 'Historial completo' : 'Últimas importaciones'}</span>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-main)]">
            <thead className="border-b border-[var(--border-color-light)] bg-[var(--bg-highlight)] text-xs font-semibold uppercase text-[var(--text-heading)]">
              <tr>
                <th className="px-3 py-3 w-12 text-center">#</th>
                <th className="px-3 py-3">Archivo</th>
                <th className="px-3 py-3 hidden md:table-cell">Usuario</th>
                <th className="px-2 py-3 text-center">Filas</th>
                <th className="px-3 py-3">Resultado</th>
                <th className="px-3 py-3">Fecha</th>
                <th className="px-3 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color-light)] text-xs">
              {historial.length ? historial.map((item) => {
                const totalIncidencias = item.errores?.length || 0;
                const filasFallidas = Number(item.filas_fallidas || 0);
                const hasErrors = filasFallidas > 0;
                const advertenciasCount = Math.max(0, totalIncidencias - filasFallidas);
                const { date, time } = formatDateParts(item.created_at);

                return (
                  <tr key={item.id_importacion} className="transition hover:bg-gray-50/70">
                    <td className="px-3 py-2.5 text-center font-bold text-[var(--text-heading)] whitespace-nowrap">
                      #{item.id_importacion}
                    </td>
                    <td className="px-3 py-2.5 max-w-[170px] sm:max-w-[220px]">
                      <div className="truncate font-medium text-[var(--text-heading)]" title={item.nombre_archivo}>
                        {item.nombre_archivo}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] md:hidden truncate">
                        {item.usuario?.nombre_completo || '—'}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-[var(--text-muted)] hidden md:table-cell whitespace-nowrap">
                      {item.usuario?.nombre_completo || '—'}
                    </td>
                    <td className="px-2 py-2.5 text-center font-semibold text-[var(--text-heading)] whitespace-nowrap">
                      {item.total_filas ?? 0}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 whitespace-nowrap">
                          {item.filas_exitosas ?? 0} ok
                        </span>
                        {hasErrors && (
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 whitespace-nowrap">
                            {filasFallidas} err
                          </span>
                        )}
                        {advertenciasCount > 0 && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 whitespace-nowrap">
                            {advertenciasCount} aviso
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="text-xs text-[var(--text-heading)] font-medium">{date}</div>
                      {time && <div className="text-[10px] text-[var(--text-muted)]">{time}</div>}
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setDetalle(item)}
                        disabled={!totalIncidencias}
                        className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--color-primary)] px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
                        title={totalIncidencias ? 'Ver detalle de incidencias' : 'Sin incidencias'}
                      >
                        <Eye size={13} />
                        <span>{totalIncidencias ? 'Incidencias' : 'Sin errores'}</span>
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="7" className="px-5 py-10 text-center text-sm text-[var(--text-muted)]">No hay importaciones registradas todavía.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <Card className="w-full max-w-2xl overflow-hidden p-0 shadow-xl">
            <div className="flex items-start justify-between border-b border-[var(--border-color-light)] px-5 py-4 sm:px-6">
              <div><p className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary)]">Trazabilidad de importación</p><h2 className="mt-1 text-lg font-bold text-[var(--text-heading)]">Archivo #{detalle.id_importacion}</h2><p className="text-sm text-[var(--text-muted)]">{detalle.nombre_archivo}</p></div>
              <button type="button" onClick={() => setDetalle(null)} className="rounded-full p-1.5 text-[var(--text-muted)] transition hover:bg-gray-100 hover:text-[var(--text-heading)]" aria-label="Cerrar"><X size={19} /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-5 sm:p-6">
              {detalle.errores?.length ? (
                <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-color-light)]">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-[var(--text-heading)]"><tr><th className="px-4 py-3">Línea</th><th className="px-4 py-3">Detalle / Observación</th></tr></thead>
                    <tbody className="divide-y divide-[var(--border-color-light)] bg-white">{detalle.errores.map((error) => (
                      <tr key={error.id_error} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-bold text-[var(--color-primary)] whitespace-nowrap">Línea {error.numero_linea}</td>
                        <td className="px-4 py-3 text-[var(--text-main)]">{error.motivo}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <p className="text-sm text-[var(--text-muted)]">Esta importación no tiene incidencias registradas.</p>}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
