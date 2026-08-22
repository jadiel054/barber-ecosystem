import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Barber Ecosystem | Gestão Multi-tenant para Barbearias',
  description: 'Plataforma SaaS para gestão de agendamentos, clientes e profissionais de barbearias.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-900 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
