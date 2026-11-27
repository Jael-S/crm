import React from 'react';
import { useForm, Head, Link, usePage } from '@inertiajs/react';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '@/Shared/Button';

export default function ForgotPassword() {
  const { flash } = usePage().props;
  const { data, setData, post, processing, errors } = useForm({
    correo: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/recuperar-password');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-body)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head title="Recuperar Contraseña - UNEXO CRM" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo Oficial UNEXO */}
        <div className="flex justify-center items-center gap-3">
          <img
            src="/images/unexo3.png"
            alt="Logo UNEXO"
            className="h-12 w-auto object-contain drop-shadow-sm"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-wider text-slate-900 leading-none">
              UNEXO
            </span>
            <span className="text-[11px] font-bold text-cyan-600 uppercase tracking-widest mt-0.5">
              CRM Comercial
            </span>
          </div>
        </div>

        <h2 className="mt-6 text-center text-xl font-extrabold text-slate-900">
          ¿Olvidaste tu contraseña?
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500 max-w-sm mx-auto">
          Ingresa tu correo institucional registrado para enviarte un enlace de recuperación temporal.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-200 sm:rounded-2xl sm:px-10 space-y-6">
          
          {/* Mensaje de Éxito */}
          {flash?.success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>{flash.success}</span>
            </div>
          )}

          {/* Mensaje de Error General */}
          {errors.correo && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{errors.correo}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={data.correo}
                  onChange={(e) => setData('correo', e.target.value)}
                  placeholder="ejemplo@unexo.edu.bo"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={processing}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
            >
              {processing ? 'Enviando correo...' : 'Enviar Enlace de Recuperación'}
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 font-semibold transition"
            >
              <ArrowLeft size={13} />
              <span>Volver a Iniciar Sesión</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
