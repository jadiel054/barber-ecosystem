'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [orgName, setOrgName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Cadastro de Barbearia: ${orgName}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-slate-800 p-8 shadow-2xl border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Cadastrar Barbearia</h2>
        <p className="text-sm text-slate-400 mb-6 text-center">Crie a estrutura multi-tenant para seu negócio</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nome da Barbearia</label>
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-slate-100 focus:border-sky-500 focus:outline-none"
              placeholder="Ex: Barbearia Estilo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Seu Nome</label>
            <input
              type="text"
              required
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-slate-100 focus:border-sky-500 focus:outline-none"
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">E-mail Comercial</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2.5 text-slate-100 focus:border-sky-500 focus:outline-none"
              placeholder="contato@barbearia.com"
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
            Criar Minha Barbearia
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Já possui conta?{' '}
          <Link href="/login" className="text-sky-400 hover:underline">
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
}
