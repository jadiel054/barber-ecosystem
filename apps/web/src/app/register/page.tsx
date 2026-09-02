'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CLIENT');

  // Consent Checkboxes
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [allowMarketing, setAllowMarketing] = useState(false);
  const [allowCookies, setAllowCookies] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('Você deve concordar com os Termos de Uso e Política de Privacidade para realizar o cadastro.');
      return;
    }

    setLoading(true);

    const res = await apiFetch<{ user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
        role,
        agreeTerms,
        allowMarketing,
        allowCookies,
      }),
    });

    setLoading(false);

    if (res.success && res.data) {
      localStorage.setItem('barber_user', JSON.stringify(res.data.user));
      if (res.data.user?.role === 'SUPER_ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(res.error || 'Falha ao realizar cadastro');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold text-center text-amber-500 mb-6">Criar Nova Conta</h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Nome Completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Telefone / WhatsApp</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Perfil de Acesso</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="CLIENT">Cliente (Realizar agendamentos)</option>
            <option value="ADMIN">Dono de Barbearia (Gerenciar estabelecimento)</option>
            <option value="BARBER">Barbeiro / Profissional</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            placeholder="••••••••"
          />
        </div>

        {/* Termos e Consentimentos LGPD */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          {/* Checkbox Obrigatório */}
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
              className="mt-0.5 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
            />
            <span>
              <strong className="text-amber-400 font-semibold">[OBRIGATÓRIO]</strong> Li e concordo com os{' '}
              <Link href="/termos" target="_blank" className="text-amber-500 underline hover:text-amber-400">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link href="/privacidade" target="_blank" className="text-amber-500 underline hover:text-amber-400">
                Política de Privacidade
              </Link>
              .
            </span>
          </label>

          {/* Checkbox Opcional - Comunicações */}
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={allowMarketing}
              onChange={(e) => setAllowMarketing(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
            />
            <span>Consinto em receber comunicações, novidades e ofertas por e-mail ou WhatsApp (Opcional).</span>
          </label>

          {/* Checkbox Opcional - Cookies */}
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={allowCookies}
              onChange={(e) => setAllowCookies(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
            />
            <span>Consinto com o uso de cookies não essenciais para personalização de navegação (Opcional).</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !agreeTerms}
          className="w-full bg-amber-600 hover:bg-[#e67700] hover:scale-[1.02] active:scale-[0.98] text-white font-semibold py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          {loading ? 'Cadastrando...' : 'Criar Conta'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-400 mt-4">
        Já possui uma conta?{' '}
        <a href="/login" className="text-amber-500 hover:underline font-medium">
          Entrar
        </a>
      </p>
    </div>
  );
}
