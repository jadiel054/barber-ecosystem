import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-white">Painel da Barbearia</h1>
          <p className="text-slate-400 text-sm">Visão geral da sua unidade multi-tenant</p>
        </div>
        <Link href="/" className="text-sm text-slate-400 hover:text-white">
          Sair
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <span className="text-sm text-slate-400">Agendamentos Hoje</span>
          <p className="text-3xl font-bold text-sky-400 mt-2">12</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <span className="text-sm text-slate-400">Profissionais Ativos</span>
          <p className="text-3xl font-bold text-emerald-400 mt-2">4</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <span className="text-sm text-slate-400">Clientes Cadastrados</span>
          <p className="text-3xl font-bold text-amber-400 mt-2">148</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <span className="text-sm text-slate-400">Serviços Oferecidos</span>
          <p className="text-3xl font-bold text-purple-400 mt-2">8</p>
        </div>
      </div>

      <nav className="flex gap-4 mb-8">
        <Link href="/dashboard/appointments" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium">
          Agendamentos
        </Link>
        <Link href="/dashboard/barbers" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium">
          Barbeiros / Profissionais
        </Link>
        <Link href="/dashboard/services" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium">
          Catálogo de Serviços
        </Link>
      </nav>
    </div>
  );
}
