'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'barbershops' | 'contacts' | 'announcements' | 'resources' | 'settings'>('barbershops');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [error, setError] = useState('');

  // 1. BARBEARIAS STATE
  const [barbershops, setBarbershops] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCity, setFilterCity] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [selectedBarbershop, setSelectedBarbershop] = useState<any | null>(null);
  const [tempPasswordModal, setTempPasswordModal] = useState<{ show: boolean; password?: string; ownerName?: string } | null>(null);

  // Barbershop Create/Edit Modal State
  const [showShopModal, setShowShopModal] = useState(false);
  const [editingShop, setEditingShop] = useState<any | null>(null);
  const [shopForm, setShopForm] = useState({
    name: '',
    slug: '',
    phone: '',
    address: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    street: '',
    number: '',
    email: '',
    cnpj: '',
    corporateName: '',
    cnpjStatus: '',
    cnpjStatusDate: '',
    cnpjConsultedAt: '',
    cnpjSource: '',
    cnae: '',
    ownerName: '',
    ownerEmail: '',
    planId: '',
  });
  const [cnpjSearching, setCnpjSearching] = useState(false);
  const [cnpjMsg, setCnpjMsg] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  // 2. CONTACTS & BROADCASTS STATE
  const [contacts, setContacts] = useState<any[]>([]);
  const [filterContactStatus, setFilterContactStatus] = useState('all');
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastAudience, setBroadcastAudience] = useState('ALL');

  // 3. ANNOUNCEMENTS STATE
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [annFilter, setAnnFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL');
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState('BANNER');
  const [annCoupon, setAnnCoupon] = useState('');
  const [annDiscount, setAnnDiscount] = useState('');
  const [annAudience, setAnnAudience] = useState('ALL');

  // 4. RESOURCE CONTROL, USERS & PLANS STATE
  const [resSubTab, setResSubTab] = useState<'users' | 'plans' | 'features'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');

  const [plans, setPlans] = useState<any[]>([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: '',
    interval: 'MONTHLY',
    maxBarbers: '5',
    maxAppointmentsMonth: '1000',
    customPage: true,
    reports: true,
    aiAgent: false,
  });

  const [features, setFeatures] = useState<any[]>([]);
  const [featureHistory, setFeatureHistory] = useState<any[]>([]);
  const [disableReasonModal, setDisableReasonModal] = useState<{ key: string; name: string } | null>(null);
  const [disableReasonText, setDisableReasonText] = useState('');

  // 5. CONFIGURAÇÕES GERAIS STATE
  const [settingsGroup, setSettingsGroup] = useState<'platform' | 'finance' | 'booking' | 'notifications' | 'security' | 'appearance' | 'system'>('platform');
  const [settings, setSettings] = useState<any>({
    platformName: 'Central de Barbearias',
    operatorCnpj: '00.000.000/0001-99',
    supportEmail: 'suporte@barberecosystem.com.br',
    phone: '(11) 99999-9999',
    address: 'Av. Paulista, 1000 - São Paulo/SP',
    supportHours: 'Segunda a Sexta, das 08h às 18h',
    currency: 'BRL R$',
    paymentMethods: ['PIX', 'CREDIT_CARD', 'BOLETO'],
    billingDueDay: '10',
    refundRules: 'Reembolso proporcional em até 7 dias',
    commissionFee: '5.0',
    minBookingNoticeMin: '30',
    maxBookingFutureDays: '30',
    defaultOpeningHours: '08:00 - 20:00',
    delayToleranceMin: '15',
    blockNationalHolidays: true,
    allowCustomHours: true,
    enableReminders: true,
    reminderHoursNotice: '2',
    autoReplyEmail: 'nao-responda@barberecosystem.com.br',
    emailSignature: 'Atenciosamente, Equipe Barber Ecosystem',
    enableSystemNotifications: true,
    sessionTimeoutMin: '60',
    maxLoginAttempts: '5',
    requireEmailVerification: true,
    forcePasswordChangeDays: '90',
    primaryColor: '#f59e0b',
    accentColor: '#d97706',
    defaultTheme: 'DARK',
    logoUrl: '/logo.png',
    maintenanceMode: false,
    maintenanceMessage: 'Estamos realizando melhorias no sistema. Voltaremos em breve!',
    systemVersion: 'v2.4.0',
    lastUpdateDate: new Date().toLocaleDateString('pt-BR'),
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
      fetchUsers(),
      fetchPlans(),
      fetchFeatures(),
      fetchSettings(),
    ]);
    setLoading(false);
  };

  // ==========================================
  // 1. BARBEARIAS FUNCTIONS
  // ==========================================
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

  const handleSearchCNPJ = async (cnpjInput: string) => {
    setCnpjMsg(null);
    if (!cnpjInput || cnpjInput.replace(/\D/g, '').length < 14) {
      setCnpjMsg({ type: 'error', text: 'CNPJ inválido, verifique os dígitos (mínimo 14 números).' });
      return;
    }

    setCnpjSearching(true);
    const res = await apiFetch<any>(`/cnpj/${encodeURIComponent(cnpjInput)}`);
    setCnpjSearching(false);

    if (res.success && res.data) {
      const data = res.data;
      setShopForm((prev) => ({
        ...prev,
        cnpj: data.formattedCnpj || data.cnpj,
        corporateName: data.corporateName || '',
        name: prev.name || data.tradeName || data.corporateName || '',
        slug: prev.slug || (data.tradeName || data.corporateName || '').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
        zipCode: data.zipCode || '',
        street: data.street || '',
        number: data.number || '',
        neighborhood: data.neighborhood || '',
        city: data.city || '',
        state: data.state || '',
        phone: data.phone || prev.phone,
        email: data.email || prev.email,
        cnae: data.cnae || '',
        cnpjStatus: data.status || 'ATIVA',
        cnpjStatusDate: data.statusDate || '',
        cnpjConsultedAt: data.consultedAt || new Date().toISOString(),
        cnpjSource: data.source || 'Receita Federal via API',
        address: `${data.street || ''}, ${data.number || 'S/N'} - ${data.neighborhood || ''}, ${data.city || ''}/${data.state || ''}`,
      }));

      if (data.isInactive) {
        setCnpjMsg({
          type: 'warning',
          text: `⚠️ Este CNPJ está ${data.status || 'INATIVO'} na Receita Federal (${data.statusDate || ''}). A barbearia poderá ser cadastrada, recomendamos regularizar a situação.`,
        });
      } else {
        setCnpjMsg({
          type: 'success',
          text: `✅ CNPJ ${data.status} na Receita Federal (${data.source}). Dados preenchidos automaticamente!`,
        });
      }
    } else {
      setCnpjMsg({
        type: 'error',
        text: res.error || 'CNPJ não encontrado na base da Receita Federal. Verifique o número ou digite manualmente.',
      });
    }
  };

  const handleOpenNewShopModal = () => {
    setEditingShop(null);
    setShopForm({
      name: '',
      slug: '',
      phone: '',
      address: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      street: '',
      number: '',
      email: '',
      cnpj: '',
      corporateName: '',
      cnpjStatus: '',
      cnpjStatusDate: '',
      cnpjConsultedAt: '',
      cnpjSource: '',
      cnae: '',
      ownerName: '',
      ownerEmail: '',
      planId: plans[0]?.id || '',
    });
    setCnpjMsg(null);
    setShowShopModal(true);
  };

  const handleOpenEditShopModal = (shop: any) => {
    setEditingShop(shop);
    setShopForm({
      name: shop.name || '',
      slug: shop.slug || '',
      phone: shop.phone || '',
      address: shop.address || '',
      neighborhood: shop.neighborhood || '',
      city: shop.city || '',
      state: shop.state || '',
      zipCode: shop.zipCode || '',
      street: shop.street || '',
      number: shop.number || '',
      email: shop.email || '',
      cnpj: shop.cnpj || '',
      corporateName: shop.corporateName || '',
      cnpjStatus: shop.cnpjStatus || '',
      cnpjStatusDate: shop.cnpjStatusDate || '',
      cnpjConsultedAt: shop.cnpjConsultedAt || '',
      cnpjSource: shop.cnpjSource || '',
      cnae: shop.cnae || '',
      ownerName: shop.owner?.name || '',
      ownerEmail: shop.owner?.email || '',
      planId: shop.subscription?.planId || '',
    });
    setCnpjMsg(null);
    setShowShopModal(true);
  };

  const handleSaveShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMsg('');
    setError('');

    const endpoint = editingShop ? `/admin/barbershops/${editingShop.id}` : '/admin/barbershops';
    const method = editingShop ? 'PUT' : 'POST';

    const res = await apiFetch<any>(endpoint, {
      method,
      body: JSON.stringify(shopForm),
    });

    if (res.success) {
      setActionMsg(`Barbearia "${shopForm.name}" ${editingShop ? 'atualizada' : 'cadastrada'} com sucesso!`);
      setShowShopModal(false);
      fetchBarbershops();
    } else {
      setError(res.error || 'Erro ao salvar barbearia');
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
    if (!confirm(`Tem certeza que deseja excluir a barbearia "${name}" e todos os seus dados?`)) return;

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

  // ==========================================
  // 2. CONTACTS & BROADCASTS FUNCTIONS
  // ==========================================
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

  const handleToggleContactReadStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'READ' ? 'PENDING' : 'READ';
    const res = await apiFetch<any>(`/admin/contacts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.success) fetchContactsAndBroadcasts();
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

  // ==========================================
  // 3. ANNOUNCEMENTS FUNCTIONS
  // ==========================================
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
      setActionMsg('Anúncio / Promoção publicado com sucesso!');
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

    if (res.success) fetchAnnouncements();
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Deseja excluir este anúncio permanentemente?')) return;
    const res = await apiFetch<any>(`/admin/announcements/${id}`, { method: 'DELETE' });
    if (res.success) fetchAnnouncements();
  };

  // ==========================================
  // 4. USERS, PLANS & FEATURES FUNCTIONS
  // ==========================================
  const fetchUsers = async () => {
    let query = `/admin/users?role=${userRoleFilter}`;
    if (userSearch) query += `&search=${encodeURIComponent(userSearch)}`;
    const res = await apiFetch<any[]>(query);
    if (res.success && res.data) setUsers(res.data);
  };

  const handleChangeUserRole = async (id: string, newRole: string) => {
    setActionMsg('');
    setError('');
    const res = await apiFetch<any>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: newRole }),
    });

    if (res.success) {
      setActionMsg('Perfil do usuário atualizado.');
      fetchUsers();
    } else {
      setError(res.error || 'Erro ao atualizar perfil');
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Deseja excluir o usuário "${name}"?`)) return;
    setActionMsg('');
    setError('');
    const res = await apiFetch<any>(`/admin/users/${id}`, { method: 'DELETE' });
    if (res.success) {
      setActionMsg('Usuário excluído.');
      fetchUsers();
    } else {
      setError(res.error || 'Erro ao excluir usuário');
    }
  };

  const fetchPlans = async () => {
    const res = await apiFetch<any[]>('/admin/plans');
    if (res.success && res.data) setPlans(res.data);
  };

  const handleOpenNewPlanModal = () => {
    setEditingPlan(null);
    setPlanForm({
      name: '',
      description: '',
      price: '49.90',
      interval: 'MONTHLY',
      maxBarbers: '5',
      maxAppointmentsMonth: '1000',
      customPage: true,
      reports: true,
      aiAgent: false,
    });
    setShowPlanModal(true);
  };

  const handleOpenEditPlanModal = (plan: any) => {
    setEditingPlan(plan);
    const feats = plan.features || {};
    setPlanForm({
      name: plan.name || '',
      description: plan.description || '',
      price: String(plan.price || 0),
      interval: plan.interval || 'MONTHLY',
      maxBarbers: String(feats.maxBarbers || 5),
      maxAppointmentsMonth: String(feats.maxAppointmentsMonth || 1000),
      customPage: feats.customPage !== false,
      reports: feats.reports !== false,
      aiAgent: !!feats.aiAgent,
    });
    setShowPlanModal(true);
  };

  const handleSavePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMsg('');
    setError('');

    const payload = {
      name: planForm.name,
      description: planForm.description,
      price: planForm.price,
      interval: planForm.interval,
      features: {
        maxBarbers: parseInt(planForm.maxBarbers) || 1,
        maxAppointmentsMonth: parseInt(planForm.maxAppointmentsMonth) || 100,
        customPage: planForm.customPage,
        reports: planForm.reports,
        aiAgent: planForm.aiAgent,
      },
    };

    const endpoint = editingPlan ? `/admin/plans/${editingPlan.id}` : '/admin/plans';
    const method = editingPlan ? 'PATCH' : 'POST';

    const res = await apiFetch<any>(endpoint, {
      method,
      body: JSON.stringify(payload),
    });

    if (res.success) {
      setActionMsg(`Plano "${planForm.name}" salvo com sucesso.`);
      setShowPlanModal(false);
      fetchPlans();
    } else {
      setError(res.error || 'Erro ao salvar plano');
    }
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (!confirm(`Excluir o plano "${name}"?`)) return;
    setActionMsg('');
    setError('');
    const res = await apiFetch<any>(`/admin/plans/${id}`, { method: 'DELETE' });
    if (res.success) {
      setActionMsg('Plano excluído.');
      fetchPlans();
    } else {
      setError(res.error || 'Erro ao excluir plano');
    }
  };

  const fetchFeatures = async () => {
    const res = await apiFetch<any[]>('/admin/features');
    if (res.success && res.data) setFeatures(res.data);

    const hRes = await apiFetch<any[]>('/admin/features/history');
    if (hRes.success && hRes.data) setFeatureHistory(hRes.data);
  };

  const handleToggleFeature = async (featureKey: string, currentEnabled: boolean, featureName: string) => {
    if (currentEnabled) {
      setDisableReasonModal({ key: featureKey, name: featureName });
      setDisableReasonText('');
      return;
    }
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

  // ==========================================
  // 5. SETTINGS FUNCTIONS
  // ==========================================
  const fetchSettings = async () => {
    const res = await apiFetch<any>('/admin/settings');
    if (res.success && res.data?.settings) {
      setSettings((prev: any) => ({
        ...prev,
        ...res.data.settings,
        ...(res.data.settings.footerTexts || {}),
      }));
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
      setActionMsg('Configurações da plataforma salvas com sucesso!');
    } else {
      setError(res.error || 'Erro ao salvar configurações');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm">Carregando painel do ecossistema Barber...</p>
      </div>
    );
  }

  const filteredContacts = contacts.filter((c) => {
    if (filterContactStatus === 'PENDING') return c.status === 'PENDING';
    if (filterContactStatus === 'READ') return c.status === 'READ';
    if (filterContactStatus === 'REPLIED') return c.status === 'REPLIED';
    return true;
  });

  const filteredAnnouncements = announcements.filter((a) => {
    if (annFilter === 'ACTIVE') return a.active;
    if (annFilter === 'ARCHIVED') return !a.active;
    return true;
  });

  return (
    <div className="space-y-8 my-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-500 flex items-center gap-2">
            <span>💈</span> Barber Ecosystem — Admin Hub
          </h1>
          <p className="text-slate-400 text-xs">
            Gestão completa de Barbearias, CNPJ, Contatos, Anúncios, Planos e Configurações Globais — Usuário: <strong>{user?.name}</strong>
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
        <div className="p-3 bg-green-500/10 border border-green-500 text-green-400 rounded-lg text-xs flex justify-between items-center animate-fade-in">
          <span className="font-medium">✅ {actionMsg}</span>
          <button onClick={() => setActionMsg('')} className="text-xs font-bold px-2">✕</button>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500 text-red-400 rounded-lg text-xs flex justify-between items-center animate-fade-in">
          <span className="font-medium">❌ {error}</span>
          <button onClick={() => setError('')} className="text-xs font-bold px-2">✕</button>
        </div>
      )}

      {/* Temp Password Alert Modal */}
      {tempPasswordModal?.show && (
        <div className="p-4 bg-amber-500/20 border border-amber-500 text-amber-300 rounded-xl space-y-2 text-xs shadow-xl">
          <h3 className="font-bold text-sm text-amber-400">🔑 Senha Temporária Gerada!</h3>
          <p>
            Usuário: <strong>{tempPasswordModal.ownerName}</strong>
          </p>
          <p className="text-base font-mono font-bold bg-slate-900 px-3 py-1.5 rounded text-amber-400 inline-block">
            {tempPasswordModal.password}
          </p>
          <button
            onClick={() => setTempPasswordModal(null)}
            className="text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1 rounded mt-2 block"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-1 overflow-x-auto text-xs font-semibold">
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
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-3 border-b-2 transition whitespace-nowrap ${
            activeTab === 'resources'
              ? 'border-amber-500 text-amber-500 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🎛️ Controle de Recursos & Usuários
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
          <div className="flex flex-wrap justify-between items-center gap-3">
            <h2 className="text-lg font-bold text-white">Gerenciamento de Barbearias Cadastradas</h2>
            <button
              onClick={handleOpenNewShopModal}
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition shadow-md"
            >
              ➕ Cadastrar Nova Barbearia
            </button>
          </div>

          {/* Filters Bar */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
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

            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Buscar por Nome, Slug ou CNPJ</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder="Nome, slug ou 00.000.000/0000-00..."
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
                <button
                  onClick={fetchBarbershops}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-medium px-4 py-1.5 rounded"
                >
                  Filtrar
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 uppercase text-amber-500 border-b border-slate-800 font-bold">
                <tr>
                  <th className="px-5 py-3">Barbearia / CNPJ</th>
                  <th className="px-5 py-3">Cidade / Estado</th>
                  <th className="px-5 py-3">Proprietário</th>
                  <th className="px-5 py-3">Plano</th>
                  <th className="px-5 py-3">Status Receita</th>
                  <th className="px-5 py-3">Status Sistema</th>
                  <th className="px-5 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {barbershops.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      Nenhuma barbearia encontrada.
                    </td>
                  </tr>
                ) : (
                  barbershops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-slate-800/30">
                      <td className="px-5 py-3">
                        <div className="font-bold text-white text-sm">{shop.name}</div>
                        <div className="text-slate-400 font-mono text-[11px]">/{shop.slug}</div>
                        {shop.cnpj && (
                          <div className="text-amber-400 font-mono text-[11px]">CNPJ: {shop.cnpj}</div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {shop.city ? `${shop.city}${shop.state ? ` - ${shop.state}` : ''}` : 'Não informado'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-slate-200">{shop.owner?.name || 'Não associado'}</div>
                        <div className="text-slate-400 text-[11px]">{shop.owner?.email}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-semibold text-[11px]">
                          {shop.subscription?.plan?.name || 'Sem plano'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {shop.cnpjStatus ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              shop.cnpjStatus === 'ATIVA' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {shop.cnpjStatus}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            shop.active !== false
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {shop.active !== false ? 'Ativa' : 'Suspensa'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedBarbershop(shop)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded"
                        >
                          Detalhes
                        </button>
                        <button
                          onClick={() => handleOpenEditShopModal(shop)}
                          className="bg-amber-950/80 hover:bg-amber-900 text-amber-300 px-2 py-1 rounded"
                        >
                          Editar
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
                          className="bg-slate-800 hover:bg-slate-700 text-amber-400 px-2 py-1 rounded"
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

      {/* Modal: Cadastrar / Editar Barbearia (com Validação CNPJ) */}
      {showShopModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full space-y-4 shadow-2xl text-xs my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-amber-500 border-b border-slate-800 pb-2">
              {editingShop ? `Editar Barbearia: ${editingShop.name}` : 'Cadastrar Nova Barbearia com Consulta de CNPJ'}
            </h3>

            {/* CNPJ Lookup Box */}
            <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-lg space-y-2">
              <label className="block text-amber-400 font-bold">🔍 Validação e Consulta de CNPJ (Receita Federal)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shopForm.cnpj}
                  onChange={(e) => setShopForm({ ...shopForm, cnpj: e.target.value })}
                  placeholder="Digite o CNPJ (ex: 00.000.000/0001-91)"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white font-mono"
                />
                <button
                  type="button"
                  disabled={cnpjSearching}
                  onClick={() => handleSearchCNPJ(shopForm.cnpj)}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-1.5 rounded whitespace-nowrap disabled:opacity-50"
                >
                  {cnpjSearching ? 'Buscando dados do CNPJ...' : 'Buscar CNPJ'}
                </button>
              </div>

              {cnpjMsg && (
                <div
                  className={`p-2.5 rounded text-xs border font-medium ${
                    cnpjMsg.type === 'success'
                      ? 'bg-green-500/10 border-green-500/40 text-green-400'
                      : cnpjMsg.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'bg-red-500/10 border-red-500/40 text-red-400'
                  }`}
                >
                  {cnpjMsg.text}
                </div>
              )}
            </div>

            <form onSubmit={handleSaveShopSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Nome Fantasia / Barbearia *</label>
                  <input
                    type="text"
                    value={shopForm.name}
                    onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Slug URL *</label>
                  <input
                    type="text"
                    value={shopForm.slug}
                    onChange={(e) => setShopForm({ ...shopForm, slug: e.target.value })}
                    required
                    placeholder="minha-barbearia"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Razão Social</label>
                  <input
                    type="text"
                    value={shopForm.corporateName}
                    onChange={(e) => setShopForm({ ...shopForm, corporateName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">CNAE Principal</label>
                  <input
                    type="text"
                    value={shopForm.cnae}
                    onChange={(e) => setShopForm({ ...shopForm, cnae: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Logradouro / Rua</label>
                  <input
                    type="text"
                    value={shopForm.street}
                    onChange={(e) => setShopForm({ ...shopForm, street: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Número</label>
                  <input
                    type="text"
                    value={shopForm.number}
                    onChange={(e) => setShopForm({ ...shopForm, number: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={shopForm.neighborhood}
                    onChange={(e) => setShopForm({ ...shopForm, neighborhood: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={shopForm.city}
                    onChange={(e) => setShopForm({ ...shopForm, city: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">UF / Estado</label>
                  <input
                    type="text"
                    value={shopForm.state}
                    onChange={(e) => setShopForm({ ...shopForm, state: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">CEP</label>
                  <input
                    type="text"
                    value={shopForm.zipCode}
                    onChange={(e) => setShopForm({ ...shopForm, zipCode: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={shopForm.phone}
                    onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">E-mail de Contato</label>
                  <input
                    type="email"
                    value={shopForm.email}
                    onChange={(e) => setShopForm({ ...shopForm, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Proprietário (E-mail)</label>
                  <input
                    type="email"
                    value={shopForm.ownerEmail}
                    onChange={(e) => setShopForm({ ...shopForm, ownerEmail: e.target.value })}
                    placeholder="dono@barbearia.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Plano da Assinatura</label>
                  <select
                    value={shopForm.planId}
                    onChange={(e) => setShopForm({ ...shopForm, planId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                  >
                    <option value="">Selecione um plano...</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — R$ {p.price}/mês
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowShopModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-5 py-2 rounded text-xs"
                >
                  {editingShop ? 'Salvar Alterações' : 'Cadastrar Barbearia'}
                </button>
              </div>
            </form>
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
              <p><strong>Slug:</strong> /{selectedBarbershop.slug}</p>
              <p><strong>CNPJ:</strong> {selectedBarbershop.cnpj || 'Não cadastrado'}</p>
              <p><strong>Razão Social:</strong> {selectedBarbershop.corporateName || 'Não informada'}</p>
              <p><strong>Situação Receita:</strong> <span className="text-amber-400 font-semibold">{selectedBarbershop.cnpjStatus || 'N/A'}</span></p>
              <p><strong>CNAE:</strong> {selectedBarbershop.cnae || 'N/A'}</p>
              <p><strong>Data de Consulta CNPJ:</strong> {selectedBarbershop.cnpjConsultedAt ? new Date(selectedBarbershop.cnpjConsultedAt).toLocaleString('pt-BR') : 'N/A'}</p>
              <p><strong>Fonte de Consulta:</strong> {selectedBarbershop.cnpjSource || 'N/A'}</p>
              <p><strong>Endereço:</strong> {selectedBarbershop.address || 'Não informado'}</p>
              <p><strong>Cidade/Estado:</strong> {selectedBarbershop.city} / {selectedBarbershop.state}</p>
              <p><strong>Telefone:</strong> {selectedBarbershop.phone || 'Não informado'}</p>
              <p><strong>Proprietário:</strong> {selectedBarbershop.owner?.name} ({selectedBarbershop.owner?.email})</p>
              <p><strong>Plano Ativo:</strong> {selectedBarbershop.subscription?.plan?.name || 'Nenhum'}</p>
              <p><strong>Serviços Cadastrados:</strong> {selectedBarbershop._count?.services || 0}</p>
              <p><strong>Agendamentos Realizados:</strong> {selectedBarbershop._count?.appointments || 0}</p>
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
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-white">📬 Mensagens Recebidas</h2>
              <select
                value={filterContactStatus}
                onChange={(e) => setFilterContactStatus(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-white text-xs"
              >
                <option value="all">Todas ({contacts.length})</option>
                <option value="PENDING">Pendentes</option>
                <option value="READ">Lidas</option>
                <option value="REPLIED">Respondidas</option>
              </select>
            </div>

            {filteredContacts.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">Nenhuma mensagem neste filtro.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredContacts.map((msg) => (
                  <div key={msg.id} className="p-3.5 bg-slate-800 rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-amber-400 text-sm block">{msg.subject}</strong>
                        <p className="text-slate-300">De: {msg.senderName} ({msg.senderEmail})</p>
                        {msg.barbershop?.name && (
                          <p className="text-slate-400">Barbearia: {msg.barbershop.name}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            msg.status === 'REPLIED'
                              ? 'bg-green-500/20 text-green-400'
                              : msg.status === 'READ'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {msg.status === 'REPLIED' ? 'Respondida' : msg.status === 'READ' ? 'Lida' : 'Pendente'}
                        </span>
                        <button
                          onClick={() => handleToggleContactReadStatus(msg.id, msg.status)}
                          className="text-slate-400 hover:text-white px-1"
                          title="Alternar Lida/Pendente"
                        >
                          👁️
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-300 italic bg-slate-900/60 p-2.5 rounded">{msg.message}</p>

                    {msg.reply && (
                      <div className="p-2.5 bg-green-950/40 border border-green-800/40 rounded text-green-300 space-y-1">
                        <strong>Sua Resposta:</strong>
                        <p>{msg.reply}</p>
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
                              rows={3}
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
                                className="bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded text-white font-semibold"
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
              <h2 className="text-base font-bold text-white">📢 Enviar Comunicado em Massa</h2>
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
                    placeholder="Ex: Atualização do Regulamento"
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
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
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
            <h2 className="text-base font-bold text-white">Criar Anúncio / Promoção</h2>
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
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-white">📢 Anúncios e Promoções Cadastradas</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setAnnFilter('ALL')}
                  className={`px-2.5 py-1 rounded text-xs ${annFilter === 'ALL' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setAnnFilter('ACTIVE')}
                  className={`px-2.5 py-1 rounded text-xs ${annFilter === 'ACTIVE' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Ativos
                </button>
                <button
                  onClick={() => setAnnFilter('ARCHIVED')}
                  className={`px-2.5 py-1 rounded text-xs ${annFilter === 'ARCHIVED' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Arquivados
                </button>
              </div>
            </div>

            {filteredAnnouncements.length === 0 ? (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-center">
                Nenhum anúncio nesta categoria.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAnnouncements.map((ann) => (
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
                        <span>👀 Visualizações: <strong>{ann.viewsCount || 0}</strong></span>
                        <span>🎟️ Utilizações: <strong>{ann.usageCount || 0}</strong></span>
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
                        {ann.active ? 'Ativo' : 'Arquivado'}
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

      {/* TAB 4: CONTROLE DE RECURSOS, USUÁRIOS E PLANOS */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          {/* Subtabs */}
          <div className="flex border-b border-slate-800 space-x-2 text-xs font-bold">
            <button
              onClick={() => setResSubTab('users')}
              className={`px-4 py-2 rounded-t-lg transition ${
                resSubTab === 'users' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              👥 Usuários & Perfis
            </button>
            <button
              onClick={() => setResSubTab('plans')}
              className={`px-4 py-2 rounded-t-lg transition ${
                resSubTab === 'plans' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              💎 Planos & Limites
            </button>
            <button
              onClick={() => setResSubTab('features')}
              className={`px-4 py-2 rounded-t-lg transition ${
                resSubTab === 'features' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              ⚙️ Interruptores de Recursos (Feature Toggles)
            </button>
          </div>

          {/* SUBTAB: USUÁRIOS */}
          {resSubTab === 'users' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Filtrar por Perfil de Acesso</label>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  >
                    <option value="ALL">Todos os Perfis</option>
                    <option value="SUPER_ADMIN">Super Administrador</option>
                    <option value="ADMIN">Dono de Barbearia / Admin</option>
                    <option value="BARBER">Barbeiro / Profissional</option>
                    <option value="CLIENT">Cliente Final</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Buscar Usuário</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Nome, e-mail ou telefone..."
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                    />
                    <button
                      onClick={fetchUsers}
                      className="bg-amber-600 hover:bg-amber-500 text-white font-medium px-4 py-1.5 rounded"
                    >
                      Filtrar
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl shadow-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/60 uppercase text-amber-500 border-b border-slate-800 font-bold">
                    <tr>
                      <th className="px-5 py-3">Nome / E-mail</th>
                      <th className="px-5 py-3">Telefone</th>
                      <th className="px-5 py-3">Barbearia Vinculada</th>
                      <th className="px-5 py-3">Perfil de Acesso</th>
                      <th className="px-5 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30">
                        <td className="px-5 py-3">
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-slate-400 text-[11px]">{u.email}</div>
                        </td>
                        <td className="px-5 py-3">{u.phone || '—'}</td>
                        <td className="px-5 py-3">{u.barbershop?.name || '—'}</td>
                        <td className="px-5 py-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-amber-300 font-semibold text-[11px]"
                          >
                            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                            <option value="ADMIN">ADMIN (Dono)</option>
                            <option value="BARBER">BARBER (Barbeiro)</option>
                            <option value="CLIENT">CLIENT (Cliente)</option>
                          </select>
                        </td>
                        <td className="px-5 py-3 text-right space-x-1.5">
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="bg-red-800 hover:bg-red-700 text-white px-2 py-1 rounded"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBTAB: PLANOS & LIMITES */}
          {resSubTab === 'plans' && (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-base">Planos de Assinatura & Limites de Recursos</h3>
                <button
                  onClick={handleOpenNewPlanModal}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1.5 rounded"
                >
                  ➕ Criar Novo Plano
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.map((p) => {
                  const feats = p.features || {};
                  return (
                    <div key={p.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 shadow-lg flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-amber-400 text-base">{p.name}</h4>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {p.interval === 'MONTHLY' ? 'Mensal' : 'Anual'}
                          </span>
                        </div>
                        <p className="text-slate-300">{p.description}</p>
                        <p className="text-2xl font-bold text-white">
                          R$ {p.price} <span className="text-xs text-slate-400 font-normal">/mês</span>
                        </p>

                        <div className="p-2.5 bg-slate-800 rounded text-[11px] space-y-1 text-slate-300">
                          <p>👥 Máx. Barbeiros: <strong>{feats.maxBarbers ?? 'Ilimitado'}</strong></p>
                          <p>📅 Máx. Agendamentos/Mês: <strong>{feats.maxAppointmentsMonth ?? 'Ilimitado'}</strong></p>
                          <p>🌐 Página Personalizada: <strong>{feats.customPage ? 'Sim' : 'Não'}</strong></p>
                          <p>📊 Relatórios Avançados: <strong>{feats.reports ? 'Sim' : 'Não'}</strong></p>
                          <p>🤖 Agente de IA: <strong>{feats.aiAgent ? 'Sim' : 'Não'}</strong></p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                        <span className="text-slate-500 text-[10px]">Assinantes: {p._count?.subscriptions || 0}</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleOpenEditPlanModal(p)}
                            className="bg-amber-950 text-amber-300 hover:bg-amber-900 px-2.5 py-1 rounded"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeletePlan(p.id, p.name)}
                            className="bg-red-900/50 text-red-300 hover:bg-red-800 px-2.5 py-1 rounded"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUBTAB: FEATURE TOGGLES */}
          {resSubTab === 'features' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs">
              <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                <h2 className="text-base font-bold text-white">⚙️ Controle de Módulos & Recursos Globais</h2>
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
        </div>
      )}

      {/* Modal: Criar / Editar Plano */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-amber-500">
              {editingPlan ? `Editar Plano: ${editingPlan.name}` : 'Criar Novo Plano de Assinatura'}
            </h3>

            <form onSubmit={handleSavePlanSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Nome do Plano</label>
                <input
                  type="text"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  required
                  placeholder="Ex: Premium Pro"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Descrição</label>
                <input
                  type="text"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  placeholder="Descrição das vantagens..."
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Preço Mensal (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Máx. Barbeiros</label>
                  <input
                    type="number"
                    value={planForm.maxBarbers}
                    onChange={(e) => setPlanForm({ ...planForm, maxBarbers: e.target.value })}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Máx. Agendamentos/Mês</label>
                <input
                  type="number"
                  value={planForm.maxAppointmentsMonth}
                  onChange={(e) => setPlanForm({ ...planForm, maxAppointmentsMonth: e.target.value })}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
              </div>

              <div className="space-y-1 pt-1">
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={planForm.customPage}
                    onChange={(e) => setPlanForm({ ...planForm, customPage: e.target.checked })}
                    className="rounded text-amber-500 bg-slate-800 border-slate-700"
                  />
                  Permite Página Personalizada
                </label>
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={planForm.reports}
                    onChange={(e) => setPlanForm({ ...planForm, reports: e.target.checked })}
                    className="rounded text-amber-500 bg-slate-800 border-slate-700"
                  />
                  Relatórios Avançados
                </label>
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={planForm.aiAgent}
                    onChange={(e) => setPlanForm({ ...planForm, aiAgent: e.target.checked })}
                    className="rounded text-amber-500 bg-slate-800 border-slate-700"
                  />
                  Agente de Atendimento por IA
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-1.5 rounded"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Motivo Desativar Feature */}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          {/* Settings Group Navigation */}
          <div className="space-y-1 bg-slate-900 p-3 border border-slate-800 rounded-xl h-fit">
            <button
              onClick={() => setSettingsGroup('platform')}
              className={`w-full text-left px-3 py-2 rounded font-medium transition ${
                settingsGroup === 'platform' ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              🏢 Dados da Plataforma
            </button>
            <button
              onClick={() => setSettingsGroup('finance')}
              className={`w-full text-left px-3 py-2 rounded font-medium transition ${
                settingsGroup === 'finance' ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              💲 Configurações Financeiras
            </button>
            <button
              onClick={() => setSettingsGroup('booking')}
              className={`w-full text-left px-3 py-2 rounded font-medium transition ${
                settingsGroup === 'booking' ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              📅 Regras de Agendamento
            </button>
            <button
              onClick={() => setSettingsGroup('notifications')}
              className={`w-full text-left px-3 py-2 rounded font-medium transition ${
                settingsGroup === 'notifications' ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              📧 Notificações e Comunicação
            </button>
            <button
              onClick={() => setSettingsGroup('security')}
              className={`w-full text-left px-3 py-2 rounded font-medium transition ${
                settingsGroup === 'security' ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              🔒 Segurança e Acesso
            </button>
            <button
              onClick={() => setSettingsGroup('appearance')}
              className={`w-full text-left px-3 py-2 rounded font-medium transition ${
                settingsGroup === 'appearance' ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              🎨 Aparência e Marca
            </button>
            <button
              onClick={() => setSettingsGroup('system')}
              className={`w-full text-left px-3 py-2 rounded font-medium transition ${
                settingsGroup === 'system' ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              🛠️ Sistema e Manutenção
            </button>
          </div>

          {/* Form */}
          <div className="md:col-span-3 p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-6">
            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* GROUP 1: DADOS DA PLATAFORMA */}
              {settingsGroup === 'platform' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-amber-500 border-b border-slate-800 pb-2">🏢 Dados da Plataforma</h3>
                  <div>
                    <label className="block text-slate-300 mb-1">Nome da Plataforma</label>
                    <input
                      type="text"
                      value={settings.platformName || ''}
                      onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">CNPJ da Operadora</label>
                    <input
                      type="text"
                      value={settings.operatorCnpj || ''}
                      onChange={(e) => setSettings({ ...settings, operatorCnpj: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1">E-mail de Contato Suporte</label>
                      <input
                        type="email"
                        value={settings.supportEmail || ''}
                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Telefone de Atendimento</label>
                      <input
                        type="text"
                        value={settings.phone || ''}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Endereço Completo</label>
                    <input
                      type="text"
                      value={settings.address || ''}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Horário de Atendimento do Suporte</label>
                    <input
                      type="text"
                      value={settings.supportHours || ''}
                      onChange={(e) => setSettings({ ...settings, supportHours: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
              )}

              {/* GROUP 2: FINANCEIRAS */}
              {settingsGroup === 'finance' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-amber-500 border-b border-slate-800 pb-2">💲 Configurações Financeiras</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1">Moeda Padrão</label>
                      <input
                        type="text"
                        value={settings.currency || 'BRL R$'}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Dia do Vencimento das Assinaturas</label>
                      <input
                        type="number"
                        value={settings.billingDueDay || '10'}
                        onChange={(e) => setSettings({ ...settings, billingDueDay: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Taxas e Comissões Globais (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.commissionFee || '5.0'}
                      onChange={(e) => setSettings({ ...settings, commissionFee: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Regras de Reembolso</label>
                    <textarea
                      value={settings.refundRules || ''}
                      onChange={(e) => setSettings({ ...settings, refundRules: e.target.value })}
                      rows={3}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white"
                    />
                  </div>
                </div>
              )}

              {/* GROUP 3: AGENDAMENTO */}
              {settingsGroup === 'booking' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-amber-500 border-b border-slate-800 pb-2">📅 Regras de Agendamento</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1">Tempo Mín. Antecedência (minutos)</label>
                      <input
                        type="number"
                        value={settings.minBookingNoticeMin || '30'}
                        onChange={(e) => setSettings({ ...settings, minBookingNoticeMin: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Tempo Máx. Futuro (dias)</label>
                      <input
                        type="number"
                        value={settings.maxBookingFutureDays || '30'}
                        onChange={(e) => setSettings({ ...settings, maxBookingFutureDays: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1">Horário Padrão de Funcionamento</label>
                      <input
                        type="text"
                        value={settings.defaultOpeningHours || '08:00 - 20:00'}
                        onChange={(e) => setSettings({ ...settings, defaultOpeningHours: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Tolerância Atraso (minutos)</label>
                      <input
                        type="number"
                        value={settings.delayToleranceMin || '15'}
                        onChange={(e) => setSettings({ ...settings, delayToleranceMin: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-2 text-slate-300">
                      <input
                        type="checkbox"
                        checked={settings.blockNationalHolidays !== false}
                        onChange={(e) => setSettings({ ...settings, blockNationalHolidays: e.target.checked })}
                        className="rounded text-amber-500 bg-slate-800 border-slate-700"
                      />
                      Bloquear Agendamentos em Feriados Nacionais por Padrão
                    </label>
                    <label className="flex items-center gap-2 text-slate-300">
                      <input
                        type="checkbox"
                        checked={settings.allowCustomHours !== false}
                        onChange={(e) => setSettings({ ...settings, allowCustomHours: e.target.checked })}
                        className="rounded text-amber-500 bg-slate-800 border-slate-700"
                      />
                      Permitir que Barbearias definam seus próprios horários
                    </label>
                  </div>
                </div>
              )}

              {/* GROUP 4: NOTIFICAÇÕES */}
              {settingsGroup === 'notifications' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-amber-500 border-b border-slate-800 pb-2">📧 Notificações e Comunicação</h3>
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={settings.enableReminders !== false}
                      onChange={(e) => setSettings({ ...settings, enableReminders: e.target.checked })}
                      className="rounded text-amber-500 bg-slate-800 border-slate-700"
                    />
                    Ativar Lembretes Automáticos de Agendamento
                  </label>
                  <div>
                    <label className="block text-slate-300 mb-1">Lembrete com Quantas Horas de Antecedência?</label>
                    <input
                      type="number"
                      value={settings.reminderHoursNotice || '2'}
                      onChange={(e) => setSettings({ ...settings, reminderHoursNotice: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">E-mail de Resposta Automática</label>
                    <input
                      type="email"
                      value={settings.autoReplyEmail || ''}
                      onChange={(e) => setSettings({ ...settings, autoReplyEmail: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Assinatura Padrão dos E-mails</label>
                    <textarea
                      value={settings.emailSignature || ''}
                      onChange={(e) => setSettings({ ...settings, emailSignature: e.target.value })}
                      rows={2}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white"
                    />
                  </div>
                </div>
              )}

              {/* GROUP 5: SEGURANÇA */}
              {settingsGroup === 'security' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-amber-500 border-b border-slate-800 pb-2">🔒 Segurança e Acesso</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1">Inatividade para Encerrar Sessão (min)</label>
                      <input
                        type="number"
                        value={settings.sessionTimeoutMin || '60'}
                        onChange={(e) => setSettings({ ...settings, sessionTimeoutMin: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Máx. Tentativas Login Antes de Bloqueio</label>
                      <input
                        type="number"
                        value={settings.maxLoginAttempts || '5'}
                        onChange={(e) => setSettings({ ...settings, maxLoginAttempts: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-2 text-slate-300">
                      <input
                        type="checkbox"
                        checked={settings.requireEmailVerification !== false}
                        onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                        className="rounded text-amber-500 bg-slate-800 border-slate-700"
                      />
                      Exigir Verificação de E-mail no Cadastro
                    </label>
                  </div>
                </div>
              )}

              {/* GROUP 6: APARÊNCIA */}
              {settingsGroup === 'appearance' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-amber-500 border-b border-slate-800 pb-2">🎨 Aparência e Marca</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1">Cor Principal (Hex)</label>
                      <input
                        type="text"
                        value={settings.primaryColor || '#f59e0b'}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Cor de Destaque / Botões</label>
                      <input
                        type="text"
                        value={settings.accentColor || '#d97706'}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">URL da Logo da Plataforma</label>
                    <input
                      type="text"
                      value={settings.logoUrl || '/logo.png'}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
              )}

              {/* GROUP 7: SISTEMA */}
              {settingsGroup === 'system' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-amber-500 border-b border-slate-800 pb-2">🛠️ Sistema e Manutenção</h3>
                  <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-lg flex items-center justify-between">
                    <div>
                      <strong className="text-white block">Modo Manutenção Geral</strong>
                      <span className="text-slate-400">Impede o acesso externo e exibe a mensagem de manutenção</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode || false}
                      onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      className="w-5 h-5 rounded text-amber-500 bg-slate-900 border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Mensagem do Modo Manutenção</label>
                    <textarea
                      value={settings.maintenanceMessage || ''}
                      onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                      rows={3}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-slate-400">
                    <p>Versão Atual: <strong className="text-amber-400 font-mono">{settings.systemVersion || 'v2.4.0'}</strong></p>
                    <p>Última Atualização: <strong className="text-slate-200">{settings.lastUpdateDate || 'Hoje'}</strong></p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-2 rounded-lg transition"
                >
                  Salvar Configurações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
