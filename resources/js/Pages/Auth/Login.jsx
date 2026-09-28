import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { GraduationCap, Lock, Mail, Eye, EyeOff, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';
import Button from '@/Shared/Button';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    correo: '',
    password: '',
    remember: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/login');
  };

  const fillQuickRole = (email, pass) => {
    setData({
      ...data,
      correo: email,
      password: pass,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-body)] flex flex-col justify-center items-center p-4">
      <Head title="Iniciar Sesión" />

      {/* Tarjeta de Login */}
      <div className="w-full max-w-md bg-white rounded-[var(--radius-lg)] shadow-md border border-[var(--border-color-light)] overflow-hidden">
        {/* Cabecera Corporativa con Rojo Institucional */}
        <div className="bg-[var(--brand-secondary)] p-6 text-white text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">CRM Educativo</h1>
          <p className="text-sm text-white/80 mt-1">Facultad de Ingeniería (FICCT - UAGRM)</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div className="text-center mb-2">
            <h2 className="text-lg font-bold text-[var(--text-heading)]">Ingreso al Sistema</h2>
            <p className="text-xs text-[var(--text-muted)]">Control de prospectos y trazabilidad académica</p>
          </div>

          {/* Campo Correo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-heading)] mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-secondary)]">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={data.correo}
                onChange={(e) => setData('correo', e.target.value)}
                placeholder="ejemplo@crm.bo"
                required
                className={`w-full pl-10 pr-3 py-2 text-sm bg-[var(--bg-surface)] border rounded-[var(--radius-sm)] focus:outline-none transition-all ${
                  errors.correo ? 'border-[var(--color-danger)]' : 'border-[var(--border-color-dark)] focus:border-[#7aa5ff] focus:ring-2 focus:ring-[#0051f9]/25'
                }`}
                style={{ minHeight: '40px' }}
              />
            </div>
            {errors.correo && (
              <p className="text-xs text-[var(--color-danger)] mt-1.5 font-medium">{errors.correo}</p>
            )}
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-heading)] mb-1">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-secondary)]">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full pl-10 pr-10 py-2 text-sm bg-[var(--bg-surface)] border rounded-[var(--radius-sm)] focus:outline-none transition-all ${
                  errors.password ? 'border-[var(--color-danger)]' : 'border-[var(--border-color-dark)] focus:border-[#7aa5ff] focus:ring-2 focus:ring-[#0051f9]/25'
                }`}
                style={{ minHeight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-secondary)] hover:text-[var(--text-heading)]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[var(--color-danger)] mt-1.5 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Recordarme */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-xs text-[var(--text-muted)] cursor-pointer">
              <input
                type="checkbox"
                checked={data.remember}
                onChange={(e) => setData('remember', e.target.checked)}
                className="rounded border-[var(--border-color-dark)] text-[var(--color-primary)] focus:ring-[#0051f9]/25"
              />
              <span>Recordar sesión</span>
            </label>
          </div>

          {/* Botón Submit */}
          <Button
            type="submit"
            disabled={processing}
            className="w-full text-base"
          >
            {processing ? 'Iniciando sesión...' : 'Entrar al CRM'}
          </Button>
        </form>

        {/* Acceso Rápido para Defensa / Pruebas */}
        <div className="bg-[var(--bg-sidebar)] p-4 border-t border-[var(--border-color-light)]">
          <p className="text-xs font-bold text-center text-[var(--text-muted)] uppercase tracking-wider mb-2.5">
            Cuentas Demo para Defensa
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillQuickRole('admin@crm.bo', 'password123')}
              className="px-2 py-1.5 bg-white border border-[var(--border-color-light)] hover:border-[var(--brand-primary)] rounded text-xs font-semibold text-[var(--text-heading)] flex flex-col items-center justify-center gap-1 hover:bg-blue-50/50 transition cursor-pointer"
            >
              <ShieldCheck size={16} className="text-[var(--brand-primary)]" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => fillQuickRole('coordinador@crm.bo', 'password123')}
              className="px-2 py-1.5 bg-white border border-[var(--border-color-light)] hover:border-purple-600 rounded text-xs font-semibold text-[var(--text-heading)] flex flex-col items-center justify-center gap-1 hover:bg-purple-50/50 transition cursor-pointer"
            >
              <UserCheck size={16} className="text-purple-600" />
              <span>Coord</span>
            </button>
            <button
              type="button"
              onClick={() => fillQuickRole('vendedor1@crm.bo', 'password123')}
              className="px-2 py-1.5 bg-white border border-[var(--border-color-light)] hover:border-emerald-600 rounded text-xs font-semibold text-[var(--text-heading)] flex flex-col items-center justify-center gap-1 hover:bg-emerald-50/50 transition cursor-pointer"
            >
              <Briefcase size={16} className="text-emerald-600" />
              <span>Vendedor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
