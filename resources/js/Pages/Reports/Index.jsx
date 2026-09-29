import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Shared/Card';
import { BarChart3 } from 'lucide-react';

export default function ReportsIndex() {
  return (
    <AppLayout>
      <Head title="Reportes" />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--text-heading)] flex items-center gap-2">
          <BarChart3 className="text-[var(--brand-primary)]" size={26} />
          <span>Reportes y Métricas Comerciales</span>
        </h1>
        <Card>
          <p className="text-sm text-[var(--text-muted)]">
            Módulo a cargo de Plataforma (Dev C - Fase 3). En construcción.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
