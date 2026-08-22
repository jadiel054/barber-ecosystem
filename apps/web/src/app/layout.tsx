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
      <body className="bg-slate-950 text-slate-100 antialiased font-sans">
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
                className="text-sm bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Cadastrar
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </body>
    </html>
  );
}
