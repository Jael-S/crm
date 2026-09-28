import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Shared/Card';
import {
  Users,
  UserCheck,
  Layers,
  ArrowRight,
  Shield,
  GraduationCap
} from 'lucide-react';

export default function DashboardIndex({ stats, userRol }) {
  const { auth } = usePage().props;
  const user = auth?.user;

  return (
    <AppLayout>
      <Head title="Dashboard" />

      {/* Banner de Bienvenida */}
      <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[#203366] text-white p-6 sm:p-8 rounded-[var(--radius-lg)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white mb-2">
            <Shield size={13} />
            Sesión activa como {userRol}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Hola, {user?.nombre_completo}
          </h1>
          <p className="text-sm text-white/80 mt-1 max-w-xl">
            Panel de control general del CRM Educativo. Desde aquí puedes gestionar prospectos, usuarios y consultar las etapas comerciales.
          </p>
        </div>

        <div className="hidden lg:flex items-center justify-center w-20 h-20 bg-white/10 rounded-full border border-white/20">
          <GraduationCap size={44} className="text-white/90" />
        </div>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card hover className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[var(--radius-md)] bg-blue-50 text-[var(--color-primary)] flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--text-heading)]">{stats?.total_usuarios || 0}</div>
            <div className="text-xs font-medium text-[var(--text-muted)]">Usuarios en Sistema</div>
          </div>
        </Card>

        <Card hover className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[var(--radius-md)] bg-emerald-50 text-[var(--color-success)] flex items-center justify-center">
            <UserCheck size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--text-heading)]">{stats?.total_vendedores_activos || 0}</div>
            <div className="text-xs font-medium text-[var(--text-muted)]">Vendedores Activos</div>
          </div>
        </Card>

        <Card hover className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[var(--radius-md)] bg-purple-50 text-purple-600 flex items-center justify-center">
            <Layers size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--text-heading)]">{stats?.total_etapas || 0}</div>
            <div className="text-xs font-medium text-[var(--text-muted)]">Etapas del Pipeline</div>
          </div>
        </Card>

        <Card hover className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[var(--radius-md)] bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--text-heading)]">{stats?.total_origenes || 0}</div>
            <div className="text-xs font-medium text-[var(--text-muted)]">Orígenes de Lead</div>
          </div>
        </Card>
      </div>

      {/* Accesos Rápidos según rol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userRol === 'Administrador' && (
          <Card hover className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase text-[var(--brand-primary)] tracking-wider">
                  Módulo 1
                </span>
                <Users size={20} className="text-[var(--brand-primary)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-heading)] mb-1">
                Gestión y Creación de Usuarios
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                Administra cuentas de coordinadores y vendedores, asigna contraseñas y configura la participación en Round-Robin.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border-color-light)]">
              <Link
                href="/usuarios"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition"
              >
                <span>Administrar Usuarios</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </Card>
        )}

        <Card hover className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase text-purple-700 tracking-wider">
                Módulo 2 (Lookups)
              </span>
              <Layers size={20} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-heading)] mb-1">
              Catálogos y Etapas Pipeline
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              Visualiza las 6 etapas fijas del Kanban, los orígenes de contacto permitidos y los motivos de pérdida.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border-color-light)]">
            <Link
              href="/lookups"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition"
            >
              <span>Ver Catálogos Base</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
