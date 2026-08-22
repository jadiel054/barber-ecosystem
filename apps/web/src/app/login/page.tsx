'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Tentativa de Login para: ${email}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-slate-800 p-8 shadow-2xl border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Acessar Conta</h2>
        <p className="text-sm text-slate-400 mb-6 text-center">Entre com suas credenciais para gerenciar sua barbearia</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-slate-100 focus:border-sky-500 focus:outline-none"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-slate-100 focus:border-sky-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-sky-500 py-3 text-sm font-semibold text-white shadow-md hover:bg-sky-400 transition"
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Não tem uma conta?{' '}
          <Link href="/register" className="text-sky-400 hover:underline">
            Cadastre sua barbearia
          </Link>
        </div>
      </div>
    </div>
  );
}
