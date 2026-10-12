import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Shared/Card';
import Button from '@/Shared/Button';
import Badge from '@/Shared/Badge';
import { Bell, CheckCircle2, Clock, Calendar, User, Phone, ArrowUpRight } from 'lucide-react';

export default function RecordatoriosIndex({ recordatorios = [] }) {
  const handleCompletar = (id) => {
    router.patch(`/recordatorios/${id}/completar`, {}, { preserveScroll: true });
  };

  const getBadgeVariant = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'warning';
      case 'COMPLETADO': return 'success';
      case 'CANCELADO': return 'danger';
      default: return 'info';
    }
  };

  return (
    <AppLayout>
      <Head title="Mis Recordatorios" />

      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-heading)] flex items-center gap-2">
            <Bell size={24} className="text-[var(--brand-primary)]" />
            <span>Recordatorios y Alertas Comerciales</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Tareas programadas de contacto, llamadas y seguimiento a prospectos.
          </p>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color-light)] text-[var(--text-muted)] text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Fecha y Hora Programada</th>
                  <th className="py-3 px-4 font-semibold">Prospecto (Lead)</th>
                  <th className="py-3 px-4 font-semibold">Tarea / Descripción</th>
                  <th className="py-3 px-4 font-semibold text-center">Estado</th>
                  <th className="py-3 px-4 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color-light)]">
                {recordatorios.length > 0 ? (
                  recordatorios.map((r) => (
                    <tr key={r.id_recordatorio} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 font-medium text-[var(--text-heading)] text-xs">
                          <Clock size={14} className="text-gray-400" />
                          {new Date(r.fecha_hora).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[var(--text-heading)]">
                        {r.lead ? (
                          <div>
                            <span className="block font-bold">{r.lead.nombre}</span>
                            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                              <Phone size={11} /> {r.lead.telefono}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Prospecto no disponible</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[var(--text-heading)] max-w-sm">
                        {r.descripcion}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={getBadgeVariant(r.estado)}>
                          {r.estado}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {r.estado === 'PENDIENTE' && (
                          <Button
                            variant="secondary"
                            onClick={() => handleCompletar(r.id_recordatorio)}
                            className="text-xs py-1.5 px-3 flex items-center gap-1.5 ml-auto"
                          >
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span>Completar</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-[var(--text-muted)]">
                      No tienes recordatorios pendientes agendados.
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
