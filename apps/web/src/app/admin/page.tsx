'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface BarbershopUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Barbershop {
  id: string;
  name: string;
  slug: string;
  phone?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  active?: boolean;
  users?: BarbershopUser[];
}

export default function AdminPage() {
  const router = useRouter();
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [tempPasswordModal, setTempPasswordModal] = useState<{ show: boolean; password?: string; ownerName?: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('barber_user');

    if (!savedUser) {
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
        const res = await apiFetch<Barbershop[]>('/barbershops');
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

  const handleToggleStatus = async (barbershop: Barbershop) => {
    setActionMsg('');
    setError('');
    const newStatus = !barbershop.active;

    const res = await apiFetch<Barbershop>(`/admin/barbershops/${barbershop.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ active: newStatus }),
    });

    if (res.success && res.data) {
      setBarbershops((prev) =>
        prev.map((shop) => (shop.id === barbershop.id ? { ...shop, active: res.data!.active } : shop))
      );
      setActionMsg(`Barbearia "${barbershop.name}" ${newStatus ? 'ativada' : 'desativada'} com sucesso.`);
    } else {
      setError(res.error || 'Erro ao alterar status da barbearia');
    }
  };

  const handleResetOwnerPassword = async (barbershop: Barbershop) => {
    setActionMsg('');
    setError('');

    // Find ADMIN user for this barbershop
    const owner = barbershop.users?.find((u) => u.role === 'ADMIN') || barbershop.users?.[0];

    if (!owner) {
      setError(`Nenhum usuário dono/administrador encontrado para a barbearia ${barbershop.name}`);
      return;
    }

    const res = await apiFetch<{ tempPassword: string; user: any }>(`/admin/users/${owner.id}/reset-password`, {
      method: 'POST',
    });

    if (res.success && res.data) {
      setTempPasswordModal({
        show: true,
        password: res.data.tempPassword,
        ownerName: owner.name || owner.email,
      });
    } else {
      setError(res.error || 'Erro ao resetar senha do dono');
    }
  };

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
            href="/profile"
            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-slate-300 font-medium"
          >
            Meu Perfil
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

      {actionMsg && (
        <div className="p-3 bg-green-500/10 border border-green-500 text-green-400 rounded-lg text-sm">
          {actionMsg}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Temp Password Modal / Alert */}
      {tempPasswordModal?.show && (
        <div className="p-4 bg-amber-500/20 border border-amber-500 text-amber-300 rounded-xl space-y-2 text-sm">
          <h3 className="font-bold text-base text-amber-400">Senha Temporária Gerada!</h3>
          <p>
            Dono/Usuário: <strong>{tempPasswordModal.ownerName}</strong>
          </p>
          <p className="text-lg font-mono font-bold bg-slate-900 px-3 py-1.5 rounded text-white inline-block">
            {tempPasswordModal.password}
          </p>
          <p className="text-xs text-slate-400">
            Passe essa senha temporária para o proprietário da barbearia.
          </p>
          <button
            onClick={() => setTempPasswordModal(null)}
            className="text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1 rounded mt-2 block"
          >
            Fechar Aviso
          </button>
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
                  <th scope="col" className="px-6 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Telefone</th>
                  <th scope="col" className="px-6 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {barbershops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{shop.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-amber-400">{shop.slug}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                          shop.active !== false
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {shop.active !== false ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{shop.phone || '-'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(shop)}
                        className={`text-xs px-2.5 py-1 rounded font-medium ${
                          shop.active !== false
                            ? 'bg-red-900/40 hover:bg-red-800/60 text-red-300'
                            : 'bg-green-900/40 hover:bg-green-800/60 text-green-300'
                        }`}
                      >
                        {shop.active !== false ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => handleResetOwnerPassword(shop)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 font-medium px-2.5 py-1 rounded"
                      >
                        Resetar senha do dono
                      </button>
                    </td>
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
