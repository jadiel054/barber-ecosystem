'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('barber_user');
    if (!savedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setName(parsedUser.name || '');
      setPhone(parsedUser.phone || '');

      // Also fetch latest profile data from /auth/me or /users/me
      apiFetch<any>('/auth/me').then((res) => {
        if (res.success && res.data) {
          setUser(res.data);
          setName(res.data.name || '');
          setPhone(res.data.phone || '');
          localStorage.setItem('barber_user', JSON.stringify(res.data));
        }
      });
    } catch {
      router.push('/login');
    }
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    setProfileLoading(true);

    const res = await apiFetch<any>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ name, phone }),
    });

    setProfileLoading(false);

    if (res.success && res.data) {
      const updatedUser = { ...user, ...res.data };
      setUser(updatedUser);
      localStorage.setItem('barber_user', JSON.stringify(updatedUser));
      setProfileMsg('Perfil atualizado com sucesso!');
    } else {
      setProfileErr(res.error || 'Erro ao atualizar perfil');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');
    setPasswordLoading(true);

    const res = await apiFetch<any>('/users/me/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    setPasswordLoading(false);

    if (res.success) {
      setPasswordMsg('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
    } else {
      setPasswordErr(res.error || 'Erro ao alterar senha');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 my-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-500">Meu Perfil</h1>
          <p className="text-slate-400 text-sm">
            Gerencie suas informações pessoais e credenciais de acesso
          </p>
        </div>
        <Link
          href={user?.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard'}
          className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-slate-300 font-medium"
        >
          Voltar ao Painel
        </Link>
      </div>

      {/* Form 1: Editar Perfil */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white">Dados Pessoais</h2>

        {profileMsg && (
          <div className="p-3 bg-green-500/10 border border-green-500 text-green-400 rounded-lg text-sm">
            {profileMsg}
          </div>
        )}
        {profileErr && (
          <div className="p-3 bg-red-500/10 border border-red-500 text-red-400 rounded-lg text-sm">
            {profileErr}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">E-mail (não alterável)</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
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

          <button
            type="submit"
            disabled={profileLoading}
            className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition duration-200 disabled:opacity-50"
          >
            {profileLoading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>

      {/* Form 2: Trocar Senha */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white">Alterar Senha</h2>

        {passwordMsg && (
          <div className="p-3 bg-green-500/10 border border-green-500 text-green-400 rounded-lg text-sm">
            {passwordMsg}
          </div>
        )}
        {passwordErr && (
          <div className="p-3 bg-red-500/10 border border-red-500 text-red-400 rounded-lg text-sm">
            {passwordErr}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Senha Atual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nova Senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition duration-200 disabled:opacity-50"
          >
            {passwordLoading ? 'Alterando...' : 'Atualizar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
