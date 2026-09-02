import Link from 'next/link';

export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6 text-slate-300">
      <h1 className="text-3xl font-extrabold text-white border-b border-slate-800 pb-4">
        Política de Cookies
      </h1>

      <p className="text-sm text-slate-400">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-amber-500">1. O que são Cookies?</h2>
        <p className="leading-relaxed">
          Cookies são pequenos arquivos de texto armazenados no seu navegador ou dispositivo quando você visita nosso site. Eles servem para garantir o funcionamento correto da plataforma, guardar preferências do usuário e melhorar a navegação.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-amber-500">2. Tipos de Cookies Utilizados</h2>
        <div className="space-y-3">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
            <h3 className="font-bold text-white mb-1">🔒 Cookies Estritamente Necessários (Essenciais)</h3>
            <p className="text-sm text-slate-400">
              Incapazes de serem desativados. Incluem o cookie de autenticação segura (<code>barber_token</code>) utilizado para manter seu login ativo.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
            <h3 className="font-bold text-white mb-1">⚙️ Cookies de Funcionalidade</h3>
            <p className="text-sm text-slate-400">
              Lembram de preferências do usuário (como tema ou barbearia selecionada) no navegador (<code>localStorage</code>).
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
            <h3 className="font-bold text-white mb-1">📊 Cookies Não Essenciais / Análise</h3>
            <p className="text-sm text-slate-400">
              Opcionais. Coletam dados estatísticos agregados para nos ajudar a entender como os usuários interagem com a plataforma.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-amber-500">3. Gerenciamento de Consentimento</h2>
        <p className="leading-relaxed">
          No momento do cadastro e a qualquer momento em suas configurações, você pode consentir ou revogar o consentimento para cookies não essenciais.
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
