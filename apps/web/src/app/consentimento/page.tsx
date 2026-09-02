import Link from 'next/link';

export default function ConsentimentoPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6 text-slate-300">
      <h1 className="text-3xl font-extrabold text-white border-b border-slate-800 pb-4">
        Explicação sobre Consentimentos
      </h1>

      <p className="text-sm text-slate-400">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-amber-500"> Transparência e Autonomia</h2>
        <p className="leading-relaxed">
          Na <strong>Barber Ecosystem</strong>, valorizamos a transparência e a autonomia do usuário sobre seus dados pessoais. Coletamos e processamos dados estritamente com base no seu consentimento informado e nas bases legais da LGPD.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-amber-500"> Tipos de Consentimento Solicitados</h2>

        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
            <h3 className="font-bold text-amber-400">1. Aceite dos Termos de Uso e Política de Privacidade (Obrigatório)</h3>
            <p className="text-sm text-slate-300">
              Necessário para o funcionamento básico da conta, possibilitando a criação de agendamentos e a comunicação essencial do sistema. Sem este consentimento, não é possível utilizar a plataforma.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
            <h3 className="font-bold text-amber-400">2. Comunicações Promocionais e Ofertas (Opcional)</h3>
            <p className="text-sm text-slate-300">
              Autoriza o envio de e-mails ou mensagens com promoções de barbearias, descontos em planos ou novidades da plataforma. Vem desmarcado por padrão e pode ser revogado a qualquer momento.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
            <h3 className="font-bold text-amber-400">3. Cookies Não Essenciais (Opcional)</h3>
            <p className="text-sm text-slate-300">
              Permite o uso de métricas e cookies analíticos para melhorar a navegação e personalizar recursos. É opcional e desmarcado por padrão.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-amber-500"> Como revogar seu consentimento</h2>
        <p className="leading-relaxed">
          Você pode alterar ou revogar suas preferências de consentimento a qualquer momento acessando as configurações do seu perfil na plataforma ou entrando em contato com a nossa equipe de suporte.
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
