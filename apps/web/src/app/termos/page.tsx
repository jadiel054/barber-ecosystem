import Link from 'next/link';

export default function TermosPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6 text-slate-300">
      <h1 className="text-3xl font-extrabold text-white border-b border-slate-800 pb-4">
        Termos de Uso
      </h1>

      <p className="text-sm text-slate-400">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-amber-500">1. Aceitação dos Termos</h2>
        <p className="leading-relaxed">
          Ao utilizar a plataforma <strong>Barber Ecosystem</strong> (Central de Barbearias), você concorda integralmente com estes Termos de Uso e com a nossa Política de Privacidade. Caso não concorde com qualquer disposição aqui estabelecida, recomendamos que não utilize nossos serviços.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-amber-500">2. Descrição dos Serviços</h2>
        <p className="leading-relaxed">
          A plataforma é um ecossistema multi-tenant para gestão de barbearias, agendamento de serviços, comunicação e intermediação entre clientes e estabelecimentos parceiros.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-amber-500">3. Cadastro e Segurança</h2>
        <p className="leading-relaxed">
          O usuário se compromete a fornecer informações verdadeiras, exatas e atualizadas durante o cadastro. É responsabilidade exclusiva do usuário manter o sigilo de suas credenciais de acesso (e-mail e senha).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-amber-500">4. Cancelamentos e Agendamentos</h2>
        <p className="leading-relaxed">
          Os agendamentos realizados pela plataforma devem ser respeitados conforme as regras e horários de cada barbearia. Cancelamentos devem ser efetuados com antecedência aceitável através do painel.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-amber-500">5. Modificações nos Termos</h2>
        <p className="leading-relaxed">
          A plataforma reserva-se o direito de alterar estes termos a qualquer momento, notificando os usuários através de comunicados ou atualização desta página.
        </p>
      </section>

      <div className="pt-6 border-t border-slate-800">
        <Link href="/" className="text-amber-500 hover:underline text-sm font-medium">
          ← Voltar para a Página Inicial
        </Link>
      </div>
    </div>
  );
}
