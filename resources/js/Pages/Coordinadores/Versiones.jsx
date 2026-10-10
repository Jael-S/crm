import React, { useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Shared/Card';
import Button from '@/Shared/Button';
import { ArrowLeft, Trash2, Plus, Mail, GraduationCap } from 'lucide-react';

export default function CoordinatorVersions({ coordinador, coordinadores = [], versionesAsignadas = [], catalogo = { programas: [] }, programas = [] }) {
  if (!coordinador && coordinadores.length) {
    return <ProgramAssignmentList coordinadores={coordinadores} programas={programas} />;
  }

  const form = useForm({
    id_usuario: coordinador.id_usuario,
    id_version_externa: '',
  });

  const versiones = useMemo(
    () => catalogo.programas.flatMap((programa) => (programa.versiones || []).map((version) => ({
      id: version.id,
      nombre: `${programa.nombre} - ${version.nombre}`,
    }))),
    [catalogo]
  );

  const assignedIds = new Set(versionesAsignadas.map((version) => String(version.id_version_externo)));

  const submit = (event) => {
    event.preventDefault();
    form.post(`/coordinadores/${coordinador.id_usuario}/versiones`, { preserveScroll: true, onSuccess: () => form.reset() });
  };

  const selectVersion = (event) => {
    form.setData({
      ...form.data,
      id_version_externa: event.target.value,
    });
  };

  return (
    <AppLayout>
      <Head title={`Versiones de ${coordinador.nombre_completo}`} />
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/usuarios" className="p-2 bg-white border rounded"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-heading)]">Versiones / Cohortes Asignadas</h1>
            <p className="text-sm text-[var(--text-muted)]">{coordinador.nombre_completo}</p>
          </div>
        </div>

        <Card>
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold uppercase mb-1">Versión / Cohorte</label>
              <select value={form.data.id_version_externa} onChange={selectVersion} className="w-full px-3 py-2 text-sm border rounded" required>
                <option value="">Selecciona una versión</option>
                {versiones.filter((version) => !assignedIds.has(String(version.id))).map((version) => (
                  <option key={version.id} value={version.id}>{version.nombre}</option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={form.processing}><Plus size={15} className="mr-1" /> Asignar</Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-sm font-bold uppercase mb-4">Asignaciones actuales</h2>
          {versionesAsignadas.length ? (
            <div className="space-y-2">
              {versionesAsignadas.map((version) => (
                <div key={version.id_version_externo} className="flex items-center justify-between p-3 bg-[var(--bg-body)] rounded">
                  <div>
                    <span className={`text-sm font-semibold ${version.disponible ? 'text-[var(--text-heading)]' : 'text-amber-700'}`}>
                      {version.nombre}
                    </span>
                    {!version.disponible && (
                      <p className="text-xs text-amber-700 mt-1">
                        Esta cohorte ya no está disponible en el catálogo externo.
                      </p>
                    )}
                  </div>
                  <Button
                    variant="danger"
                    className="py-1 px-2 text-xs"
                    onClick={() => form.delete(`/coordinadores/${coordinador.id_usuario}/versiones/${version.id_version_externo}`, { preserveScroll: true })}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-[var(--text-muted)]">No hay versiones asignadas.</p>}
        </Card>
      </div>
    </AppLayout>
  );
}

function ProgramAssignmentList({ coordinadores, programas }) {
  return (
    <AppLayout>
      <Head title="Asignación de Programas" />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-50 text-[var(--brand-primary)]">
            <GraduationCap size={24} />
          </div>
          <div>
          <h1 className="text-2xl font-bold text-[var(--text-heading)]">Asignación de Programas</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Asigna programas completos a coordinadores activos.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full bg-gray-100 p-4 sm:p-6 rounded-lg">
        {coordinadores.map((coordinador) => (
          <Card key={coordinador.id_usuario} className="bg-white shadow-sm rounded-lg min-w-0">
            <div className="flex flex-col justify-between gap-4 h-full min-w-0">
              <div>
                <h2 className="text-base font-bold text-gray-900 break-words">
                  {coordinador.nombre_completo}
                </h2>
                <p className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-2">
                  <Mail size={13} /> {coordinador.correo || 'Correo no especificado'}
                </p>
                <div className="mb-4 flex flex-wrap gap-1.5 mt-3">
                  {coordinador.programas.length ? coordinador.programas.map((programa) => (
                    <span key={programa.id_version_externa} className="px-2 py-1 text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-100 rounded-full">
                      {programa.nombre}
                    </span>
                  )) : (
                    <div className="w-full p-3 mt-1 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-500">
                      Sin programas asignados actualmente
                    </div>
                  )}
                </div>
              </div>
              <ProgramAssignmentForm coordinador={coordinador} programas={programas} />
            </div>
          </Card>
        ))}
        </div>
      </div>
    </AppLayout>
  );
}

function ProgramAssignmentForm({ coordinador, programas }) {
  const form = useForm({ id_programa_externo: '' });
  const assignedProgramIds = new Set(coordinador.programas.map((programa) => String(programa.id)));

  const submit = (event) => {
    event.preventDefault();
    form.post(`/coordinadores/${coordinador.id_usuario}/versiones`, {
      preserveScroll: true,
      onSuccess: () => form.reset(),
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 w-full">
      <select
        value={form.data.id_programa_externo}
        onChange={(event) => form.setData('id_programa_externo', event.target.value)}
        className="w-full sm:w-auto min-w-0 flex-1 px-3 py-2 text-sm border border-[var(--border-color-dark)] rounded-[var(--radius-sm)]"
        required
      >
        <option value="">Seleccionar programa</option>
        {programas.map((programa) => {
          const availableVersions = programa.versiones || [];

          if (!availableVersions.length) return null;

          return (
            <optgroup key={programa.id} label={programa.nombre}>
              {!assignedProgramIds.has(String(programa.id)) && (
                <option value={programa.id}>
                  {availableVersions.map((version) => (
                    `${version.nombre}${version.fecha_inicio ? ` / ${version.fecha_inicio}` : ''}`
                  )).join(' · ')}
                </option>
              )}
            </optgroup>
          );
        })}
      </select>
      <Button type="submit" disabled={form.processing} className="w-full sm:w-auto"><Plus size={15} className="mr-1" /> Asignar</Button>
    </form>
  );
}
