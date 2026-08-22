'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface Barbershop {
  id: string;
  name: string;
  slug: string;
  address?: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMin: number;
}

interface Barber {
  id: string;
  name: string;
}

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [selectedBarbershop, setSelectedBarbershop] = useState<Barbershop | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);

  const [dateTime, setDateTime] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: Fetch Barbershops
  useEffect(() => {
    async function loadBarbershops() {
      const res = await apiFetch<Barbershop[]>('/barbershops');
      if (res.success && res.data) {
        setBarbershops(res.data);
      }
    }
    loadBarbershops();
  }, []);

  // Step 2: Fetch Services and Barbers when Barbershop is selected
  const handleSelectBarbershop = async (shop: Barbershop) => {
    setSelectedBarbershop(shop);
    setStep(2);

    const [servicesRes, barbersRes] = await Promise.all([
      apiFetch<Service[]>(`/services?barbershopId=${shop.id}`),
      apiFetch<Barber[]>(`/users/barbers/${shop.id}`),
    ]);

    if (servicesRes.success && servicesRes.data) {
      setServices(servicesRes.data);
    }
    if (barbersRes.success && barbersRes.data) {
      setBarbers(barbersRes.data);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const token = localStorage.getItem('barber_token');
    if (!token) {
      setErrorMsg('Você precisa estar logado para finalizar o agendamento.');
      setLoading(false);
      return;
    }

    const res = await apiFetch(
      '/appointments',
      {
        method: 'POST',
        body: JSON.stringify({
          barbershopId: selectedBarbershop?.id,
          serviceId: selectedService?.id,
          barberId: selectedBarber?.id,
          dateTime,
          notes,
        }),
      },
      token
    );

    setLoading(false);

    if (res.success) {
      setSuccessMsg('Agendamento realizado com sucesso!');
      setStep(4);
    } else {
      setErrorMsg(res.error || 'Erro ao realizar agendamento');
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-8">
      <h1 className="text-3xl font-bold text-amber-500 mb-8 text-center">
        Agendamento Online
      </h1>

      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 text-sm font-medium text-slate-400">
        <span className={step >= 1 ? 'text-amber-500 font-bold' : ''}>1. Barbearia</span>
        <span>→</span>
        <span className={step >= 2 ? 'text-amber-500 font-bold' : ''}>2. Serviço & Barbeiro</span>
        <span>→</span>
        <span className={step >= 3 ? 'text-amber-500 font-bold' : ''}>3. Data & Horário</span>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: Select Barbershop */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Escolha a Barbearia:</h2>
          {barbershops.length === 0 ? (
            <p className="text-slate-400">Nenhuma barbearia cadastrada no momento.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {barbershops.map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => handleSelectBarbershop(shop)}
                  className="p-5 bg-slate-900 border border-slate-800 hover:border-amber-500 rounded-xl cursor-pointer transition shadow-md"
                >
                  <h3 className="text-lg font-bold text-white">{shop.name}</h3>
                  {shop.address && <p className="text-sm text-slate-400 mt-1">{shop.address}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Select Service & Professional */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">Escolha o Serviço:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => setSelectedService(srv)}
                  className={`p-4 bg-slate-900 border rounded-xl cursor-pointer transition ${
                    selectedService?.id === srv.id
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white">{srv.name}</h3>
                    <span className="text-amber-500 font-bold">R$ {srv.price.toFixed(2)}</span>
                  </div>
                  {srv.description && <p className="text-xs text-slate-400 mt-1">{srv.description}</p>}
                  <p className="text-xs text-slate-500 mt-2">Duração: {srv.durationMin} min</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Escolha o Barbeiro:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {barbers.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBarber(b)}
                  className={`p-4 bg-slate-900 border rounded-xl cursor-pointer text-center transition ${
                    selectedBarber?.id === b.id
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <p className="font-medium text-white">{b.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
            >
              Voltar
            </button>
            <button
              disabled={!selectedService || !selectedBarber}
              onClick={() => setStep(3)}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 disabled:opacity-50 font-medium"
            >
              Avançar
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Confirm Date & Time */}
      {step === 3 && (
        <form onSubmit={handleConfirmBooking} className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold mb-4">Confirmar Agendamento</h2>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-sm space-y-1">
            <p><strong className="text-slate-300">Barbearia:</strong> {selectedBarbershop?.name}</p>
            <p><strong className="text-slate-300">Serviço:</strong> {selectedService?.name} (R$ {selectedService?.price.toFixed(2)})</p>
            <p><strong className="text-slate-300">Profissional:</strong> {selectedBarber?.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Data e Hora</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Observações (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              placeholder="Algum pedido específico?"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={loading || !dateTime}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 disabled:opacity-50 font-medium"
            >
              {loading ? 'Confirmando...' : 'Finalizar Agendamento'}
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: Success Confirmation */}
      {step === 4 && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center space-y-4">
          <div className="text-5xl">🎉</div>
          <h2 className="text-2xl font-bold text-amber-500">{successMsg}</h2>
          <p className="text-slate-300">Seu horáro foi reservado. Você pode acompanhar pelo seu painel.</p>
          <a
            href="/"
            className="inline-block mt-4 bg-amber-600 hover:bg-amber-500 text-white font-medium px-6 py-2.5 rounded-lg"
          >
            Voltar para o Início
          </a>
        </div>
      )}
    </div>
  );
}
