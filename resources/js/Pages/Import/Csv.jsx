import React, { useRef } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Shared/Card';
import Button from '@/Shared/Button';
import { FileSpreadsheet, Upload, AlertTriangle, Inbox } from 'lucide-react';

export default function CsvImport({ historial = [], origenes = [], resultado = null }) {
  const fileInputRef = useRef(null);

  const { setData, post, processing, errors, reset, progress } = useForm({
    archivo_csv: null,
  });

  const submit = (e) => {
    e.preventDefault();
    post('/leads/import', {
      forceFormData: true,
      onSuccess: () => {
        reset('archivo_csv');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    });
  };

  const erroresImport = resultado?.errores || [];

  return (
    <AppLayout>
      <Head title="Importar Prospectos (CSV)" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-heading)]">
            Importar Prospectos (CSV)
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Carga masiva de leads a la bolsa común. Solo Administrador y Coordinador.
          </p>
        </div>
        <Link href="/leads">
          <Button variant="secondary" type="button">
            <Inbox size={16} className="mr-2" />
            Ver prospectos
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-red-50 text-[var(--brand-primary)] flex items-center justify-center">
              <Upload size={20} />
            </div>
            <div>
              <h2 className="font-bold text-[var(--text-heading)]">Subir archivo</h2>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-main)] mb-2">
                Archivo CSV de prospectos
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,text/csv"
                onChange={(e) => setData('archivo_csv', e.target.files[0] ?? null)}
                className="block w-full text-sm text-[var(--text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-[var(--radius-md)] file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-[var(--brand-primary)] hover:file:bg-red-100 cursor-pointer"
              />
              {errors.archivo_csv && (
                <p className="text-rose-600 text-sm mt-1">{errors.archivo_csv}</p>
              )}
              {progress && (
                <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-[var(--brand-primary)] transition-all"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              )}
            </div>

            <Button type="submit" disabled={processing}>
              <FileSpreadsheet size={16} className="mr-2" />
              {processing ? 'Procesando...' : 'Subir e importar CSV'}
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="font-bold text-[var(--text-heading)] mb-2">Formato esperado</h2>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            Primera fila = cabecera (opcional). Columnas en este orden:
          </p>
          <code className="block text-xs bg-[var(--bg-body)] border border-[var(--border-color-light)] rounded-[var(--radius-md)] p-3 text-[var(--text-heading)] mb-3">
            nombre,telefono,correo,id_origen
          </code>
          <p className="text-xs text-[var(--text-muted)] mb-2">Ejemplo:</p>
          <pre className="text-xs bg-[var(--bg-body)] border border-[var(--border-color-light)] rounded-[var(--radius-md)] p-3 overflow-x-auto text-[var(--text-main)]">
{`nombre,telefono,correo,id_origen
Ana Perez,70012345,ana@mail.com,1
Luis Vidal,77123456,,2`}
          </pre>
          {origenes.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-[var(--text-heading)] mb-1">IDs de origen:</p>
              <ul className="text-xs text-[var(--text-muted)] space-y-0.5">
                {origenes.map((o) => (
                  <li key={o.id_origen}>
                    <span className="font-semibold text-[var(--text-heading)]">{o.id_origen}</span>
                    {' — '}
                    {o.nombre}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                Si omites <code>id_origen</code>, se usa 1 (primer origen).
              </p>
            </div>
          )}
        </Card>
      </div>

      {erroresImport.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-600" />
            <h2 className="font-bold text-[var(--text-heading)]">
              Detalle de filas fallidas ({erroresImport.length}
              {resultado?.filas_fallidas > erroresImport.length ? '+' : ''})
            </h2>
          </div>
          <ul className="text-sm text-rose-700 space-y-1 max-h-60 overflow-y-auto">
            {erroresImport.map((err, idx) => (
              <li key={idx} className="border-b border-rose-100 pb-1">
                {err}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-semibold mb-4 text-[var(--text-heading)]">
          Historial de importaciones
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Archivo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exitosas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fallidas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historial.length > 0 ? (
                historial.map((item) => (
                  <tr key={item.id_importacion}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {item.id_importacion}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {item.nombre_archivo}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {item.usuario?.nombre_completo || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {item.total_filas}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-emerald-600 font-semibold">
                      {item.filas_exitosas}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-rose-600 font-semibold">
                      {item.filas_fallidas}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString('es-BO')
                        : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-6 text-center text-sm text-gray-500">
                    No hay importaciones registradas todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  );
}
