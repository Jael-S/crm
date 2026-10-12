import React, { useState } from 'react';
import Card from '@/Shared/Card';
import { AlertCircle, Calendar, CheckCircle2, Eye, FileText, X } from 'lucide-react';

const formatDate = (value) => (value ? new Date(value).toLocaleString('es-BO') : '—');

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
        <div className="flex flex-col gap-2 border-b border-[var(--border-color-light)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="font-bold text-[var(--text-heading)]">Archivos procesados</h3>
            <p className="text-xs text-[var(--text-muted)]">{totalRows} filas procesadas en total</p>
          </div>
          <span className="text-xs text-[var(--text-muted)]">{showSummary ? 'Historial completo' : 'Últimas importaciones'}</span>
        </div>
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm text-[var(--text-main)]">
            <thead className="border-b border-[var(--border-color-light)] bg-[var(--bg-highlight)] text-xs font-semibold uppercase text-[var(--text-heading)]">
              <tr>
                {['Importación', 'Archivo', 'Usuario', 'Filas', 'Resultado', 'Fecha', 'Acciones'].map((heading) => (
                  <th key={heading} className="px-5 py-3.5">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color-light)]">
              {historial.length ? historial.map((item) => {
                const hasErrors = Number(item.filas_fallidas || 0) > 0;
                return (
                  <tr key={item.id_importacion} className="transition hover:bg-gray-50/70">
                    <td className="px-5 py-4 font-bold text-[var(--text-heading)]">#{item.id_importacion}</td>
                    <td className="max-w-[230px] px-5 py-4"><div className="truncate font-medium" title={item.nombre_archivo}>{item.nombre_archivo}</div></td>
                    <td className="px-5 py-4 text-[var(--text-muted)]">{item.usuario?.nombre_completo || '—'}</td>
                    <td className="px-5 py-4 font-semibold">{item.total_filas ?? 0}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">{item.filas_exitosas ?? 0} correctas</span>
                        {hasErrors && <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-700">{item.filas_fallidas} con error</span>}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-[var(--text-muted)]"><Calendar size={13} className="mr-1 inline" />{formatDate(item.created_at)}</td>
                    <td className="px-5 py-4">
                      <button type="button" onClick={() => setDetalle(item)} disabled={!item.errores?.length} className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-primary)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400">
                        <Eye size={14} /> Ver errores
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
              <div><p className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary)]">Detalle de importación</p><h2 className="mt-1 text-lg font-bold text-[var(--text-heading)]">Archivo #{detalle.id_importacion}</h2><p className="text-sm text-[var(--text-muted)]">{detalle.nombre_archivo}</p></div>
              <button type="button" onClick={() => setDetalle(null)} className="rounded-full p-1.5 text-[var(--text-muted)] transition hover:bg-gray-100 hover:text-[var(--text-heading)]" aria-label="Cerrar"><X size={19} /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-5 sm:p-6">
              {detalle.errores?.length ? (
                <div className="overflow-hidden rounded-[var(--radius-md)] border border-rose-100">
                  <table className="min-w-full text-sm">
                    <thead className="bg-rose-50 text-left text-xs font-semibold uppercase text-rose-800"><tr><th className="px-4 py-3">Línea</th><th className="px-4 py-3">Motivo del error</th></tr></thead>
                    <tbody className="divide-y divide-rose-100 bg-white">{detalle.errores.map((error) => <tr key={error.id_error}><td className="px-4 py-3 font-bold text-rose-700">{error.numero_linea}</td><td className="px-4 py-3 text-[var(--text-main)]">{error.motivo}</td></tr>)}</tbody>
                  </table>
                </div>
              ) : <p className="text-sm text-[var(--text-muted)]">Esta importación no tiene errores registrados.</p>}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
