import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
  CheckCircle2,
  ArrowLeft,
  Send,
  MessageCircle,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function PublicRegistration({ programas = [], modulos = [], profesiones = [] }) {
  const { flash, errors } = usePage().props;
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const [tipoOferta, setTipoOferta] = useState('PROGRAMA');
  const ofertaActual = tipoOferta === 'PROGRAMA' ? programas : modulos;

  const [selectedItem, setSelectedItem] = useState(
    ofertaActual.length > 0 ? ofertaActual[0] : null
  );

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
    if (flash?.success) {
      setSubmittedSuccess(true);
      reset('nombre', 'telefono', 'correo', 'mensaje');
    }
  }, [flash]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/registro', {
      preserveScroll: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000d1e] via-[#001024] to-[#000d1e] text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500 selection:text-white">
      <Head title="Postulación en Línea · UNEXO FICCT UAGRM" />

      {/* Cabecera Superior */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-white/10">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-cyan-400 transition">
          <ArrowLeft size={16} />
          <span>Volver al Portal Principal</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="h-9 w-auto p-1 bg-white rounded-lg shadow-sm">
            <img src="/images/unexo4.jpeg" alt="UNEXO" className="h-full w-auto object-contain" />
          </div>
          <img src="/images/FICCT.png" alt="FICCT" className="h-8 w-auto object-contain" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-white hidden sm:inline">
            FICCT · UAGRM
          </span>
        </div>
      </div>

      {/* Tarjeta Formulario 3D */}
      <div className="max-w-2xl mx-auto w-full my-8">
        <div className="bg-[#001024] p-7 sm:p-10 rounded-3xl border-2 border-cyan-500/30 shadow-[0_25px_60px_-15px_rgba(0,18,36,0.95)] relative overflow-hidden backdrop-blur-md">
          {/* Cabecera con Logo Oficial UNEXO visible */}
          <div className="flex items-center gap-4 pb-6 mb-6 border-b border-white/10">
            <div className="h-14 w-auto p-1.5 bg-white rounded-xl shadow-md shrink-0 flex items-center justify-center">
              <img src="/images/unexo4.jpeg" alt="Logo UNEXO" className="h-full w-auto object-contain" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                Postulación a Formación
              </h1>
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

            {/* Mensaje */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Consulta o Comentario Adicional
              </label>
              <textarea
                rows={2}
                placeholder="Indícanos tus consultas sobre horarios, modalidades..."
                value={data.mensaje}
                onChange={(e) => setData('mensaje', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition shadow-inner resize-none"
              />
            </div>

            {/* Botón Sobrio Azul Marino */}
            <div className="pt-2">
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

      {/* Footer */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-500 pt-6 border-t border-white/10">
        © 2026 UNEXO · Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones (FICCT) UAGRM · Módulo 236
      </div>
    </div>
  );
}
