import React, { useState, useEffect, useRef } from 'react';
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
  Layers,
  Kanban,
  Share2,
  Tag,
  CheckCircle2,
  Bell,
  Search,
  Eye,
  Type,
  Sun,
  Moon,
  Shield,
  ShieldCheck,
  UserPlus,
  RotateCw,
  XCircle,
  CreditCard,
  Clock,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  BarChart3
} from 'lucide-react';

export default function AppLayout({ children, title, hideFlash = false }) {
  const { auth, flash, visitas_total, visitas_pagina } = usePage().props;
  const user = auth?.user;
  const roleName = user?.rol?.nombre || 'Usuario';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- 1. ESTADO DE TEMAS (Adultos, Jóvenes, Niños) ---
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('unexo_theme') || 'theme-adultos';
    }
    return 'theme-adultos';
  });

  // --- 2. ACCESIBILIDAD: ESCALADO TIPOGRÁFICO ---
  const [fontScale, setFontScale] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('unexo_font_scale') || 'font-scale-md';
    }
    return 'font-scale-md';
  });

  // --- 3. MODO OSCURO / MODO CLARO ---
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('unexo_dark_mode') === 'true';
    }
    return false;
  });

  // Sincronizar clases con el <html> y <body>
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Temas
    document.body.classList.remove('theme-adultos', 'theme-jovenes', 'theme-ninos');
    document.body.classList.add(theme);
    localStorage.setItem('unexo_theme', theme);

    // Fuente
    document.documentElement.classList.remove('font-scale-sm', 'font-scale-md', 'font-scale-lg', 'font-scale-xl');
    document.documentElement.classList.add(fontScale);
    localStorage.setItem('unexo_font_scale', fontScale);

    // Modo Oscuro / Claro
    if (darkMode) {
      document.body.classList.add('theme-dark');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('theme-dark');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('unexo_dark_mode', String(darkMode));
  }, [theme, fontScale, darkMode]);

  const cycleFontScale = (direction) => {
    const scales = ['font-scale-sm', 'font-scale-md', 'font-scale-lg', 'font-scale-xl'];
    const idx = scales.indexOf(fontScale);
    if (direction === 'up' && idx < scales.length - 1) {
      setFontScale(scales[idx + 1]);
    } else if (direction === 'down' && idx > 0) {
      setFontScale(scales[idx - 1]);
    }
  };

  // --- 4. BÚSQUEDA GLOBAL PREDICTIVA EN HEADER ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/busqueda-global?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const json = await res.json();
          setSearchResults(json.results || []);
          setSearchOpen(true);
        }
      } catch (err) {
        console.error('Error en búsqueda global:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    router.post('/logout');
  };

  // --- 5. ESTRUCTURA DE NAVEGACIÓN LIMPIA SIN PESTAÑAS DUPLICADAS ---
  const navigationGroups = [
    {
      id: 'cu1',
      title: 'USUARIOS Y ROLES',
      items: [
        { name: 'Gestión de Usuarios', href: '/usuarios', icon: Users, roles: ['Administrador'] },
      ]
    },
    {
      id: 'cu2',
      title: 'CAPTACIÓN Y OFERTA',
      items: [
        { name: 'Registrar Prospecto', href: '/leads/create', icon: UserPlus, roles: ['Administrador', 'Coordinador', 'Vendedor'] },
        { name: 'Importar Leads (CSV)', href: '/leads/import', icon: FileSpreadsheet, roles: ['Administrador', 'Coordinador'] },
        { name: 'Catálogo Académico', href: '/catalogo', icon: Layers, roles: ['Administrador', 'Coordinador'] },
        { name: 'Canales de Origen', href: '/origenes', icon: Share2, roles: ['Administrador', 'Coordinador'] },
        { name: 'Descuentos y Becas', href: '/descuentos', icon: Tag, roles: ['Administrador'] },
      ]
    },
    {
      id: 'cu3',
      title: 'ASIGNACIÓN COMERCIAL',
      items: [
        { name: 'Bolsa Común', href: '/leads/bolsa-comun', icon: Inbox, roles: ['Administrador', 'Vendedor'] },
      ]
    },
    {
      id: 'cu4',
      title: 'EMBUDO KANBAN',
      items: [
        { name: 'Tablero Pipeline', href: '/pipeline', icon: Kanban, roles: ['Administrador', 'Coordinador', 'Vendedor'] },
        { name: 'Mis Prospectos', href: '/leads', icon: UserCheck, roles: ['Administrador', 'Coordinador', 'Vendedor'] },
      ]
    },
    {
      id: 'cu5',
      title: 'MOTIVOS DE PÉRDIDA',
      items: [
        { name: 'Catálogo de Bajas', href: '/pipeline?etapa=6', icon: XCircle, roles: ['Administrador', 'Coordinador', 'Vendedor'] },
      ]
    },
    {
      id: 'cu6',
      title: 'PAGOS Y MATRÍCULA',
      items: [
        { name: 'Revisión de Pagos', href: '/pagos/revision', icon: CheckCircle2, roles: ['Administrador', 'Vendedor'] },
      ]
    },
    {
      id: 'cu7',
      title: 'BITÁCORA Y AGENDA',
      items: [
        { name: 'Recordatorios', href: '/recordatorios', icon: Bell, roles: ['Administrador', 'Coordinador', 'Vendedor'] },
      ]
    },
    {
id: 'cu8',
      title: 'ANALÍTICA Y BI',
      items: [
        { name: 'Reportes y Analítica', href: '/reportes', icon: BarChart3, roles: ['Administrador', 'Coordinador'] },
        { name: 'Embudo General', href: '/dashboard', icon: LayoutDashboard, roles: ['Administrador', 'Coordinador', 'Vendedor'] },
        { name: 'Métricas Coordinador', href: '/coordinadores/versiones', icon: GraduationCap, roles: ['Administrador', 'Coordinador'] },
      ]
    }
  ];

  // Estado del Acordeón para expandir/comprimir cada grupo de casos de uso
  const [expandedGroups, setExpandedGroups] = useState(() => {
    return {
      cu1: true,
      cu2: true,
      cu3: true,
      cu4: true,
      cu5: true,
      cu6: true,
      cu7: true,
      cu8: true,
    };
  });

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const { url } = usePage();
  const currentPath = (url || (typeof window !== 'undefined' ? window.location.pathname : '')).split('?')[0];

  const isItemActive = (href) => {
    const cleanHref = href.split('?')[0];
    if (currentPath === cleanHref) return true;
    if (cleanHref === '/leads') {
      if (currentPath === '/leads/create') return false;
      if (/^\/leads\/\d+/.test(currentPath)) return true;
      return false;
    }
    if (cleanHref !== '/dashboard' && currentPath.startsWith(`${cleanHref}/`)) {
      return true;
    }
    return false;
  };

  // Iniciales para avatar de usuario (estilo Grupo 6)
  const getInitials = (name) => {
    if (!name) return 'UN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-body)] flex flex-col transition-colors duration-200">
      
      {/* 1. HEADER SUPERIOR AZUL DINÁMICO SEGÚN TEMA (64px) */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--bg-sidebar-header)] border-b border-[var(--border-sidebar-header)] z-40 px-4 sm:px-6 flex items-center justify-between shadow-md text-white transition-colors duration-200">
        
        {/* Izquierda: Botón Móvil + Logo UNEXO + Buscador Global */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-2xl">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-200 hover:bg-white/10 focus:outline-none"
            aria-label="Alternar menú"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo UNEXO en el Header */}
          <Link href="/dashboard" className="flex items-center gap-2 mr-1 sm:mr-3 shrink-0 group">
            <img
              src="/images/unexo1.jpeg"
              alt="UNEXO"
              className="h-8 sm:h-9 w-auto rounded object-contain bg-white/10 p-0.5 shadow-2xs group-hover:scale-105 transition-transform"
            />
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-extrabold text-white text-sm tracking-wider">UNEXO</span>
              <span className="text-[10px] text-cyan-400 font-semibold tracking-wide">CRM</span>
            </div>
          </Link>

          {/* Buscador Global Predictivo */}
          <div ref={searchRef} className="relative w-full max-w-md hidden sm:block">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar prospecto por nombre, CI, teléfono o correo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-800/80 hover:bg-slate-800 focus:bg-white text-slate-100 focus:text-slate-900 placeholder:text-slate-400 border border-slate-700/80 focus:border-cyan-400 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition shadow-inner"
              />
              {searchLoading && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Resultados Predictivos Dropdown */}
            {searchOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in duration-150">
                <div className="p-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Resultados coincidentes ({searchResults.length})
                </div>
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {searchResults.map((res) => (
                      <Link
                        key={res.id}
                        href={res.url}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="p-3 hover:bg-blue-50/70 flex items-center justify-between transition group"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600">
                            {res.nombre}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            {res.ci && <span>CI: {res.ci}</span>}
                            {res.telefono && <span>Tel: {res.telefono}</span>}
                          </div>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                          {res.etapa}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No se encontraron prospectos para "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Derecha: Accesibilidad, Selector de Temas y Perfil */}
        <div className="flex items-center gap-3">

          {/* Accesibilidad: Escalado Tipográfico A- / A+ */}
          <div className="hidden lg:flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-xs font-semibold shadow-xs">
            <button
              onClick={() => cycleFontScale('down')}
              title="Reducir tamaño de fuente"
              className="px-2 py-1 text-slate-300 hover:text-white rounded hover:bg-white/10 transition cursor-pointer"
            >
              A-
            </button>
            <span className="px-1 text-slate-600">|</span>
            <button
              onClick={() => cycleFontScale('up')}
              title="Aumentar tamaño de fuente"
              className="px-2 py-1 text-slate-300 hover:text-white rounded hover:bg-white/10 transition cursor-pointer"
            >
              A+
            </button>
          </div>

          {/* Accesibilidad: Modo Oscuro / Modo Claro */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer shadow-xs ${
              darkMode
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold hover:bg-amber-300'
                : 'bg-white/10 text-slate-200 border-white/20 hover:bg-white/20 hover:text-white'
            }`}
          >
            {darkMode ? <Sun size={13} className="text-slate-950" /> : <Moon size={13} className="text-cyan-300" />}
            <span className="hidden xl:inline">{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
            <span className="xl:hidden">{darkMode ? 'Claro' : 'Oscuro'}</span>
          </button>

          {/* Selector de 3 Temas con Tipografías Únicas */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs font-medium shadow-xs">
            <button
              onClick={() => setTheme('theme-adultos')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                theme === 'theme-adultos'
                  ? 'bg-white text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Tema Adultos: Estilo formal sobrio y académico (Serif Lora)"
            >
              Adultos
            </button>
            <button
              onClick={() => setTheme('theme-jovenes')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                theme === 'theme-jovenes'
                  ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Tema Jóvenes: Moderno, geométrico tech (Plus Jakarta Sans)"
            >
              Jóvenes
            </button>
            <button
              onClick={() => setTheme('theme-ninos')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                theme === 'theme-ninos'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Tema Niños: Lúdico, bordes redondeados (Quicksand / Nunito)"
            >
              Niños
            </button>
          </div>

          {/* Perfil de Usuario */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-700">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shadow-sm ring-1 ring-white/20">
              {getInitials(user?.nombre_completo)}
            </div>
            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-white max-w-[130px] truncate">
                {user?.nombre_completo || 'Usuario'}
              </span>
              <span className="text-[11px] text-cyan-300 font-medium">
                {roleName}
              </span>
            </div>

            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-2 rounded-lg text-slate-300 hover:text-red-400 hover:bg-white/10 transition cursor-pointer"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. CONTENIDO PRINCIPAL: SIDEBAR FIJO + ÁREA DE TRABAJO */}
      <div className="flex flex-1 pt-16">
        
        {/* SIDEBAR DESKTOP (Azul dinámico según tema sin logo duplicado) */}
        <aside className="hidden md:flex flex-col w-[265px] bg-[var(--bg-sidebar-header)] text-white min-h-[calc(100vh-64px)] fixed top-16 bottom-0 z-30 shadow-md border-r border-[var(--border-sidebar-header)] transition-colors duration-200">
          
          {/* Navegación por Módulos con Acordeón Plegable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {navigationGroups.map((group) => {
              const visibleItems = group.items.filter(item => item.roles.includes(roleName));
              if (visibleItems.length === 0) return null;
              const isExpanded = expandedGroups[group.id] ?? true;

              return (
                <div key={group.id} className="space-y-1">
                  {/* Encabezado Acordeón Clicable */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer select-none group"
                  >
                    <span className="truncate group-hover:text-cyan-300 transition-colors">{group.title}</span>
                    {isExpanded ? (
                      <ChevronDown size={14} className="text-slate-400 group-hover:text-cyan-300 shrink-0 transition-transform" />
                    ) : (
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-cyan-300 shrink-0 transition-transform" />
                    )}
                  </button>

                  {/* Opciones Desplegables */}
                  {isExpanded && (
                    <nav className="space-y-1 pl-1">
                      {visibleItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isItemActive(item.href);

                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                              isActive
                                ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold shadow-xs'
                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                            <span className="flex-1">{item.name}</span>
                            {isActive && <ChevronRight size={13} className="text-sky-200" />}
                          </Link>
                        );
                      })}
                    </nav>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pie del Sidebar con Versión y Conexión */}
          <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Fase 2 · INF513</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Conectado</span>
            </span>
          </div>
        </aside>

        {/* SIDEBAR MÓVIL DRAWER CON ACORDEÓN */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex pt-16">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 bg-[var(--bg-sidebar-header)] border-r border-[var(--border-sidebar-header)] text-white h-full p-5 shadow-2xl flex flex-col z-50 overflow-y-auto transition-colors duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-4">
                <img src="/images/unexo1.jpeg" alt="Logo UNEXO" className="h-8 w-auto rounded" />
                <span className="font-bold text-sm tracking-wider">UNEXO CRM</span>
              </div>
              <div className="space-y-4 flex-1">
                {navigationGroups.map((group) => {
                  const visibleItems = group.items.filter(item => item.roles.includes(roleName));
                  if (visibleItems.length === 0) return null;
                  const isExpanded = expandedGroups[group.id] ?? true;

                  return (
                    <div key={group.id} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.id)}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-white"
                      >
                        <span>{group.title}</span>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                      {isExpanded && visibleItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isItemActive(item.href);
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                              isActive ? 'bg-sky-600 text-white font-bold' : 'text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            <Icon size={16} />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. ÁREA DE CONTENIDO PRINCIPAL + FOOTER */}
        <div className="flex-1 md:ml-[265px] flex flex-col min-h-[calc(100vh-64px)] overflow-x-hidden">
          
          <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-7xl w-full mx-auto space-y-6">
            {/* Mensajes Flash Elegantes */}
            {!hideFlash && flash?.success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl shadow-xs flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2.5 text-sm font-medium">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>{flash.success}</span>
                </div>
              </div>
            )}
            {!hideFlash && flash?.error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl shadow-xs flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2.5 text-sm font-medium">
                  <X size={18} className="text-rose-600 shrink-0" />
                  <span>{flash.error}</span>
                </div>
              </div>
            )}

            {children}
          </main>

          {/* 4. FOOTER CON CONTADOR DE VISITAS (Requisito Evans) */}
          <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">UNEXO</span>
              <span>· Unidad de Emprendimiento y Tecnología Avanzada</span>
              <span className="hidden md:inline">| Formación Continua 2026</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 shadow-xs">
                <Eye size={13} className="text-blue-600" />
                <span>Visitas totales: <strong className="text-slate-900">{visitas_total || 1}</strong></span>
              </span>
              <span className="text-slate-400">Página: <strong className="text-slate-600">{visitas_pagina || 1}</strong></span>
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
}
