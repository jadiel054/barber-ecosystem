'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface Appointment {
  id: string;
  dateTime: string;
  status: string;
  notes?: string;
  barbershop: { name: string };
  service: { name: string; price: number; durationMin: number };
  barber: { name: string };
  client: { name: string; email: string; phone?: string };
}

interface Service {
  id: string;
  name: string;
  price: number;
  durationMin: number;
}

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // New service modal state
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('barber_user');
    const token = localStorage.getItem('barber_token');

    if (!token || !savedUser) {
      window.location.href = '/login';
      return;
    }

    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);

    async function fetchData() {
      const appRes = await apiFetch<Appointment[]>('/appointments', {}, token);
      if (appRes.success && appRes.data) {
        setAppointments(appRes.data);
      }

      if (parsedUser.barbershopId) {
        const srvRes = await apiFetch<Service[]>(`/services?barbershopId=${parsedUser.barbershopId}`, {}, token);
        if (srvRes.success && srvRes.data) {
          setServices(srvRes.data);
        }
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');

    const token = localStorage.getItem('barber_token');
    if (!token || !user?.barbershopId) return;

    const res = await apiFetch<Service>(
      '/services',
      {
        method: 'POST',
        body: JSON.stringify({
          name: newServiceName,
          price: newServicePrice,
          durationMin: newServiceDuration,
          description: newServiceDesc,
        }),
      },
      token,
      user.barbershopId
    );

    if (res.success && res.data) {
      setServices([...services, res.data]);
      setNewServiceName('');
      setNewServicePrice('');
      setNewServiceDesc('');
      setMsg('Serviço criado com sucesso!');
    } else {
      setMsg(res.error || 'Erro ao criar serviço');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('barber_token');
    if (!token) return;

    const res = await apiFetch<Appointment>(
      `/appointments/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
      token
    );

    if (res.success && res.data) {
      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400">Carregando painel...</div>;
  }

  return (
    <div className="space-y-8 my-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-500">Painel de Gestão</h1>
          <p className="text-slate-400 text-sm">
            Bem-vindo, <strong>{user?.name}</strong> ({user?.role})
          </p>
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-slate-300"
        >
          Sair
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500 text-amber-400 rounded-lg text-sm">
          {msg}
        </div>
      )}

      {/* Grid: Appointments & Services Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center justify-between">
            <span>Agendamentos</span>
            <span className="text-xs font-normal text-slate-400">{appointments.length} no total</span>
          </h2>

          {appointments.length === 0 ? (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-center">
              Nenhum agendamento encontrado.
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((app) => (
                <div
                  key={app.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-amber-400">{app.service?.name}</h3>
                      <p className="text-slate-300 text-xs">
                        Cliente: <strong>{app.client?.name}</strong> | Barbeiro: <strong>{app.barber?.name}</strong>
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                        app.status === 'CONFIRMED'
                          ? 'bg-green-500/20 text-green-400'
                          : app.status === 'CANCELLED'
                          ? 'bg-red-500/20 text-red-400'
                          : app.status === 'COMPLETED'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>📅 {new Date(app.dateTime).toLocaleString('pt-BR')}</span>
                    <div className="flex gap-2">
                      {app.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')}
                            className="text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}
                            className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                      {app.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                          className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded"
                        >
                          Concluir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Services Management */}
        {user?.role !== 'CLIENT' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <h2 className="text-lg font-bold text-white">Novo Serviço</h2>
              <form onSubmit={handleCreateService} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nome do Serviço</label>
                  <input
                    type="text"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                    placeholder="Ex: Corte Degradê"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                    placeholder="50.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Duração (minutos)</label>
                  <input
                    type="number"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-2 rounded-lg text-sm"
                >
                  Adicionar Serviço
                </button>
              </form>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <h2 className="text-lg font-bold text-white">Serviços Cadastrados</h2>
              {services.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhum serviço cadastrado.</p>
              ) : (
                <div className="space-y-2">
                  {services.map((srv) => (
                    <div
                      key={srv.id}
                      className="flex justify-between items-center text-sm p-2 bg-slate-800 rounded-lg"
                    >
                      <span className="text-slate-200">{srv.name}</span>
                      <span className="font-bold text-amber-400">R$ {srv.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
