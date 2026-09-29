import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Shared/Card';
import { FileSpreadsheet } from 'lucide-react';

export default function CsvImport() {
  return (
    <AppLayout>
      <Head title="Importar Prospectos (CSV)" />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--text-heading)] flex items-center gap-2">
          <FileSpreadsheet className="text-[var(--brand-primary)]" size={26} />
          <span>Importar Prospectos desde CSV</span>
        </h1>
        <Card>
          <p className="text-sm text-[var(--text-muted)]">
            Módulo a cargo de Plataforma (Dev C). En construcción.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
