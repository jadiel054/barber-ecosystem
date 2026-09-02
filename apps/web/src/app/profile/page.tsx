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

  // LGPD States
  const [exportLoading, setExportLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteErr, setDeleteErr] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleExportData = async () => {
    setExportLoading(true);
    const res = await apiFetch<any>('/users/me/export');
    setExportLoading(false);

    if (res.success && res.data) {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `meus-dados-barber-ecosystem-${user?.id || 'export'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      alert(res.error || 'Erro ao baixar dados');
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteErr('');
    setDeleteLoading(true);

    const res = await apiFetch<any>('/users/me', {
      method: 'DELETE',
      body: JSON.stringify({ password: deletePassword }),
    });

    setDeleteLoading(false);

    if (res.success) {
      localStorage.clear();
      document.cookie = 'barber_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      alert('Sua conta e dados pessoais foram excluídos com sucesso.');
      router.push('/login');
    } else {
      setDeleteErr(res.error || 'Erro ao excluir conta. Verifique sua senha.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 my-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-500">Meu Perfil</h1>
          <p className="text-slate-400 text-sm">
            Gerencie suas informações pessoais, credenciais de acesso e privacidade (LGPD)
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
            className="bg-amber-600 hover:bg-[#e67700] hover:scale-[1.02] active:scale-[0.98] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200 disabled:opacity-50"
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
            className="bg-amber-600 hover:bg-[#e67700] hover:scale-[1.02] active:scale-[0.98] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200 disabled:opacity-50"
          >
            {passwordLoading ? 'Alterando...' : 'Atualizar Senha'}
          </button>
        </form>
      </div>

      {/* Seção LGPD: Privacidade e Controle de Dados */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          🛡️ Privacidade e Seus Dados (LGPD)
        </h2>
        <p className="text-xs text-slate-400">
          Você tem total controle sobre suas informações. Baixe uma cópia dos seus dados cadastrados ou solicite a exclusão da sua conta.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={handleExportData}
            disabled={exportLoading}
            className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-medium px-4 py-2 rounded-lg text-sm transition duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            📥 {exportLoading ? 'Gerando arquivo...' : 'Baixar Meus Dados'}
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 font-medium px-4 py-2 rounded-lg text-sm transition duration-200 flex items-center gap-2"
          >
            🗑️ Excluir Minha Conta
          </button>
        </div>
      </div>

      {/* Modal de Confirmação para Excluir Conta */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-red-400">⚠️ Confirmar Exclusão de Conta</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Esta ação é <strong>irreversível</strong>. Todos os seus dados pessoais, agendamentos e preferências serão permanentemente excluídos do sistema.
            </p>

            {deleteErr && (
              <div className="p-3 bg-red-500/10 border border-red-500 text-red-400 rounded-lg text-xs">
                {deleteErr}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Digite sua senha para confirmar:
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeleteErr('');
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading || !deletePassword}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  {deleteLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
