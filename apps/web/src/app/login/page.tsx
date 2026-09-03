'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Recovery modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryMsg, setRecoveryMsg] = useState('');
  const [recoveryErr, setRecoveryErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setError('Por favor, preencha seu e-mail e senha.');
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch<{ token?: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.data) {
        setSuccessMsg('✅ Sucesso! Entrando no sistema...');

        if (res.data.token) {
          localStorage.setItem('barber_token', res.data.token);
          document.cookie = `barber_token=${res.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=None; Secure`;
        }

        if (res.data.user) {
          localStorage.setItem('barber_user', JSON.stringify(res.data.user));
        }

        const userRole = res.data.user?.role;
        const targetRoute = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' ? '/admin' : '/dashboard';

        setTimeout(() => {
          router.push(targetRoute);
        }, 500);
      } else {
        setLoading(false);
        setError(res.error || 'Falha ao conectar, verifique suas credenciais');
      }
    } catch (err: any) {
      setLoading(false);
      setError('Falha de conexão com o servidor. Tente novamente.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryMsg('');
    setRecoveryErr('');

    if (!recoveryEmail.trim()) {
      setRecoveryErr('Por favor, informe seu e-mail cadastrado.');
      return;
    }

    setRecoveryLoading(true);

    const res = await apiFetch<{ message?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: recoveryEmail }),
    });

    setRecoveryLoading(false);

    if (res.success && res.data) {
      setRecoveryMsg(res.data.message || 'Instruções e nova senha temporária geradas com sucesso!');
    } else if (res.success) {
      setRecoveryMsg('Instruções e nova senha temporária geradas com sucesso!');
    } else {
      setRecoveryErr(res.error || 'Não foi possível encontrar uma conta com este e-mail.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-xl space-y-6">
      <h2 className="text-2xl font-bold text-center text-amber-500">Acessar Conta</h2>

      {successMsg && (
        <div className="bg-green-500/10 border border-green-500 text-green-400 p-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm font-semibold text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-slate-300">Senha</label>
            <button
              type="button"
              onClick={() => {
                setRecoveryEmail(email);
                setRecoveryMsg('');
                setRecoveryErr('');
                setShowForgotModal(true);
              }}
              className="text-xs text-amber-500 hover:underline font-medium"
            >
              Esqueceu a senha?
            </button>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2.5 rounded-lg transition duration-200 disabled:opacity-50 text-sm"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-400">
        Não tem uma conta?{' '}
        <a href="/register" className="text-amber-500 hover:underline font-medium">
          Cadastre-se
        </a>
      </p>

      {/* Modal de Recuperação de Senha */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
            <h3 className="text-lg font-bold text-amber-500">🔑 Recuperar Senha</h3>
            <p className="text-slate-300 leading-relaxed">
              Digite seu e-mail cadastrado. Enviaremos instruções para redefinir sua senha.
            </p>

            {recoveryMsg && (
              <div className="p-3 bg-green-500/10 border border-green-500 text-green-400 rounded-lg text-xs font-medium space-y-1">
                {recoveryMsg}
              </div>
            )}

            {recoveryErr && (
              <div className="p-3 bg-red-500/10 border border-red-500 text-red-400 rounded-lg text-xs font-medium">
                {recoveryErr}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">E-mail Cadastrado</label>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-xs"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={recoveryLoading}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-1.5 rounded text-xs disabled:opacity-50"
                >
                  {recoveryLoading ? 'Enviando...' : 'Enviar Instruções'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
