import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl">
        <span className="inline-block rounded-full bg-sky-500/10 px-4 py-1.5 text-sm font-semibold text-sky-400 ring-1 ring-inset ring-sky-500/20 mb-6">
          Multi-Tenant Barber SaaS Platform
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl mb-6">
          Barber Ecosystem
        </h1>
        <p className="text-lg text-slate-400 mb-8 leading-relaxed">
          A solução completa para gestão de barbearias, agendamentos online, profissionais e carteira de clientes em escala multi-tenant.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-sky-400 transition"
          >
            Cadastrar Barbearia
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 transition"
          >
            Acessar Painel
          </Link>
        </div>
      </div>
    </main>
  );
}
