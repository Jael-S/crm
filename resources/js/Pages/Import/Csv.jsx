import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Shared/Card';
import Button from '@/Shared/Button';
import ImportHistory from './ImportHistory';
import {
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  Info,
  Upload,
  X,
} from 'lucide-react';

export default function CsvImport({ historial = [], origenes = [] }) {
  const { flash } = usePage().props;
  const fileInputRef = useRef(null);
  const [uploadMessage, setUploadMessage] = useState(null);
  const { setData, post, processing, errors, reset, progress, data } = useForm({
    archivo_csv: null,
  });

  const submit = (event) => {
    event.preventDefault();
    post('/leads/import', {
      forceFormData: true,
      onSuccess: () => {
        setUploadMessage('Archivo subido correctamente.');
        reset('archivo_csv');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    });
  };

  useEffect(() => {
    if (!uploadMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setUploadMessage(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [uploadMessage]);

  return (
    <AppLayout hideFlash>
      <Head title="Importar Prospectos (CSV)" />

      <div className="space-y-6">
        {uploadMessage && (
          <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm" role="status">
            <span>{uploadMessage}</span>
            <button type="button" onClick={() => setUploadMessage(null)} aria-label="Cerrar mensaje">
              <X size={16} />
            </button>
          </div>
        )}
        {flash?.error && (
          <div className="rounded-[var(--radius-md)] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-sm" role="alert">
            {flash.error}
          </div>
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[var(--text-heading)]">
                <FileSpreadsheet className="text-[var(--brand-primary)]" size={28} />
                Importar prospectos
              </h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Carga leads de forma masiva y consulta el resultado de cada importación.
              </p>
            </div>
          </div>
          <Link href="/leads">
            <Button variant="secondary" className="w-full sm:w-auto">
              Ver prospectos
            </Button>
          </Link>
        </div>

        <div className="grid w-full max-w-full grid-cols-1 gap-6 xl:grid-cols-5">
          <Card className="min-w-0 overflow-hidden border-t-4 border-t-[var(--brand-primary)] xl:col-span-3">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-red-50 text-[var(--brand-primary)]">
                <Upload size={21} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--text-heading)]">Subir archivo CSV</h2>
                <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                  El archivo se procesará fila por fila y quedará asociado a tu usuario.
                </p>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <label
                htmlFor="archivo_csv"
                className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[var(--radius-md)] border-2 border-dashed border-[var(--border-color-dark)] bg-[var(--bg-body)] px-5 text-center transition hover:border-[var(--color-primary)] hover:bg-blue-50/30"
              >
                <FileSpreadsheet size={30} className="mb-2 text-[var(--color-primary)]" />
                <span className="text-sm font-semibold text-[var(--text-heading)]">
                  {data.archivo_csv?.name || 'Selecciona un archivo CSV o TXT'}
                </span>
                <span className="mt-1 text-xs text-[var(--text-muted)]">Tamaño máximo: 2 MB</span>
                <input
                  id="archivo_csv"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,text/csv"
                  onChange={(event) => setData('archivo_csv', event.target.files[0] ?? null)}
                  className="sr-only"
                />
              </label>
              {errors.archivo_csv && <p className="text-sm text-rose-600">{errors.archivo_csv}</p>}

              {progress && (
                <div>
                  <div className="mb-1 flex justify-between text-xs text-[var(--text-muted)]">
                    <span>Subiendo archivo</span>
                    <span>{progress.percentage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full bg-[var(--color-primary)] transition-all" style={{ width: `${progress.percentage}%` }} />
                  </div>
                </div>
              )}

              <Button type="submit" disabled={processing || !data.archivo_csv} className="w-full sm:w-auto">
                <Upload size={16} className="mr-2" />
                {processing ? 'Procesando...' : 'Importar archivo'}
              </Button>
            </form>
          </Card>

          <Card className="min-w-0 xl:col-span-2">
            <div className="mb-5 flex items-center gap-2">
              <Info size={19} className="text-[var(--color-primary)]" />
              <h2 className="text-lg font-bold text-[var(--text-heading)]">Formato de columnas</h2>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-[var(--text-muted)]">
              Usa una primera fila de cabecera para que cada dato se asigne correctamente.
            </p>
            <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border-color-light)] bg-[var(--bg-body)] p-3">
              <code className="whitespace-nowrap text-xs text-[var(--text-heading)]">
                nombre,telefono,id_origen,ci,profesion,ciudad,correo
              </code>
            </div>
            <div className="mt-4 space-y-2 text-xs text-[var(--text-muted)]">
              <p><strong className="text-[var(--text-heading)]">Obligatorios:</strong> nombre, telefono e id_origen.</p>
              <p><strong className="text-[var(--text-heading)]">Opcionales:</strong> ci, profesion, ciudad y correo.</p>
              <p><strong className="text-[var(--text-heading)]">Origen:</strong> acepta ID o nombre; los nuevos se crean automáticamente.</p>
            </div>
            {origenes.length > 0 && (
              <div className="mt-5 border-t border-[var(--border-color-light)] pt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--text-heading)]">Orígenes disponibles</p>
                <div className="flex flex-wrap gap-2">
                  {origenes.map((origen) => (
                    <span key={origen.id_origen} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-[var(--color-primary)]">
                      {origen.id_origen} · {origen.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="flex items-center gap-2 border-b border-[var(--border-color-light)] pb-3">
          <CheckCircle2 size={20} className="text-[var(--color-success)]" />
          <div>
            <h2 className="text-lg font-bold text-[var(--text-heading)]">Historial y resultados</h2>
            <p className="text-sm text-[var(--text-muted)]">Consulta las filas procesadas y los errores de cada archivo.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--text-muted)]">Mostrando las últimas {historial.length} importaciones.</p>
          <Link href="/leads/import/history">
            <Button variant="secondary" className="w-full sm:w-auto">
              Ver historial completo
            </Button>
          </Link>
        </div>
        <ImportHistory historial={historial} showSummary={false} />
      </div>
    </AppLayout>
  );
}
