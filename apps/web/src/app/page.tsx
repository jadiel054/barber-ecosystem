import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="py-16 text-center space-y-8">
      <div className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold rounded-full">
        Plataforma Multi-tenant de Barbearias
      </div>

      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto">
        Gestão Inteligente & Agendamento para a sua <span className="text-amber-500">Barbearia</span>
      </h1>

      <p className="text-lg text-slate-400 max-w-2xl mx-auto">
        Conecte seus clientes, barbeiros e a gestão do seu negócio em um único ecossistema moderno e completo.
      </p>

      <div className="flex justify-center gap-4 pt-4">
        <Link
          href="/booking"
          className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-amber-600/20 transition"
        >
          Agendar Horário
        </Link>
        <Link
          href="/register"
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-6 py-3 rounded-lg border border-slate-700 transition"
        >
          Cadastrar Barbearia
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto mt-16">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-2xl mb-2">🏢</div>
          <h3 className="text-lg font-bold text-white mb-2">Multi-tenancy Total</h3>
          <p className="text-slate-400 text-sm">
            Isolamento de dados e personalização por barbearia em um mesmo ecossistema escalável.
          </p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-2xl mb-2">📅</div>
          <h3 className="text-lg font-bold text-white mb-2">Agendamentos Simples</h3>
          <p className="text-slate-400 text-sm">
            Interface intuitiva para seleção de serviço, barbeiro, data e confirmação imediata.
          </p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-2xl mb-2">📊</div>
          <h3 className="text-lg font-bold text-white mb-2">Painel de Gestão</h3>
          <p className="text-slate-400 text-sm">
            Controle total de profissionais, catálogo de serviços e agenda dos clientes.
          </p>
        </div>
      </div>
    </div>
  );
}
