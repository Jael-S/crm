import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
  Layers,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Target,
  Compass,
  Award,
  Users,
  Database,
  Cpu,
  ShieldCheck,
  Send,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  BookOpen,
  DollarSign,
  Activity,
  FileCheck2,
  RefreshCw,
  Zap,
  Globe
} from 'lucide-react';

export default function Landing({ programas = [], modulos = [], descuentos = [], profesiones = [] }) {
  const { auth, flash, errors } = usePage().props;

  // Estado del tipo de oferta: PROGRAMA o MODULO
  const [tipoOferta, setTipoOferta] = useState('PROGRAMA');
  const ofertaActual = tipoOferta === 'PROGRAMA' ? programas : modulos;

  const [selectedItem, setSelectedItem] = useState(
    ofertaActual.length > 0 ? ofertaActual[0] : null
  );

  const [navScrolled, setNavScrolled] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // 1. Hero Background Carousel (Cambia cada 4 segundos con efecto Ken Burns)
  const heroImages = [
    {
      url: '/images/landing/crm5.webp',
      tag: 'MÓDULO 236 · FICCT UAGRM',
      caption: 'Plataforma CRM y Gestión Académica',
    },
    {
      url: '/images/landing/crm6.jpg',
      tag: 'ANALÍTICA DE CONVERSIÓN & TRAZABILIDAD',
      caption: 'Modelado Predictivo y Visualización de Métricas',
    },
    {
      url: '/images/landing/crm.jpg',
      tag: 'OFERTA Y MATRICULACIÓN EN LÍNEA',
      caption: 'Integración Sincrónica con Proyecto 2',
    },
  ];
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // 2. Showcase Carousel Interactivo del Sistema (Auto-play cada 3.8s con pausa en hover)
  const [showcaseSlide, setShowcaseSlide] = useState(0);
  const [showcasePaused, setShowcasePaused] = useState(false);

  const showcaseTabs = [
    {
      id: 'kanban',
      title: 'Embudo Kanban 6 Etapas',
      badge: 'TRAZABILIDAD',
      resumen: 'Visualización inmediata del avance comercial desde Nuevo hasta Convertido.',
      imagen: '/images/landing/kanban.png',
    },
    {
      id: 'round-robin',
      title: 'Reparto Round Robin',
      badge: 'AUTOMATIZACIÓN',
      resumen: 'Distribución balanceada de prospectos entre asesores comerciales activos.',
      imagen: '/images/landing/crm2.jpg',
    },
    {
      id: 'proyecto2',
      title: 'Integración REST Proyecto 2',
      badge: 'MATRÍCULA SÍNCRONA',
      resumen: 'Handshake HTTP inmediato para formalizar la inscripción en el microservicio académico.',
      imagen: '/images/landing/crm3.jpg',
    },
    {
      id: 'pagos',
      title: 'Conciliación de Comprobantes',
      badge: 'AUDITORÍA CONTABLE',
      resumen: 'Cola de verificación de transferencias y depósitos con confirmación en un clic.',
      imagen: '/images/landing/crm4.webp',
    },
  ];

  useEffect(() => {
    if (showcasePaused) return;
    const timer = setInterval(() => {
      setShowcaseSlide((prev) => (prev + 1) % showcaseTabs.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [showcasePaused, showcaseTabs.length]);

  // 3. Editorial Split Carousel (50/50)
  const [editorialSlide, setEditorialSlide] = useState(0);
  const editorialItems = [
    {
      category: 'ARQUITECTURA & INTEGRIDAD',
      title: 'TRANSACCIONES ACID EN POSTGRESQL.',
      points: [
        'Atomicidad y aislamiento MVCC para evitar colisiones de asignación.',
        'Bitácora inmutable con auditoría cronológica de cada cambio de etapa.',
        'Consistencia estricta en 19 tablas de negocio relacionales.',
      ],
      imagen: '/images/landing/crm5.webp',
      badge: 'PostgreSQL · Concurrencia MVCC',
    },
    {
      category: 'FLUJO COMERCIAL AUDITABLE',
      title: 'EMBUDO VISUAL DE 6 ETAPAS.',
      points: [
        'Avance controlado con justificación obligatoria en etapa Perdido.',
        'Cola de revisión contable para comprobantes bancarios.',
        'Formalización de expedientes con cédula, fecha de nacimiento y ciudad.',
      ],
      imagen: '/images/landing/kanban.png',
      badge: 'Kanban · Reglas de Negocio',
    },
    {
      category: 'ACCESIBILIDAD & RENDIMIENTO',
      title: 'EXPERIENCIA UNIVERSAL ADAPTATIVA.',
      points: [
        'Tres modos visuales: Adultos (Sobrio), Jóvenes (Moderno) y Niños (Lúdico).',
        'Cumplimiento de estándares de contraste WCAG y escalado de fuente A- / A+.',
        'Renderizado reactivo con Inertia.js y cero recargas pesadas.',
      ],
      imagen: '/images/landing/crm6.jpg',
      badge: 'Inertia.js · React · Tailwind',
    },
  ];

  // Formulario 3D de Registro
  const { data, setData, post, processing, reset } = useForm({
    nombre: '',
    telefono: '',
    correo: '',
    ciudad: 'Santa Cruz de la Sierra',
    id_profesion: '',
    tipo_item: 'PROGRAMA',
    programa: programas[0]?.nombre || 'Inteligencia Artificial Aplicada a Negocios',
    id_interes_externo: programas[0]?.id_item_externo || 1,
    precio: programas[0]?.precio || 2400.0,
    mensaje: '',
  });

  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (flash?.success) {
      setSubmittedSuccess(true);
      reset('nombre', 'telefono', 'correo', 'mensaje');
    }
  }, [flash]);

  // Cambio de pestaña en el formulario
  const handleCambioTipoOferta = (tipo) => {
    setTipoOferta(tipo);
    const lista = tipo === 'PROGRAMA' ? programas : modulos;
    const defaultItem = lista[0];
    if (defaultItem) {
      setSelectedItem(defaultItem);
      setData((prev) => ({
        ...prev,
        tipo_item: tipo,
        programa: defaultItem.nombre,
        id_interes_externo: defaultItem.id_item_externo,
        precio: defaultItem.precio || 1500.0,
      }));
    }
  };

  const handleSeleccionarItem = (item) => {
    setSelectedItem(item);
    setData((prev) => ({
      ...prev,
      programa: item.nombre,
      id_interes_externo: item.id_item_externo,
      tipo_item: item.tipo || tipoOferta,
      precio: item.precio || 1500.0,
    }));
  };

  const handlePostularDesdeCatalogo = (item) => {
    handleCambioTipoOferta(item.tipo || 'PROGRAMA');
    handleSeleccionarItem(item);
    const elem = document.getElementById('admision');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/registro', {
      preserveScroll: true,
    });
  };

  const fundadoras = [
    {
      nombre: 'Nataly Vanessa Martínez Martínez',
      rol: 'Co-Fundadora & Product Manager',
      enfoque: 'Arquitectura Backend, Integración REST Proyecto 2 & Lógica Transaccional',
      foto: '/images/team/nataly.jpg',
      iniciales: 'NM',
      especialidades: ['LARAVEL', 'POSTGRESQL', 'API REST', 'ARQUITECTURA'],
    },
    {
      nombre: 'Jael Mamani Sandoval',
      rol: 'Co-Fundadora & Lead de Calidad (SQA Lead)',
      enfoque: 'Arquitectura Frontend, Experiencia de Usuario & Accesibilidad Multi-Público',
      foto: '/images/team/jael.jpg',
      iniciales: 'JM',
      especialidades: ['REACT', 'INERTIA', 'ACCESIBILIDAD WCAG', 'UX/UI'],
    },
    {
      nombre: 'Nicol Melany Guairaje Herbas',
      rol: 'Co-Fundadora & Coordinadora de Operaciones',
      enfoque: 'Modelado Relacional de Datos, Auditoría Transaccional y Flujos de Conversión',
      foto: '/images/team/nicol.jpeg',
      iniciales: 'NG',
      especialidades: ['MODELADO RELACIONAL', 'BITÁCORA', 'ROUND ROBIN', 'PROCESOS'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#000d1e] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white overflow-x-hidden">
      <Head title="UNEXO · CRM Educativo & Admisiones | FICCT UAGRM" />

      {/* 1. NAVBAR FLOTANTE */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-[82px] transition-all duration-300 ${
          navScrolled
            ? 'bg-[#001024]/95 backdrop-blur-md border-b border-cyan-500/20 shadow-2xl'
            : 'bg-transparent border-b border-white/5'
        }`}
      >
        <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          {/* Lado Izquierdo: Logos Oficiales */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-11 sm:h-12 w-auto p-1 bg-white rounded-lg shadow-sm flex items-center justify-center transition-transform group-hover:scale-105">
                <img
                  src="/images/unexo4.jpeg"
                  alt="Logo UNEXO"
                  className="h-full w-auto object-contain"
                />
              </div>

              <div className="h-10 w-auto hidden sm:flex items-center border-l border-white/20 pl-3">
                <img
                  src="/images/FICCT.png"
                  alt="Escudo FICCT UAGRM"
                  className="h-8 w-auto object-contain drop-shadow"
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-white">
                    UNEXO
                  </span>
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800">
                    FICCT
                  </span>
                </div>
                <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase -mt-0.5">
                  MÓDULO 236 · UAGRM
                </span>
              </div>
            </Link>

            <nav className="hidden xl:flex items-center gap-6 pl-6 border-l border-white/10">
              <a href="#hero" className="text-[11px] font-bold tracking-widest uppercase text-slate-300 hover:text-cyan-400 transition">
                SISTEMA
              </a>
              <a href="#showcase" className="text-[11px] font-bold tracking-widest uppercase text-slate-300 hover:text-cyan-400 transition">
                PLATAFORMA VIVA
              </a>
              <a href="#capacidades" className="text-[11px] font-bold tracking-widest uppercase text-slate-300 hover:text-cyan-400 transition">
                CAPACIDADES
              </a>
              <a href="#programas" className="text-[11px] font-bold tracking-widest uppercase text-slate-300 hover:text-cyan-400 transition">
                OFERTA ACADÉMICA
              </a>
              <a href="#equipo" className="text-[11px] font-bold tracking-widest uppercase text-slate-300 hover:text-cyan-400 transition">
                EQUIPO FUNDADOR
              </a>
              <a href="#admision" className="text-[11px] font-bold tracking-widest uppercase text-slate-300 hover:text-cyan-400 transition">
                POSTULACIÓN
              </a>
            </nav>
          </div>

          {/* Lado Derecho */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="#admision"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-cyan-400 hover:text-white px-3.5 py-2 border border-cyan-500/40 hover:border-cyan-400 rounded-lg transition"
            >
              <span>Postularse</span>
              <ChevronRight size={14} />
            </a>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#002855] hover:bg-[#003875] text-white font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-lg border border-cyan-500/40 shadow-lg shadow-cyan-900/30 transition transform hover:-translate-y-0.5"
            >
              <span>Plataforma</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO MONUMENTAL CON CARRUSEL DE FONDO (Cambia cada 4s con Ken Burns) */}
      <section
        id="hero"
        className="relative min-h-[100vh] flex flex-col justify-end pt-28 pb-16 px-4 sm:px-8 lg:px-16 overflow-hidden bg-[#000d1e]"
      >
        {/* Capa de Fondos Fotográficos Rotativos con Transición Suave */}
        {heroImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              idx === heroSlide ? 'opacity-100 z-0' : 'opacity-0 -z-10'
            }`}
          >
            <img
              src={img.url}
              alt={img.caption}
              className={`w-full h-full object-cover object-center transform transition-transform duration-[7000ms] ease-out brightness-40 ${
                idx === heroSlide ? 'scale-105' : 'scale-100'
              }`}
            />
          </div>
        ))}

        {/* Gradiente Scrim en Azul Marino Profundo */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#000d1e] via-[#001024]/75 to-[#000d1e]/50 pointer-events-none" />

        <div className="max-w-[1400px] mx-auto w-full relative z-20 space-y-6 sm:space-y-7">
          {/* Eyebrow Institucional */}
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-[0.2em] uppercase text-cyan-400 bg-cyan-950/70 border border-cyan-800/80 px-3.5 py-1.5 rounded-full backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>FICCT · UAGRM | UNIDAD DE EMPRENDIMIENTO Y TECNOLOGÍA AVANZADA</span>
          </div>

          {/* Título Corto y Monumental (Petición expresa: títulos cortos y de gran impacto) */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[0.92] uppercase text-white font-sans">
            <span className="block">CONVERSIÓN INTELIGENTE.</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              TRAZABILIDAD FICCT.
            </span>
          </h1>

          <p className="max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Plataforma integral de captación omnicanal, asignación equitativa Round Robin, embudo Kanban de 6 etapas y matriculación formalizada mediante microservicios en el Módulo 236.
          </p>

          {/* Botones de Acción Hero */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={auth?.user ? '/dashboard' : '/login'}
              className="inline-flex items-center gap-3 bg-[#002855] hover:bg-[#003875] text-white border border-cyan-500/40 font-black text-sm tracking-wider uppercase px-6 sm:px-8 py-4 rounded-xl shadow-xl shadow-cyan-900/30 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>INGRESAR A LA PLATAFORMA</span>
              <ArrowUpRight size={18} className="text-cyan-400" />
            </Link>

            <a
              href="#admision"
              className="inline-flex items-center gap-3 bg-slate-900/80 hover:bg-slate-800 text-white border border-white/20 font-bold text-sm tracking-wider uppercase px-6 sm:px-8 py-4 rounded-xl transition cursor-pointer"
            >
              <span>POSTULARME AHORA</span>
              <ChevronRight size={18} className="text-cyan-400" />
            </a>
          </div>

          {/* Indicadores del Carrusel de Fondo */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <div className="flex items-center gap-2">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setHeroSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === heroSlide ? 'w-8 bg-cyan-400' : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Ir a diapositiva ${i + 1}`}
                />
              ))}
            </div>
            <div className="text-[11px] font-mono text-slate-400 tracking-wider">
              {heroImages[heroSlide].tag}
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOWCASE CAROUSEL: PLATAFORMA EN VIVO (Carrusel interactivo cada 3.5s) */}
      <section
        id="showcase"
        className="py-24 sm:py-32 bg-[#001024] border-t border-b border-white/10 relative overflow-hidden"
        onMouseEnter={() => setShowcasePaused(true)}
        onMouseLeave={() => setShowcasePaused(false)}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
          {/* Cabecera del Showcase */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-cyan-400">
                PLATAFORMA VIVA · MÓDULO 236
              </span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
                EL SISTEMA EN ACCIÓN
              </h2>
            </div>

            {/* Controles Circulares Prev / Next */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowcaseSlide((prev) => (prev - 1 + showcaseTabs.length) % showcaseTabs.length)
                }
                className="w-11 h-11 rounded-full border border-white/20 hover:border-cyan-400 hover:bg-cyan-950/80 text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Anterior módulo"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => setShowcaseSlide((prev) => (prev + 1) % showcaseTabs.length)}
                className="w-11 h-11 rounded-full border border-white/20 hover:border-cyan-400 hover:bg-cyan-950/80 text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Siguiente módulo"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Pestañas Superiores de Navegación del Carrusel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {showcaseTabs.map((tab, idx) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setShowcaseSlide(idx)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  idx === showcaseSlide
                    ? 'bg-[#002855] border-cyan-400 text-white shadow-lg'
                    : 'bg-[#000d1e] border-white/10 text-slate-400 hover:text-white hover:border-white/30'
                }`}
              >
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider block text-cyan-400 mb-1">
                  {tab.badge}
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-white block">
                  {tab.title}
                </span>
              </button>
            ))}
          </div>

          {/* Visualizador de Diapositiva Activa con Mockup y Fotografía */}
          <div className="bg-[#000d1e] rounded-3xl border border-white/15 p-6 sm:p-10 shadow-2xl relative overflow-hidden group">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Información Descriptiva */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-md border border-cyan-800">
                  <Activity size={14} />
                  <span>{showcaseTabs[showcaseSlide].badge}</span>
                </div>

                <h3 className="text-2xl sm:text-4xl font-black uppercase text-white leading-tight">
                  {showcaseTabs[showcaseSlide].title}
                </h3>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {showcaseTabs[showcaseSlide].resumen}
                </p>

                <div className="pt-2">
                  <Link
                    href={auth?.user ? '/dashboard' : '/login'}
                    className="inline-flex items-center gap-2 text-xs font-extrabold tracking-wider uppercase text-cyan-400 hover:text-white transition"
                  >
                    <span>Ver este módulo en el sistema</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Fotografía / Mockup en Alta Resolución con Zoom Suave */}
              <div className="lg:col-span-7 relative h-72 sm:h-96 rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                <img
                  src={showcaseTabs[showcaseSlide].imagen}
                  alt={showcaseTabs[showcaseSlide].title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000d1e] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-400 font-bold">Estado: Conectado & Operativo</span>
                  <span className="text-slate-400">FICCT · Módulo 236</span>
                </div>
              </div>
            </div>

            {/* Barra de Progreso del Carrusel */}
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Diapositiva 0{showcaseSlide + 1} de 0{showcaseTabs.length}</span>
              <span className="text-cyan-400">{showcasePaused ? 'En pausa (Mouse encima)' : 'Rotación automática'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BENTO GRID CON HOVER DINÁMICO & FOTOS */}
      <section id="capacidades" className="py-24 sm:py-32 bg-[#000d1e] relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 space-y-16">
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-cyan-400">
              ARQUITECTURA DE SOFTWARE & NEGOCIO
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              CAPACIDADES DEL CRM
            </h2>
            <p className="max-w-xl text-sm text-slate-300">
              Pasa el mouse sobre las tarjetas para interactuar con los componentes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Embudo Kanban con imagen */}
            <div className="md:col-span-2 bg-[#001024] p-8 sm:p-10 rounded-3xl border border-white/10 hover:border-cyan-400/80 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-950/50 transition-all duration-300 relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-cyan-400 font-bold bg-cyan-950/80 px-3 py-1 rounded-md border border-cyan-800">
                  <Layers size={14} />
                  <span>EMBUDO KANBAN</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black uppercase text-white">
                  6 Etapas Comerciales
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  Nuevo, En Contacto, Seguimiento, Promesa de Pago, Convertido y Perdido. Cada transición ejecuta validaciones de integridad referencial y actualiza la bitácora cronológica inmutable.
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-3">
                  {['Nuevo', 'En Contacto', 'Seguimiento', 'Promesa', 'Convertido', 'Perdido'].map((et, i) => (
                    <div key={i} className="bg-slate-900/90 border border-white/10 p-2.5 rounded-xl text-center group-hover:border-cyan-500/50 transition">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 block mb-0.5">0{i+1}</span>
                      <span className="text-xs font-bold text-white block truncate">{et}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 2: Round Robin */}
            <div className="bg-[#001024] p-8 rounded-3xl border border-white/10 hover:border-cyan-400/80 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-950/50 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 bg-blue-950/80 border border-blue-800 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-black uppercase text-white">
                Round Robin
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Reparto automático y balanceado de prospectos entre los vendedores activos, eliminando favoritismos y asegurando atención en minutos.
              </p>
            </div>

            {/* Card 3: Integración REST */}
            <div className="bg-[#001024] p-8 rounded-3xl border border-white/10 hover:border-cyan-400/80 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-950/50 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 bg-cyan-950/80 border border-cyan-800 rounded-xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Cpu size={24} />
              </div>
              <h3 className="text-xl font-black uppercase text-white">
                REST Proyecto 2
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Envío formal de matrícula hacia el microservicio académico, verificando cédula, fecha de nacimiento y ciudad de residencia del alumno.
              </p>
            </div>

            {/* Card 4: Multi-Tema Accesible */}
            <div className="md:col-span-2 bg-[#001024] p-8 sm:p-10 rounded-3xl border border-white/10 hover:border-cyan-400/80 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-950/50 transition-all duration-300 space-y-4 group">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-cyan-400 font-bold bg-cyan-950/80 px-3 py-1 rounded-md border border-cyan-800">
                <Sparkles size={14} />
                <span>MOTOR MULTI-TEMA</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white">
                Accesibilidad: Adultos, Jóvenes y Niños
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Paletas calibradas bajo directrices WCAG con selector de contraste y escalado tipográfico dinámico (A- / A+) para inclusión universal en toda la facultad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL SPLIT CAROUSEL 50/50 */}
      <section className="py-24 sm:py-32 bg-[#001024] border-t border-b border-white/10 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400">
                REPORTAJE TÉCNICO
              </span>
              <h3 className="text-2xl sm:text-4xl font-black uppercase text-white">
                INGENIERÍA DEL CRM
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEditorialSlide((prev) => (prev - 1 + editorialItems.length) % editorialItems.length)}
                className="w-10 h-10 rounded-full border border-white/20 hover:border-cyan-400 hover:text-cyan-400 flex items-center justify-center transition cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => setEditorialSlide((prev) => (prev + 1) % editorialItems.length)}
                className="w-10 h-10 rounded-full border border-white/20 hover:border-cyan-400 hover:text-cyan-400 flex items-center justify-center transition cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Texto y Bullets */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                {editorialItems[editorialSlide].category}
              </span>
              <h4 className="text-2xl sm:text-3xl font-black uppercase text-white leading-snug">
                {editorialItems[editorialSlide].title}
              </h4>
              <ul className="space-y-3">
                {editorialItems[editorialSlide].points.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
              <div className="inline-block pt-2">
                <span className="text-[11px] font-mono px-3 py-1 bg-slate-900 border border-white/20 rounded-md text-cyan-300">
                  {editorialItems[editorialSlide].badge}
                </span>
              </div>
            </div>

            {/* Imagen Editorial con Zoom */}
            <div className="lg:col-span-7 relative h-72 sm:h-96 rounded-3xl overflow-hidden border border-white/10 group shadow-2xl">
              <img
                src={editorialItems[editorialSlide].imagen}
                alt="Arquitectura"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-85"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. CATÁLOGO CON PESTAÑAS: [ PROGRAMAS COMPLETOS ] / [ MÓDULOS INDIVIDUALES ] */}
      <section id="programas" className="py-24 sm:py-32 bg-[#000d1e] border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-cyan-400">
                CAPACITACIÓN & ESPECIALIZACIÓN FICCT
              </span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
                OFERTA FORMATIVA UNEXO
              </h2>
            </div>

            {/* Selector de Pestañas para Oferta */}
            <div className="flex items-center gap-2 p-1.5 bg-[#001024] rounded-xl border border-white/15">
              <button
                type="button"
                onClick={() => handleCambioTipoOferta('PROGRAMA')}
                className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition cursor-pointer ${
                  tipoOferta === 'PROGRAMA'
                    ? 'bg-[#002855] text-white border border-cyan-500/40 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Diplomados y Programas
              </button>
              <button
                type="button"
                onClick={() => handleCambioTipoOferta('MODULO')}
                className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition cursor-pointer ${
                  tipoOferta === 'MODULO'
                    ? 'bg-[#002855] text-white border border-cyan-500/40 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Cursos y Módulos
              </button>
            </div>
          </div>

          {/* Tarjetas de Cursos con Imágenes y Hover */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ofertaActual.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#001024] rounded-2xl border border-white/10 flex flex-col justify-between overflow-hidden hover:border-cyan-400/80 hover:scale-[1.02] transition-all duration-300 shadow-xl group"
              >
                <div className="relative h-44 overflow-hidden border-b border-white/10">
                  <img
                    src={item.imagen || '/images/landing/hero-analytics.jpg'}
                    alt={item.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-85"
                  />
                  <div className="absolute top-3 left-3 bg-[#000d1e]/90 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono font-bold text-cyan-400 border border-cyan-800">
                    {item.badge || 'FICCT'}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-[#000d1e]/90 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-white">
                    {item.duracion || '40 Horas'}
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-black text-white leading-snug line-clamp-2">
                      {item.nombre}
                    </h4>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                      {item.descripcion}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-mono text-slate-400 uppercase">Inversión:</span>
                      <span className="text-lg font-black text-white">
                        Bs. {item.precio ? Number(item.precio).toFixed(2) : '1,200.00'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePostularDesdeCatalogo(item)}
                      className="w-full py-2.5 px-4 bg-[#002855] hover:bg-[#003875] text-white border border-cyan-500/40 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>Postularme</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. EQUIPO FUNDADOR (Fotos más grandes, elegantes y sin registro universitario) */}
      <section id="equipo" className="py-24 sm:py-32 bg-[#001024] border-b border-white/10 relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-cyan-400">
              EQUIPO FUNDADOR & LIDERAZGO TÉCNICO
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              DESARROLLADORAS
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones (FICCT - UAGRM), Grupo 5-SC.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {fundadoras.map((dev, i) => (
              <div
                key={i}
                className="bg-[#000d1e] rounded-3xl border border-white/10 overflow-hidden flex flex-col justify-between hover:border-cyan-400/80 hover:scale-[1.02] transition-all duration-300 shadow-2xl group"
              >
                {/* Foto más grande con zoom en hover */}
                <div className="relative h-64 w-full overflow-hidden bg-slate-900 border-b border-white/10">
                  <img
                    src={dev.foto}
                    alt={dev.nombre}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    style={{ display: 'none' }}
                    className="w-full h-full rounded-none bg-gradient-to-br from-[#001024] to-[#002855] text-cyan-400 font-black text-4xl flex items-center justify-center font-mono"
                  >
                    {dev.iniciales}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000d1e] via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wide block">
                      {dev.rol}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3 text-center">
                  <h3 className="text-lg font-black text-white leading-snug">
                    {dev.nombre}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {dev.enfoque}
                  </p>

                  <div className="flex flex-wrap justify-center gap-1.5 pt-3 border-t border-white/10">
                    {dev.especialidades.map((esp, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-white/10"
                      >
                        {esp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FORMULARIO 3D DE ADMISIÓN / REGISTRO LIBRE */}
      <section id="admision" className="py-24 sm:py-32 bg-[#000d1e] relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Lado Izquierdo: Info */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight leading-tight">
                POSTULACIÓN OFICIAL FICCT
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Selecciona tu programa o módulo de interés. Tu solicitud ingresará al embudo transaccional y será asignada automáticamente a un asesor comercial de UNEXO.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  <span>Atención directa vía WhatsApp por el asesor asignado.</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  <span>Certificación universitaria emitida por la FICCT - UAGRM.</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  <span>Acceso a clases y laboratorios del Módulo 236.</span>
                </div>
              </div>
            </div>

            {/* Lado Derecho: Tarjeta Formulario 3D con Logo y Doble Selector */}
            <div className="lg:col-span-7">
              <div className="bg-[#001024] p-7 sm:p-10 rounded-3xl border-2 border-cyan-500/30 shadow-[0_25px_60px_-15px_rgba(0,18,36,0.95)] relative overflow-hidden backdrop-blur-md">
                {/* Cabecera del Formulario con LOGO UNEXO visible */}
                <div className="flex items-center gap-4 pb-6 mb-6 border-b border-white/10">
                  <div className="h-14 w-auto p-1.5 bg-white rounded-xl shadow-md shrink-0 flex items-center justify-center">
                    <img src="/images/unexo4.jpeg" alt="Logo UNEXO" className="h-full w-auto object-contain" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black uppercase text-white leading-tight">
                      Postulación a Formación
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      UNEXO · Módulo 236 FICCT UAGRM
                    </p>
                  </div>
                </div>

                {/* Confirmación */}
                {submittedSuccess && flash?.success && (
                  <div className="mb-6 p-4 bg-emerald-950/80 border border-emerald-600 rounded-2xl text-emerald-100 text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                      <CheckCircle2 size={18} />
                      <span>{flash.success}</span>
                    </div>
                    <p className="text-slate-300">
                      Tu postulación ha sido registrada en el sistema en etapa <strong>Nuevo (Bolsa Común)</strong>. Un asesor de admisiones de la FICCT se pondrá en contacto contigo a la brevedad.
                    </p>
                  </div>
                )}

                {errors.general && (
                  <div className="mb-6 p-3 bg-red-950/80 border border-red-700 rounded-xl text-red-200 text-xs">
                    {errors.general}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Selector 1: Programa o Módulo */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      ¿Qué tipo de formación buscas? <span className="text-cyan-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleCambioTipoOferta('PROGRAMA')}
                        className={`py-3 px-3 rounded-xl border text-xs font-extrabold uppercase tracking-wider transition cursor-pointer text-center ${
                          tipoOferta === 'PROGRAMA'
                            ? 'bg-[#002855] text-white border-cyan-400 shadow-md'
                            : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        Programa / Diplomado
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCambioTipoOferta('MODULO')}
                        className={`py-3 px-3 rounded-xl border text-xs font-extrabold uppercase tracking-wider transition cursor-pointer text-center ${
                          tipoOferta === 'MODULO'
                            ? 'bg-[#002855] text-white border-cyan-400 shadow-md'
                            : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        Módulo / Curso Individual
                      </button>
                    </div>
                  </div>

                  {/* Selector 2: Dropdown Dinámico */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Selecciona la opción de interés <span className="text-cyan-400">*</span>
                    </label>
                    <select
                      value={data.programa}
                      onChange={(e) => {
                        const itm = ofertaActual.find((p) => p.nombre === e.target.value);
                        if (itm) handleSeleccionarItem(itm);
                      }}
                      className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition shadow-inner"
                    >
                      {ofertaActual.map((p, i) => (
                        <option key={i} value={p.nombre} className="bg-slate-900 text-white">
                          {p.nombre} (Bs. {p.precio ? Number(p.precio).toFixed(0) : '1,200'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nombre Completo */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Nombre Completo <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan Carlos Pérez Morales"
                      value={data.nombre}
                      onChange={(e) => setData('nombre', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition shadow-inner"
                    />
                    {errors.nombre && (
                      <span className="text-red-400 text-[11px] mt-1 block">{errors.nombre}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Teléfono / WhatsApp */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        WhatsApp / Teléfono <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. 78012345"
                        value={data.telefono}
                        onChange={(e) => setData('telefono', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition shadow-inner font-mono"
                      />
                      {errors.telefono && (
                        <span className="text-red-400 text-[11px] mt-1 block">{errors.telefono}</span>
                      )}
                    </div>

                    {/* Correo */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        placeholder="juan.perez@uagrm.edu.bo"
                        value={data.correo}
                        onChange={(e) => setData('correo', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Ciudad */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Ciudad de Residencia <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Santa Cruz de la Sierra"
                        value={data.ciudad}
                        onChange={(e) => setData('ciudad', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition shadow-inner"
                      />
                    </div>

                    {/* Profesión */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Profesión / Ocupación
                      </label>
                      <select
                        value={data.id_profesion}
                        onChange={(e) => setData('id_profesion', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition shadow-inner"
                      >
                        <option value="" className="bg-slate-900 text-slate-400">Seleccionar Profesión...</option>
                        {profesiones.map((p) => (
                          <option key={p.id_profesion} value={p.id_profesion} className="bg-slate-900 text-white">
                            {p.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Botón Sobrio y Elegante (Sin brillo chillón) */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full py-4 px-6 bg-[#002855] hover:bg-[#003875] text-white border border-cyan-500/40 font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg hover:shadow-cyan-900/30 transition transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Registrando Postulación...</span>
                        </>
                      ) : (
                        <>
                          <span>ENVIAR MI POSTULACIÓN</span>
                          <Send size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER INSTITUCIONAL */}
      <footer className="bg-[#000814] text-slate-400 pt-16 pb-12 border-t border-white/10 text-xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-auto p-1 bg-white rounded-lg">
                  <img src="/images/unexo4.jpeg" alt="UNEXO" className="h-full w-auto object-contain" />
                </div>
                <img src="/images/FICCT.png" alt="FICCT" className="h-9 w-auto object-contain" />
                <span className="font-black text-sm tracking-wider uppercase text-white">
                  UNEXO · FICCT UAGRM
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-sm text-xs">
                Unidad de Emprendimiento y Tecnología Avanzada de la Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-white">
                Navegación
              </h4>
              <ul className="space-y-2">
                <li><a href="#hero" className="hover:text-cyan-400 transition">Inicio</a></li>
                <li><a href="#showcase" className="hover:text-cyan-400 transition">Plataforma Viva</a></li>
                <li><a href="#capacidades" className="hover:text-cyan-400 transition">Capacidades CRM</a></li>
                <li><a href="#programas" className="hover:text-cyan-400 transition">Oferta Formativa</a></li>
                <li><a href="#equipo" className="hover:text-cyan-400 transition">Equipo Fundador</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-white">
                Sede FICCT
              </h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2">
                  <MapPin size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                  <span>Av. Busch, Campus Universitario, Módulo 236 (FICCT), Santa Cruz.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={14} className="text-cyan-400 shrink-0" />
                  <span>(591) 3 - 3553636</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={14} className="text-cyan-400 shrink-0" />
                  <span>f_icct@uagrm.edu.bo</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-white">
                Acceso Plataforma
              </h4>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-[#001024] hover:bg-[#002855] text-cyan-400 hover:text-white border border-cyan-500/40 px-3.5 py-2 rounded-lg font-bold text-xs transition"
              >
                <span>Acceder a CRM</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>
              © 2026 UNEXO · F.I.C.C.T. Universidad Autónoma Gabriel René Moreno.
            </div>
            <div className="font-mono text-cyan-400">
              Desarrollado por Grupo 5-SC · Tecnología Web INF513
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
