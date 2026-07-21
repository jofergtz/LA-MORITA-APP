import React, { useState } from 'react';
import { ShieldAlert, Key, ArrowLeft, Eye, EyeOff, User as UserIcon, X, Megaphone } from 'lucide-react';

interface AdminLoginGateProps {
  onVerify: (username: string, passcode: string) => boolean;
  onCancel: () => void;
  isModal?: boolean;
  title?: string;
  description?: string;
  buttonText?: string;
  icon?: React.ReactNode;
}

export default function AdminLoginGate({
  onVerify,
  onCancel,
  isModal = false,
  title = "Ingreso a Modo Administración",
  description = "Ingresá tus credenciales de moderador para administrar la comunidad de **La Morita**.",
  buttonText = "Ingresar a Administración",
  icon
}: AdminLoginGateProps) {
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !passcode.trim()) {
      setError('Por favor, ingresá el usuario y la contraseña.');
      return;
    }

    const success = onVerify(username.trim(), passcode.trim());
    if (success) {
      setError('');
    } else {
      setError('⚠️ Usuario o contraseña incorrectos. Verificá las credenciales de acceso.');
    }
  };

  const defaultIcon = icon || <ShieldAlert className="h-9 w-9 animate-pulse" />;

  return (
    <div className={isModal ? "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in" : "max-w-md mx-auto my-8"}>
      <div className="bg-white border border-morita-sand rounded-3xl p-6 sm:p-8 shadow-xl max-w-md w-full relative animate-fade-in">
        
        {isModal && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-full text-morita-charcoal/50 hover:text-morita-charcoal hover:bg-morita-sand/50 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-morita-terracotta/10 text-morita-terracotta p-3.5 rounded-full mb-3 shadow-xs flex items-center justify-center">
            {defaultIcon}
          </div>
          <h2 className="text-xl font-serif font-bold text-morita-charcoal tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-morita-charcoal/60 mt-1.5 leading-relaxed">
            {description.replace(/\*\*(.*?)\*\*/g, '$1')}
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold p-3.5 rounded-xl leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username input */}
          <div>
            <label className="block text-[11px] font-bold text-morita-charcoal/70 uppercase tracking-wider mb-1">
              Usuario
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-morita-charcoal/40" />
              <input
                type="text"
                placeholder="Usuario de acceso"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-sm rounded-xl border border-morita-sand pl-9 pr-3 py-2.5 bg-white focus:ring-2 focus:ring-morita-mulberry/40 focus:outline-hidden"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label className="block text-[11px] font-bold text-morita-charcoal/70 uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-morita-charcoal/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full text-sm rounded-xl border border-morita-sand pl-9 pr-10 py-2.5 bg-white focus:ring-2 focus:ring-morita-mulberry/40 focus:outline-hidden"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-morita-charcoal/40 hover:text-morita-mulberry cursor-pointer p-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-morita-mulberry hover:bg-morita-mulberry-dark text-white font-bold text-xs py-3 rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-2"
          >
            {icon || <ShieldAlert className="h-4 w-4" />}
            <span>{buttonText}</span>
          </button>
        </form>

        {/* Cancel button */}
        <div className="mt-6 text-center">
          <button
            onClick={onCancel}
            className="text-xs text-morita-charcoal/60 hover:text-morita-mulberry font-bold inline-flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Cancelar y Volver
          </button>
        </div>

      </div>
    </div>
  );
}
