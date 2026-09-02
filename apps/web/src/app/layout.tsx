import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Barber Ecosystem',
  description: 'Plataforma multi-tenant para gestão de barbearias e agendamentos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-slate-100 antialiased font-sans flex flex-col min-h-screen">
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 font-bold text-xl text-amber-500">
              ✂️ Barber Ecosystem
            </a>
            <nav className="flex items-center gap-4">
              <a href="/login" className="text-sm text-slate-300 hover:text-white transition">
                Entrar
              </a>
              <a
                href="/register"
                className="text-sm bg-amber-600 hover:bg-[#e67700] hover:scale-[1.03] active:scale-[0.98] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 ease-in-out"
              >
                Cadastrar
              </a>
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          {children}
        </main>

        <footer className="border-t border-slate-800 bg-slate-900/80 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-slate-400">
              <a href="/termos" className="hover:text-amber-500 transition-colors">
                Termos de Uso
              </a>
              <span className="text-slate-700">•</span>
              <a href="/privacidade" className="hover:text-amber-500 transition-colors">
                Política de Privacidade (LGPD)
              </a>
              <span className="text-slate-700">•</span>
              <a href="/cookies" className="hover:text-amber-500 transition-colors">
                Política de Cookies
              </a>
              <span className="text-slate-700">•</span>
              <a href="/consentimento" className="hover:text-amber-500 transition-colors">
                Consentimentos
              </a>
              <span className="text-slate-700">•</span>
              <a href="mailto:contato@barberecosystem.com.br" className="hover:text-amber-500 transition-colors">
                Contato
              </a>
            </div>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Barber Ecosystem — Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
