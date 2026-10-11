import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Shared/Card';
import Badge from '@/Shared/Badge';
import {
    Layers,
    BookOpen,
    Bookmark,
    Globe,
    ChevronDown,
    ChevronUp,
    Clock,
    DollarSign,
    LoaderCircle,
} from 'lucide-react';

export default function CatalogIndex({ catalogo }) {
    const [activeTab, setActiveTab] = useState('programas');
    const [expandedProgram, setExpandedProgram] = useState(null);
    const isLoading = catalogo === undefined || catalogo === null;
    const programas = catalogo?.programas || [];
    const modulosSueltos = catalogo?.modulos_sueltos || [];
    const formatPrice = (price) => `Bs ${Number(price || 0).toLocaleString('es-BO', {
        minimumFractionDigits: 2,
    })}`;

    return (
        <AppLayout>
            <Head title="Catálogo Externo" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-heading)] flex items-center gap-2">
                            <Layers className="text-[var(--brand-primary)]" size={28} />
                            <span>Catálogo Académico Externo</span>
                        </h1>
                        <p className="text-sm text-[var(--text-muted)] mt-1">
                            Sincronización en tiempo real de programas, versiones y módulos del Proyecto 2.
                        </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-[var(--radius-sm)]">
                        <Globe size={15} />
                        API Externa Conectada
                    </span>
                </div>

                {isLoading ? (
                    <Card className="py-16">
                        <div className="flex flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
                            <LoaderCircle size={30} className="animate-spin text-[var(--brand-primary)]" />
                            <span className="text-sm font-medium">Cargando catálogo externo...</span>
                        </div>
                    </Card>
                ) : (
                    <>
                        <div className="flex gap-2 border-b border-[var(--border-color-light)]">
                            <TabButton
                                active={activeTab === 'programas'}
                                onClick={() => setActiveTab('programas')}
                                icon={<BookOpen size={16} />}
                            >
                                Programas
                                <Badge variant="info">{programas.length}</Badge>
                            </TabButton>
                            <TabButton
                                active={activeTab === 'modulos'}
                                onClick={() => setActiveTab('modulos')}
                                icon={<Bookmark size={16} />}
                            >
                                Módulos Independientes
                                <Badge variant="success">{modulosSueltos.length}</Badge>
                            </TabButton>
                        </div>

                        {activeTab === 'programas' ? (
                            <ProgramasTab
                                programas={programas}
                                expandedProgram={expandedProgram}
                                setExpandedProgram={setExpandedProgram}
                                formatPrice={formatPrice}
                            />
                        ) : (
                            <ModulosTab modulos={modulosSueltos} />
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}

function TabButton({ active, onClick, icon, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
                active
                    ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
        >
            {icon}
            {children}
        </button>
    );
}

function ProgramasTab({ programas, expandedProgram, setExpandedProgram, formatPrice }) {
    if (programas.length === 0) {
        return <EmptyState message="No se encontraron programas disponibles o la API externa no responde." />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {programas.map((programa) => {
                const expanded = expandedProgram === programa.id;

                return (
                    <div key={programa.id} className="overflow-hidden rounded-xl border border-[var(--border-color-light)] bg-white shadow-sm">
                        <button
                            type="button"
                            onClick={() => setExpandedProgram(expanded ? null : programa.id)}
                            className="w-full text-left"
                        >
                            <div className="h-16 bg-gradient-to-r from-[var(--brand-primary)] to-cyan-600 relative overflow-hidden">
                                <div
                                    className="absolute inset-0 opacity-20"
                                    style={{
                                        backgroundImage: 'radial-gradient(circle at 20% 20%, white 2px, transparent 2px)',
                                        backgroundSize: '18px 18px',
                                    }}
                                />
                            </div>
                            <div className="p-5 -mt-5 relative">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="font-bold text-lg text-[var(--text-heading)]">{programa.nombre}</h2>
                                        <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-2">
                                            {programa.descripcion || 'Sin descripción disponible'}
                                        </p>
                                    </div>
                                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                                <div className="flex items-center gap-4 mt-4 text-xs font-semibold">
                                    <span>{programa.cantidad_modulos || programa.modulos?.length || 0} módulos</span>
                                    <span className="text-emerald-700">{formatPrice(programa.precio_contado)}</span>
                                </div>
                            </div>
                        </button>
                        {expanded && (
                            <div className="px-5 pb-5 border-t border-[var(--border-color-light)] pt-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider mb-3">Módulos asociados</h3>
                                <div className="space-y-2">
                                    {(programa.modulos || []).map((modulo) => (
                                        <div key={modulo.id} className="flex items-center justify-between p-3 bg-[var(--bg-body)] rounded-lg text-sm">
                                            <span className="font-medium">{modulo.nombre}</span>
                                            <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                                <Clock size={13} /> {modulo.horas || 0} h
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function ModulosTab({ modulos }) {
    if (modulos.length === 0) {
        return <EmptyState message="No hay módulos independientes registrados." />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modulos.map((modulo) => (
                <Card key={modulo.id} className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="font-medium text-[var(--text-heading)] text-sm">{modulo.nombre}</h2>
                        <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                            {modulo.descripcion || 'Módulo académico independiente'}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                            {modulo.horas && <span className="inline-flex items-center gap-1"><Clock size={13} /> {modulo.horas} h</span>}
                            {modulo.precio !== undefined && (
                                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                                    Bs {Number(modulo.precio).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                </span>
                            )}
                        </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold bg-cyan-50 text-cyan-800 rounded">
                        Módulo
                    </span>
                </Card>
            ))}
        </div>
    );
}

function EmptyState({ message }) {
    return <div className="text-center py-12 text-sm text-[var(--text-muted)]">{message}</div>;
}
