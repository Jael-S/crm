import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Button from '@/Shared/Button';
import ImportHistory from './ImportHistory';
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';

export default function ImportHistoryPage({ historial = [] }) {
  return (
    <AppLayout hideFlash>
      <Head title="Historial de Importaciones" />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Link
              href="/leads/import"
              className="mt-1 rounded-[var(--radius-md)] border border-[var(--border-color-light)] bg-white p-2 text-[var(--text-muted)] shadow-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              aria-label="Volver a importar prospectos"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[var(--text-heading)]">
                <FileSpreadsheet className="text-[var(--brand-primary)]" size={28} />
                Historial de importaciones
              </h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Consulta todos los archivos procesados y el detalle de sus filas con error.
              </p>
            </div>
          </div>
          <Link href="/leads/import">
            <Button variant="primary" className="w-full sm:w-auto">
              Nueva importación
            </Button>
          </Link>
        </div>

        <ImportHistory historial={historial} />
      </div>
    </AppLayout>
  );
}
