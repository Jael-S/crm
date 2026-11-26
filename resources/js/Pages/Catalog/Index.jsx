import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
  Layers,
  BookOpen,
  Bookmark,
  Globe,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function CatalogIndex({ catalogo }) {
  const [activeTab, setActiveTab] = useState('programas');
  const [expandedProgram, setExpandedProgram] = useState(null);

  const programas = catalogo?.programas || [];
  const modulosSueltos = catalogo?.modulos_sueltos || [];

  const formatPrice = (price) =>
    `Bs ${Number(price || 0).toLocaleString('es-BO', {
      minimumFractionDigits: 2,
    })}`;

  return (
    <AppLayout>
      <Head title="Catálogo Académico Oficial" />

      <div className="space-y-6">
        {/* Cabecera Uniforme */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <BookOpen className="text-blue-600" size={24} />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Catálogo Académico
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              {programas.length + modulosSueltos.length} ofertas
            </span>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>API Proyecto 2 Conectada</span>
          </div>
        </div>

        {/* Selector de Pestañas Limpio */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('programas')}
            className={`pb-3 px-5 text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'programas'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen size={16} />
            <span>Diplomados y Programas</span>
            <span className="ml-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
              {programas.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('modulos')}
            className={`pb-3 px-5 text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'modulos'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bookmark size={16} />
            <span>Módulos Independientes</span>
            <span className="ml-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
              {modulosSueltos.length}
            </span>
          </button>
        </div>

        {/* CONTENIDO DE PESTAÑAS */}
        {activeTab === 'programas' ? (
          <ProgramasTab
            programas={programas}
            expandedProgram={expandedProgram}
            setExpandedProgram={setExpandedProgram}
            formatPrice={formatPrice}
          />
        ) : (
          <ModulosTab modulos={modulosSueltos} formatPrice={formatPrice} />
        )}
      </div>
    </AppLayout>
  );
}

function ProgramasTab({ programas, expandedProgram, setExpandedProgram, formatPrice }) {
  if (programas.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-500">
        No se encontraron programas disponibles en convocatoria activa.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {programas.map((programa) => {
        const expanded = expandedProgram === programa.id;
        const tieneCohortesAbiertas = (programa.versiones || []).length > 0;

        return (
          <div
            key={programa.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition"
          >
            {/* Cabecera Estilo Grupo 6 */}
            <div className="h-20 bg-gradient-to-r from-[#071828] via-[#0a2540] to-blue-900 relative overflow-hidden flex items-end p-5">
              <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-300">
                PROGRAMA ACADÉMICO · {programa.codigo || 'PRG'}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-extrabold text-xl text-slate-900 leading-tight">
                    {programa.nombre}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {programa.descripcion || 'Sin descripción disponible'}
                  </p>
                </div>
              </div>

              {/* Estado de Convocatoria */}
              <div className="flex items-center gap-2">
                {tieneCohortesAbiertas ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Inscripciones Abiertas ({programa.versiones.length} cohorte activa)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                    <span>Sin convocatoria abierta</span>
                  </span>
                )}
              </div>

              {/* Datos de Resumen y Precio */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">
                  {programa.cantidad_modulos || programa.modulos?.length || 0} módulos incluidos
                </span>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Arancel oficial:</span>
                  <span className="text-xl font-extrabold text-blue-700">
                    {formatPrice(programa.precio_contado)}
                  </span>
                </div>
              </div>

              {/* Botón Acordeón de Módulos */}
              <button
                type="button"
                onClick={() => setExpandedProgram(expanded ? null : programa.id)}
                className="w-full pt-2 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-blue-600 transition cursor-pointer"
              >
                <span>{expanded ? 'Ocultar plan de estudios' : 'Ver plan de estudios y módulos'}</span>
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expanded && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {(programa.modulos || []).map((modulo, mIdx) => (
                    <div
                      key={modulo.id || mIdx}
                      className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs font-medium"
                    >
                      <span className="text-slate-800">{modulo.nombre}</span>
                      <span className="text-slate-500 inline-flex items-center gap-1">
                        <Clock size={12} /> {modulo.horas || 0} hrs
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ModulosTab({ modulos, formatPrice }) {
  if (modulos.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-500">
        No hay módulos independientes en convocatoria abierta actualmente.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modulos.map((modulo) => {
        const tieneGrupos = (modulo.grupos || []).length > 0;
        const primerGrupo = tieneGrupos ? modulo.grupos[0] : null;

        return (
          <div
            key={modulo.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            {/* Banner Geometrico / Gradiente estilo Grupo 6 */}
            <div className="h-20 bg-gradient-to-r from-[#071828] via-[#0a2540] to-blue-900 p-5 flex items-end">
              <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-300">
                MÓDULO · {modulo.codigo || 'MOD'} · {modulo.horas || 0} H
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h2 className="font-extrabold text-lg text-slate-900 leading-tight">
                  {modulo.nombre}
                </h2>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {modulo.descripcion || 'Módulo académico independiente de formación continua.'}
                </p>

                {/* Estado de Inscripciones */}
                <div>
                  {tieneGrupos ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Inscripciones abiertas</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      <span>Sin convocatoria abierta</span>
                    </span>
                  )}
                </div>

                {/* Requisitos y Fechas */}
                {primerGrupo && (
                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    {primerGrupo.fecha_inicio && (
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Calendar size={13} className="text-blue-600" />
                        <span>Inicio: {primerGrupo.fecha_inicio}</span>
                      </div>
                    )}
                    {primerGrupo.horarios && primerGrupo.horarios.length > 0 && (
                      <p className="text-[11px] text-slate-500">
                        {primerGrupo.horarios.map(h => `${h.dia || ''} ${h.hora_inicio || ''}-${h.hora_fin || ''}`).join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Pie con Precio */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Arancel:</span>
                <span className="text-lg font-extrabold text-blue-700">
                  {formatPrice(modulo.precio)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
