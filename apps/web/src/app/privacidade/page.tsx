import Link from 'next/link';

export default function PrivacidadePage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6 text-slate-300">
      <h1 className="text-3xl font-extrabold text-white border-b border-slate-800 pb-4">
        Política de Privacidade (LGPD)
      </h1>

      <p className="text-sm text-slate-400">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-amber-500">1. O que coletamos</h2>
        <p className="leading-relaxed">
          Coletamos dados pessoais estritamente necessários para a prestação e aprimoramento dos nossos serviços, tais como:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-slate-300">
          <li><strong>Dados cadastrais:</strong> Nome completo, e-mail, telefone/WhatsApp.</li>
          <li><strong>Dados de acesso:</strong> Endereço IP, cookies essenciais, registros de data/hora de login.</li>
          <li><strong>Dados de uso do serviço:</strong> Agendamentos efetuados, avaliações, preferências e histórico de atendimentos.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-amber-500">2. Como utilizamos seus dados</h2>
        <p className="leading-relaxed">
          Seus dados são utilizados para:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-slate-300">
          <li>Confirmar e gerenciar agendamentos de serviços nas barbearias.</li>
          <li>Autenticar seu acesso com segurança.</li>
          <li>Enviar lembretes e confirmações de atendimento.</li>
          <li>Fornecer suporte técnico e responder a solicitações.</li>
          <li>Comunicações promocionais e ofertas (somente quando expressamente consentido).</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-amber-500">3. Direitos do Usuário (LGPD - Art. 18)</h2>
        <p className="leading-relaxed">
          Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você possui o direito de:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-slate-300">
          <li><strong>Acessar e Exportar seus dados:</strong> Disponibilizamos a opção "Baixar Meus Dados" na sua área de perfil.</li>
          <li><strong>Corrigir dados incompletos ou inexatos:</strong> Você pode atualizar seus dados diretamente no seu perfil.</li>
          <li><strong>Exclusão de Dados:</strong> Oferecemos o recurso "Excluir Minha Conta", que elimina seus dados pessoais do nosso banco de dados.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-amber-500">4. Retenção e Exclusão de Dados</h2>
        <p className="leading-relaxed">
          Seus dados serão mantidos enquanto seu cadastro estiver ativo. Caso você solicite a exclusão da sua conta, seus dados pessoais serão deletados, mantendo-se apenas registros exigidos por obrigação legal ou fiscal (devidamente anonimizados).
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
