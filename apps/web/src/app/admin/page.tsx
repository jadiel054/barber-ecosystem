'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'barbershops' | 'contacts' | 'announcements' | 'features' | 'settings'>('barbershops');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [error, setError] = useState('');

  // 1. BARBEARIAS STATE
  const [barbershops, setBarbershops] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCity, setFilterCity] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [selectedBarbershop, setSelectedBarbershop] = useState<any | null>(null);
  const [tempPasswordModal, setTempPasswordModal] = useState<{ show: boolean; password?: string; ownerName?: string } | null>(null);

  // 2. CONTACTS & BROADCASTS STATE
  const [contacts, setContacts] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastAudience, setBroadcastAudience] = useState('ALL');

  // 3. ANNOUNCEMENTS STATE
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState('BANNER');
  const [annCoupon, setAnnCoupon] = useState('');
  const [annDiscount, setAnnDiscount] = useState('');
  const [annAudience, setAnnAudience] = useState('ALL');

  // 4. FEATURES STATE
  const [features, setFeatures] = useState<any[]>([]);
  const [featureHistory, setFeatureHistory] = useState<any[]>([]);
  const [disableReasonModal, setDisableReasonModal] = useState<{ key: string; name: string } | null>(null);
  const [disableReasonText, setDisableReasonText] = useState('');

  // 5. SETTINGS STATE
  const [settings, setSettings] = useState<any>({
    platformName: 'Central de Barbearias',
    supportEmail: 'suporte@barberecosystem.com.br',
    phone: '',
    maintenanceMode: false,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('barber_user');

    if (!savedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.role !== 'SUPER_ADMIN' && parsedUser.role !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }
      setUser(parsedUser);
      fetchAllData();
    } catch {
      router.push('/login');
    }
  }, [router]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchBarbershops(),
      fetchContactsAndBroadcasts(),
      fetchAnnouncements(),
      fetchFeatures(),
      fetchSettings(),
    ]);
    setLoading(false);
  };

  // 1. BARBEARIAS FUNCTIONS
  const fetchBarbershops = async () => {
    let query = `/admin/barbershops?status=${filterStatus}`;
    if (filterCity) query += `&city=${encodeURIComponent(filterCity)}`;
    if (filterPlan) query += `&plan=${encodeURIComponent(filterPlan)}`;
    if (filterSearch) query += `&search=${encodeURIComponent(filterSearch)}`;

    const res = await apiFetch<any[]>(query);
    if (res.success && res.data) {
      setBarbershops(res.data);
    }
  };

  const handleToggleBarbershopStatus = async (barbershop: any) => {
    setActionMsg('');
    setError('');
    const newStatus = !barbershop.active;

    const res = await apiFetch<any>(`/admin/barbershops/${barbershop.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ active: newStatus }),
    });

    if (res.success) {
      setActionMsg(`Barbearia "${barbershop.name}" ${newStatus ? 'ativada' : 'suspensa/desativada'}.`);
      fetchBarbershops();
    } else {
      setError(res.error || 'Erro ao alterar status');
    }
  };

  const handleDeleteBarbershop = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir a barbearia "${name}"?`)) return;

    setActionMsg('');
    setError('');

    const res = await apiFetch<any>(`/admin/barbershops/${id}`, { method: 'DELETE' });
    if (res.success) {
      setActionMsg(`Barbearia "${name}" excluída.`);
      fetchBarbershops();
    } else {
      setError(res.error || 'Erro ao excluir barbearia');
    }
  };

  const handleResetOwnerPassword = async (barbershop: any) => {
    setActionMsg('');
    setError('');

    const owner = barbershop.owner || barbershop.users?.find((u: any) => u.role === 'ADMIN') || barbershop.users?.[0];

    if (!owner) {
      setError(`Nenhum proprietário encontrado para a barbearia ${barbershop.name}`);
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
      setError(res.error || 'Erro ao resetar senha');
    }
  };

  // 2. CONTACTS & BROADCASTS FUNCTIONS
  const fetchContactsAndBroadcasts = async () => {
    const cRes = await apiFetch<any[]>('/admin/contacts');
    if (cRes.success && cRes.data) setContacts(cRes.data);

    const bRes = await apiFetch<any[]>('/admin/broadcasts');
    if (bRes.success && bRes.data) setBroadcasts(bRes.data);
  };

  const handleReplyContact = async (id: string) => {
    if (!replyText) return;
    setActionMsg('');
    setError('');

    const res = await apiFetch<any>(`/admin/contacts/${id}/reply`, {
      method: 'PATCH',
      body: JSON.stringify({ reply: replyText }),
    });

    if (res.success) {
      setActionMsg('Resposta enviada com sucesso!');
      setReplyText('');
      setSelectedContactId(null);
      fetchContactsAndBroadcasts();
    } else {
      setError(res.error || 'Erro ao responder mensagem');
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMsg('');
    setError('');

    const res = await apiFetch<any>('/admin/broadcasts', {
      method: 'POST',
      body: JSON.stringify({
        title: broadcastTitle,
        content: broadcastContent,
        targetAudience: broadcastAudience,
      }),
    });

    if (res.success) {
      setActionMsg('Comunicado em massa enviado!');
      setBroadcastTitle('');
      setBroadcastContent('');
      fetchContactsAndBroadcasts();
    } else {
      setError(res.error || 'Erro ao enviar comunicado');
    }
  };

  // 3. ANNOUNCEMENTS FUNCTIONS
  const fetchAnnouncements = async () => {
    const res = await apiFetch<any[]>('/admin/announcements');
    if (res.success && res.data) setAnnouncements(res.data);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMsg('');
    setError('');

    const res = await apiFetch<any>('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify({
        title: annTitle,
        content: annContent,
        type: annType,
        couponCode: annCoupon,
        discountPercent: annDiscount,
        targetAudience: annAudience,
      }),
    });

    if (res.success) {
      setActionMsg('Anúncio / Promoção criado com sucesso!');
      setAnnTitle('');
      setAnnContent('');
      setAnnCoupon('');
      setAnnDiscount('');
      fetchAnnouncements();
    } else {
      setError(res.error || 'Erro ao criar anúncio');
    }
  };

  const handleToggleAnnouncementActive = async (ann: any) => {
    const res = await apiFetch<any>(`/admin/announcements/${ann.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: !ann.active }),
    });

    if (res.success) {
      fetchAnnouncements();
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Deseja excluir este anúncio?')) return;
    const res = await apiFetch<any>(`/admin/announcements/${id}`, { method: 'DELETE' });
    if (res.success) fetchAnnouncements();
  };

  // 4. FEATURES FUNCTIONS
  const fetchFeatures = async () => {
    const res = await apiFetch<any[]>('/admin/features');
    if (res.success && res.data) setFeatures(res.data);

    const hRes = await apiFetch<any[]>('/admin/features/history');
    if (hRes.success && hRes.data) setFeatureHistory(hRes.data);
  };

  const handleToggleFeature = async (featureKey: string, currentEnabled: boolean, featureName: string) => {
    if (currentEnabled) {
      // Prompt for reason when disabling
      setDisableReasonModal({ key: featureKey, name: featureName });
      setDisableReasonText('');
      return;
    }

    // Enable directly
    await submitFeatureToggle(featureKey, true, 'Ativação pelo administrador');
  };

  const submitFeatureToggle = async (key: string, enabled: boolean, reason: string) => {
    setActionMsg('');
    setError('');

    const res = await apiFetch<any>(`/admin/features/${key}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled, reason }),
    });

    if (res.success) {
      setActionMsg(`Funcionalidade ${enabled ? 'ativada' : 'desativada'} com sucesso.`);
      setDisableReasonModal(null);
      fetchFeatures();
    } else {
      setError(res.error || 'Erro ao alterar funcionalidade');
    }
  };

  // 5. SETTINGS FUNCTIONS
  const fetchSettings = async () => {
    const res = await apiFetch<any>('/admin/settings');
    if (res.success && res.data?.settings) {
      setSettings(res.data.settings);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMsg('');
    setError('');

    const res = await apiFetch<any>('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });

    if (res.success) {
      setActionMsg('Configurações salvas com sucesso!');
    } else {
      setError(res.error || 'Erro ao salvar configurações');
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400">Carregando painel de administração...</div>;
  }

  return (
    <div className="space-y-8 my-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-500">Painel do Administrador</h1>
          <p className="text-slate-400 text-sm">
            Gestão completa da plataforma Barber Ecosystem — Bem-vindo, <strong>{user?.name}</strong>
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

      {/* Action Alerts */}
      {actionMsg && (
        <div className="p-3 bg-green-500/10 border border-green-500 text-green-400 rounded-lg text-sm flex justify-between items-center">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg('')} className="text-xs font-bold">✕</button>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500 text-red-400 rounded-lg text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-xs font-bold">✕</button>
        </div>
      )}

      {/* Temp Password Alert Modal */}
      {tempPasswordModal?.show && (
        <div className="p-4 bg-amber-500/20 border border-amber-500 text-amber-300 rounded-xl space-y-2 text-sm">
          <h3 className="font-bold text-base text-amber-400">🔑 Senha Temporária Gerada!</h3>
          <p>
            Usuário: <strong>{tempPasswordModal.ownerName}</strong>
          </p>
          <p className="text-lg font-mono font-bold bg-slate-900 px-3 py-1.5 rounded text-white inline-block">
            {tempPasswordModal.password}
          </p>
          <button
            onClick={() => setTempPasswordModal(null)}
            className="text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1 rounded mt-2 block"
          >
            Fechar Aviso
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-1 overflow-x-auto text-sm font-medium">
        <button
          onClick={() => setActiveTab('barbershops')}
          className={`px-4 py-3 border-b-2 transition whitespace-nowrap ${
            activeTab === 'barbershops'
              ? 'border-amber-500 text-amber-500 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🏢 Barbearias
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-3 border-b-2 transition whitespace-nowrap ${
            activeTab === 'contacts'
              ? 'border-amber-500 text-amber-500 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          📬 Contatos & Comunicados
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-3 border-b-2 transition whitespace-nowrap ${
            activeTab === 'announcements'
              ? 'border-amber-500 text-amber-500 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          📢 Anúncios & Promoções
        </button>

        <button
          onClick={() => setActiveTab('features')}
          className={`px-4 py-3 border-b-2 transition whitespace-nowrap ${
            activeTab === 'features'
              ? 'border-amber-500 text-amber-500 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          ⚙️ Controle de Recursos
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-3 border-b-2 transition whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-amber-500 text-amber-500 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          ⚙️ Configurações Gerais
        </button>
      </div>

      {/* TAB 1: GESTÃO DE BARBEARIAS */}
      {activeTab === 'barbershops' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
              >
                <option value="all">Todas</option>
                <option value="active">Ativas</option>
                <option value="inactive">Inativas / Suspensas</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Cidade</label>
              <input
                type="text"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                placeholder="Ex: São Paulo"
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Plano</label>
              <input
                type="text"
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                placeholder="Ex: Premium"
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Buscar por Nome / Slug</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder="Nome..."
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
                <button
                  onClick={fetchBarbershops}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-medium px-3 py-1.5 rounded"
                >
                  Filtrar
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl shadow-xl">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase text-amber-500 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Barbearia</th>
                  <th className="px-6 py-3">Cidade / Estado</th>
                  <th className="px-6 py-3">Proprietário</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {barbershops.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      Nenhuma barbearia encontrada.
                    </td>
                  </tr>
                ) : (
                  barbershops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-sm">{shop.name}</div>
                        <div className="text-slate-400 font-mono">/{shop.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        {shop.city ? `${shop.city}${shop.state ? ` - ${shop.state}` : ''}` : 'Não informado'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-200">{shop.owner?.name || 'Não associado'}</div>
                        <div className="text-slate-400">{shop.owner?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            shop.active !== false
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {shop.active !== false ? 'Ativa' : 'Suspensa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedBarbershop(shop)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded"
                        >
                          Ver Detalhes
                        </button>
                        <button
                          onClick={() => handleToggleBarbershopStatus(shop)}
                          className={`px-2 py-1 rounded font-medium ${
                            shop.active !== false
                              ? 'bg-red-950/60 hover:bg-red-900 text-red-300'
                              : 'bg-green-950/60 hover:bg-green-900 text-green-300'
                          }`}
                        >
                          {shop.active !== false ? 'Suspender' : 'Reativar'}
                        </button>
                        <button
                          onClick={() => handleResetOwnerPassword(shop)}
                          className="bg-amber-950/60 hover:bg-amber-900/80 text-amber-400 px-2 py-1 rounded"
                        >
                          Resetar Senha
                        </button>
                        <button
                          onClick={() => handleDeleteBarbershop(shop.id, shop.name)}
                          className="bg-red-800 hover:bg-red-700 text-white px-2 py-1 rounded"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Detalhes da Barbearia */}
      {selectedBarbershop && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs">
            <h3 className="text-lg font-bold text-amber-500">Detalhes de {selectedBarbershop.name}</h3>

            <div className="space-y-2 text-slate-300">
              <p><strong>ID:</strong> {selectedBarbershop.id}</p>
              <p><strong>Slug:</strong> {selectedBarbershop.slug}</p>
              <p><strong>Endereço:</strong> {selectedBarbershop.address || 'Não informado'}</p>
              <p><strong>Cidade/Estado:</strong> {selectedBarbershop.city} / {selectedBarbershop.state}</p>
              <p><strong>Telefone:</strong> {selectedBarbershop.phone || 'Não informado'}</p>
              <p><strong>Dono:</strong> {selectedBarbershop.owner?.name} ({selectedBarbershop.owner?.email})</p>
              <p><strong>Serviços:</strong> {selectedBarbershop._count?.services || 0}</p>
              <p><strong>Agendamentos:</strong> {selectedBarbershop._count?.appointments || 0}</p>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedBarbershop(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTATO & COMUNICADOS */}
      {activeTab === 'contacts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs">
          {/* Mensagens de Contato */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex justify-between items-center">
              <span>📬 Mensagens Recebidas</span>
              <span className="text-xs text-slate-400">{contacts.length} total</span>
            </h2>

            {contacts.length === 0 ? (
              <p className="text-slate-400">Nenhuma mensagem recebida.</p>
            ) : (
              <div className="space-y-3">
                {contacts.map((msg) => (
                  <div key={msg.id} className="p-3 bg-slate-800 rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-amber-400 text-sm">{msg.subject}</strong>
                        <p className="text-slate-300">De: {msg.senderName} ({msg.senderEmail})</p>
                        {msg.barbershop?.name && (
                          <p className="text-slate-400">Barbearia: {msg.barbershop.name}</p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          msg.status === 'REPLIED' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {msg.status === 'REPLIED' ? 'Respondida' : 'Pendente'}
                      </span>
                    </div>

                    <p className="text-slate-300 italic bg-slate-900/60 p-2 rounded">{msg.message}</p>

                    {msg.reply && (
                      <div className="p-2 bg-green-950/40 border border-green-800/40 rounded text-green-300">
                        <strong>Sua Resposta:</strong> {msg.reply}
                      </div>
                    )}

                    {msg.status !== 'REPLIED' && (
                      <div className="pt-2">
                        {selectedContactId === msg.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Escreva sua resposta..."
                              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                              rows={2}
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setSelectedContactId(null)}
                                className="bg-slate-700 hover:bg-slate-600 px-2.5 py-1 rounded text-slate-300"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleReplyContact(msg.id)}
                                className="bg-amber-600 hover:bg-amber-500 px-2.5 py-1 rounded text-white font-semibold"
                              >
                                Enviar Resposta
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedContactId(msg.id);
                              setReplyText('');
                            }}
                            className="text-amber-400 hover:underline font-medium"
                          >
                            💬 Responder Mensagem
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enviar Comunicado em Massa */}
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <h2 className="text-lg font-bold text-white">📢 Enviar Comunicado em Massa</h2>
              <form onSubmit={handleSendBroadcast} className="space-y-3">
                <div>
                  <label className="block text-slate-400 mb-1">Público-Alvo</label>
                  <select
                    value={broadcastAudience}
                    onChange={(e) => setBroadcastAudience(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                  >
                    <option value="ALL">Todos os Usuários e Barbearias</option>
                    <option value="OWNERS">Donos de Barbearia (Administradores)</option>
                    <option value="BARBERS">Barbeiros e Profissionais</option>
                    <option value="CLIENTS">Clientes Finais</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Título do Comunicado</label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    required
                    placeholder="Ex: Atualização dos Termos de Uso"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Conteúdo da Mensagem</label>
                  <textarea
                    value={broadcastContent}
                    onChange={(e) => setBroadcastContent(e.target.value)}
                    required
                    rows={4}
                    placeholder="Escreva o comunicado aqui..."
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 rounded transition"
                >
                  Enviar Comunicado Agora
                </button>
              </form>
            </div>

            {/* Histórico de Comunicados */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <h3 className="font-bold text-white text-sm">Histórico de Comunicados Enviados</h3>
              {broadcasts.length === 0 ? (
                <p className="text-slate-400">Nenhum comunicado no histórico.</p>
              ) : (
                <div className="space-y-2">
                  {broadcasts.map((b) => (
                    <div key={b.id} className="p-3 bg-slate-800 rounded space-y-1">
                      <div className="flex justify-between text-slate-300 font-bold">
                        <span>{b.title}</span>
                        <span className="text-amber-400">{b.targetAudience}</span>
                      </div>
                      <p className="text-slate-400 line-clamp-2">{b.content}</p>
                      <p className="text-[10px] text-slate-500">📅 {new Date(b.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANÚNCIOS E PROMOÇÕES */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs">
          {/* Formulário Novo Anúncio */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h2 className="text-lg font-bold text-white">Criar Anúncio / Promoção</h2>
            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Título</label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  required
                  placeholder="Ex: 20% de Desconto no Plano Anual"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Conteúdo Informativo</label>
                <textarea
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  required
                  rows={3}
                  placeholder="Detalhes do anúncio..."
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tipo de Anúncio</label>
                <select
                  value={annType}
                  onChange={(e) => setAnnType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                >
                  <option value="BANNER">Banner Informativo</option>
                  <option value="PLAN_DISCOUNT">Desconto em Plano</option>
                  <option value="FREE_TRIAL">Período Grátis Premium</option>
                  <option value="COUPON">Cupom Promocional com Código</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Código do Cupom</label>
                  <input
                    type="text"
                    value={annCoupon}
                    onChange={(e) => setAnnCoupon(e.target.value)}
                    placeholder="BARBER20"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Desconto (%)</label>
                  <input
                    type="number"
                    value={annDiscount}
                    onChange={(e) => setAnnDiscount(e.target.value)}
                    placeholder="20"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Público-Alvo</label>
                <select
                  value={annAudience}
                  onChange={(e) => setAnnAudience(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                >
                  <option value="ALL">Todos os Usuários</option>
                  <option value="OWNERS">Donos de Barbearia</option>
                  <option value="CLIENTS">Clientes Finais</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 rounded transition"
              >
                Publicar Anúncio
              </button>
            </form>
          </div>

          {/* Lista de Anúncios */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-white flex justify-between items-center">
              <span>📢 Anúncios e Promoções Ativas</span>
              <span className="text-xs text-slate-400">{announcements.length} cadastrados</span>
            </h2>

            {announcements.length === 0 ? (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-center">
                Nenhum anúncio cadastrado no momento.
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 flex justify-between items-start"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-amber-400 text-sm">{ann.title}</strong>
                        <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300 font-mono">
                          {ann.type}
                        </span>
                      </div>

                      <p className="text-slate-300">{ann.content}</p>

                      {ann.couponCode && (
                        <p className="text-slate-400">
                          Cupom: <strong className="text-amber-300 font-mono">{ann.couponCode}</strong> ({ann.discountPercent}% off)
                        </p>
                      )}

                      <div className="flex gap-4 text-[11px] text-slate-400 pt-1">
                        <span>👀 Visualizações: <strong>{ann.viewsCount}</strong></span>
                        <span>🎟️ Utilizações: <strong>{ann.usageCount}</strong></span>
                        <span>🎯 Público: <strong>{ann.targetAudience}</strong></span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleAnnouncementActive(ann)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          ann.active ? 'bg-green-950/80 text-green-400' : 'bg-red-950/80 text-red-400'
                        }`}
                      >
                        {ann.active ? 'Ativo' : 'Inativo'}
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="bg-red-900/40 hover:bg-red-800 text-red-300 px-2 py-1 rounded text-xs"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CONTROLE DE FUNCIONALIDADES PREMIUM */}
      {activeTab === 'features' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs">
          {/* Interruptores de Funcionalidade */}
          <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h2 className="text-lg font-bold text-white">⚙️ Controle de Recursos Premium</h2>
            <p className="text-slate-400">
              Ative ou desative módulos globais da plataforma em tempo real. Ao desativar, o acesso será bloqueado com aviso amigável sem apagar dados.
            </p>

            <div className="divide-y divide-slate-800">
              {features.map((feat) => (
                <div key={feat.key} className="py-4 flex justify-between items-center">
                  <div>
                    <strong className="text-white text-sm block">{feat.name}</strong>
                    <span className="text-slate-500 font-mono text-[11px]">Chave: {feat.key}</span>
                  </div>

                  <button
                    onClick={() => handleToggleFeature(feat.key, feat.enabled, feat.name)}
                    className={`px-4 py-2 rounded-lg font-bold text-xs transition ${
                      feat.enabled
                        ? 'bg-green-600 hover:bg-green-500 text-white'
                        : 'bg-red-900/60 hover:bg-red-800 text-red-300'
                    }`}
                  >
                    {feat.enabled ? '🟢 ATIVADO' : '🔴 DESATIVADO'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Histórico de Alterações */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 className="font-bold text-white text-base">📜 Histórico de Modificações</h3>

            {featureHistory.length === 0 ? (
              <p className="text-slate-400">Nenhuma alteração registrada.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {featureHistory.map((h) => (
                  <div key={h.id} className="p-3 bg-slate-800 rounded space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-amber-400">{h.featureKey}</span>
                      <span className={h.action === 'ENABLED' ? 'text-green-400' : 'text-red-400'}>
                        {h.action}
                      </span>
                    </div>
                    <p className="text-slate-300">{h.reason}</p>
                    <p className="text-[10px] text-slate-500">
                      Por: {h.adminEmail || 'Admin'} • {new Date(h.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Motivo ao Desativar Funcionalidade */}
      {disableReasonModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-red-400">
              Desativar recurso: {disableReasonModal.name}
            </h3>
            <p className="text-slate-300">
              Por favor, informe o motivo do desativamento para o histórico de auditoria do sistema:
            </p>

            <textarea
              value={disableReasonText}
              onChange={(e) => setDisableReasonText(e.target.value)}
              required
              rows={3}
              placeholder="Ex: Manutenção preventiva / Atualização de servidor"
              className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDisableReasonModal(null)}
                className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => submitFeatureToggle(disableReasonModal.key, false, disableReasonText || 'Desativado')}
                className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded text-white font-semibold"
              >
                Confirmar Desativação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CONFIGURAÇÕES GERAIS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-6 text-xs">
          <h2 className="text-lg font-bold text-white">⚙️ Configurações Gerais da Plataforma</h2>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Nome da Plataforma</label>
              <input
                type="text"
                value={settings.platformName || ''}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">E-mail de Suporte</label>
              <input
                type="email"
                value={settings.supportEmail || ''}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Telefone de Contato</label>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
              />
            </div>

            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-lg flex items-center justify-between">
              <div>
                <strong className="text-white block">Modo Manutenção Geral</strong>
                <span className="text-slate-400">Impede acessos externos temporariamente</span>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode || false}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-5 h-5 rounded text-amber-500 bg-slate-900 border-slate-700"
              />
            </div>

            <button
              type="submit"
              className="bg-amber-600 hover:bg-[#e67700] hover:scale-[1.02] active:scale-[0.98] text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200"
            >
              Salvar Configurações
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
