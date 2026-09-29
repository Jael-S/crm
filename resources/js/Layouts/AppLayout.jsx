import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
  Users,
  UserCheck,
  Inbox,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Shield,
  Layers
} from 'lucide-react';

export default function AppLayout({ children, title }) {
  const { auth, flash } = usePage().props;
  const user = auth?.user;
  const roleName = user?.rol?.nombre || 'Usuario';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = (e) => {
    e.preventDefault();
    router.post('/logout');
  };

  // Enlaces de navegación filtrados por rol
  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Administrador', 'Coordinador', 'Vendedor']
    },
    {
      name: 'Gestión de Usuarios',
      href: '/usuarios',
      icon: Users,
      roles: ['Administrador']
    },
    {
      name: 'Prospectos (Leads)',
      href: '/leads',
      icon: UserCheck,
      roles: ['Administrador', 'Coordinador', 'Vendedor']
    },
    {
      name: 'Bolsa Común',
      href: '/leads/bolsa-comun',
      icon: Inbox,
      roles: ['Administrador', 'Vendedor']
    },
    {
      name: 'Importar Leads (CSV)',
      href: '/leads/import',
      icon: FileSpreadsheet,
      roles: ['Administrador', 'Coordinador']
    },
    {
      name: 'Catálogos Lookups',
      href: '/lookups',
      icon: Layers,
      roles: ['Administrador']
    }
  ];

  const allowedNavItems = navItems.filter(item => item.roles.includes(roleName));

  const { url } = usePage();
  const currentPath = (url || (typeof window !== 'undefined' ? window.location.pathname : '')).split('?')[0];

  const isItemActive = (href) => {
    if (currentPath === href) return true;

    // Para el menú de prospectos, solo activar si es /leads, /leads/create o /leads/{id}, pero NO si es /leads/bolsa-comun o /leads/import
    if (href === '/leads') {
      if (currentPath === '/leads/create') return true;
      if (/^\/leads\/\d+/.test(currentPath)) return true;
      return false;
    }

    if (href !== '/dashboard' && currentPath.startsWith(`${href}/`)) {
      return true;
    }

    return false;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-body)] flex flex-col font-sans">
      {/* 1. Navbar Superior Fijo (80px - Rojo Corporativo) */}
      <header
        className="fixed top-0 left-0 right-0 h-20 bg-[var(--brand-secondary)] text-[var(--text-light)] z-50 px-6 flex items-center justify-between shadow-md"
        style={{ height: '80px', backgroundColor: 'var(--brand-secondary)' }}
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded text-white hover:bg-white/10 focus:outline-none"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="flex items-center space-x-3">
            <img src="/FICCT.png" alt="Logo FICCT" className="h-10 w-auto object-contain drop-shadow-sm" />
            <div>
              <span className="text-xl font-bold tracking-tight block leading-tight">CRM EDUCATIVO</span>
              <span className="text-xs text-white/80 font-normal">Control de prospectos y trazabilidad académica</span>
            </div>
          </div>
        </div>

        {/* Info del usuario logueado */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold leading-tight">{user?.nombre_completo || 'Usuario'}</span>
            <span className="text-xs text-white/80 inline-flex items-center justify-end gap-1">
              <Shield size={12} />
              {roleName}
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm bg-white/10 hover:bg-white/20 transition duration-150 text-white font-medium cursor-pointer"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* 2. Cuerpo: Sidebar (315px) + Contenedor Principal */}
      <div className="flex flex-1 pt-20">
        {/* Sidebar Desktop */}
        <aside
          className="hidden md:flex flex-col w-[315px] bg-[var(--bg-sidebar)] border-r border-[var(--border-color-light)] min-h-[calc(100vh-80px)] p-6 fixed top-20 bottom-0 overflow-y-auto"
          style={{ width: '315px' }}
        >
          <div className="text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase mb-4 px-2">
            Módulos del Sistema
          </div>
          <nav className="space-y-1.5 flex-1">
            {allowedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-[var(--radius-md)] text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                      : 'text-[var(--text-main)] hover:bg-[var(--bg-highlight)] hover:text-[var(--brand-primary)]'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-[var(--color-secondary)]'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-[var(--border-color-light)] text-xs text-[var(--text-muted)] px-2">
            <p className="font-semibold text-[var(--text-heading)]">Rol Actual: {roleName}</p>
          </div>
        </aside>

        {/* Sidebar Móvil Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex pt-20">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 bg-[var(--bg-sidebar)] h-full p-6 shadow-xl flex flex-col z-50">
              <nav className="space-y-1.5 flex-1">
                {allowedNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isItemActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-[var(--radius-md)] text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-[var(--brand-primary)] text-white'
                          : 'text-[var(--text-main)] hover:bg-[var(--bg-highlight)]'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Contenedor Principal (Main) con margen para el Sidebar fijo en desktop */}
        <main className="flex-1 md:ml-[315px] p-6 lg:p-8 min-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Mensajes Flash */}
            {flash?.success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[var(--radius-lg)] shadow-sm flex items-center justify-between">
                <span>{flash.success}</span>
              </div>
            )}
            {flash?.error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-[var(--radius-lg)] shadow-sm flex items-center justify-between">
                <span>{flash.error}</span>
              </div>
            )}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
