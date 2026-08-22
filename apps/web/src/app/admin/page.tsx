'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface Barbershop {
  id: string;
  name: string;
  slug: string;
  phone?: string | null;
  address?: string | null;
  logoUrl?: string | null;
}

export default function AdminPage() {
  const router = useRouter();
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('barber_user');
    const token = localStorage.getItem('barber_token');

    if (!token || !savedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.role !== 'SUPER_ADMIN') {
        router.push('/dashboard');
        return;
      }
      setUser(parsedUser);

      const fetchBarbershops = async () => {
        const res = await apiFetch<Barbershop[]>('/barbershops', {}, token);
        if (res.success && res.data) {
          setBarbershops(res.data);
        } else {
          setError(res.error || 'Erro ao carregar lista de barbearias');
        }
        setLoading(false);
      };

      fetchBarbershops();
    } catch {
      router.push('/dashboard');
    }
  }, [router]);

  if (loading) {
    return <div className="py-12 text-center text-slate-400">Carregando painel admin...</div>;
  }

  return (
    <div className="space-y-8 my-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-500">Painel do Administrador Geral</h1>
          <p className="text-slate-400 text-sm">
            Bem-vindo, <strong>{user?.name}</strong> (SUPER_ADMIN)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-amber-400 font-medium"
          >
            Ir ao Dashboard
          </Link>
          <button
            onClick={() => {
              localStorage.clear();
              document.cookie = 'barber_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
              router.push('/login');
            }}
            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-slate-300"
          >
            Sair
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Barbearias Cadastradas</h2>
          <span className="text-xs text-slate-400">{barbershops.length} no total</span>
        </div>

        {barbershops.length === 0 ? (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-center">
            Nenhuma barbearia cadastrada no momento.
          </div>
        ) : (
          <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl shadow-xl">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase text-amber-500 border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-3 font-semibold">Nome</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Slug</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Telefone</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Endereço</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {barbershops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{shop.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-amber-400">{shop.slug}</td>
                    <td className="px-6 py-4">{shop.phone || '-'}</td>
                    <td className="px-6 py-4">{shop.address || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
