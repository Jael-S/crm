import React, { useState } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';
import Button from '@/Shared/Button';

export default function ResetPassword({ id, correo, nombre }) {
  const [showPassword, setShowPassword] = useState(false);
  const { data, setData, post, processing, errors } = useForm({
    password: '',
    password_confirmation: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Conserva la firma de la URL al hacer el post
    post(window.location.href);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-body)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head title="Nueva Contraseña - UNEXO CRM" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
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
          Establecer Nueva Contraseña
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500 max-w-sm mx-auto">
          Ingresa y confirma tu nueva credencial de acceso para la cuenta de <strong>{correo}</strong>.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-200 sm:rounded-2xl sm:px-10 space-y-6">

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-600 shrink-0" />
            <span>Usuario autenticado por firma segura: <strong>{nombre}</strong></span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nueva Contraseña */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nueva Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-600 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Confirmar Nueva Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  placeholder="Repite tu nueva contraseña"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={processing}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm mt-2"
            >
              {processing ? 'Actualizando contraseña...' : 'Guardar Nueva Contraseña'}
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 font-semibold transition"
            >
              <ArrowLeft size={13} />
              <span>Cancelar y volver al Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
