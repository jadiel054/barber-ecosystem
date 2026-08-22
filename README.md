# Barber Ecosystem 💈🚀

**Barber Ecosystem** é uma plataforma SaaS com arquitetura **Multi-tenant** de alta performance para gestão de barbearias, profissionais, clientes e agendamentos.

---

## 📐 Arquitetura do Sistema

O projeto adota uma estrutura de **Monorepo** modular limpa e escalável utilizando `pnpm workspaces`:

```
barber-ecosystem/
├── apps/
│   ├── api/             # Backend API (Node.js + Express + TypeScript)
│   └── web/             # Frontend Client & Dashboard (Next.js App Router + Tailwind CSS)
├── packages/
│   ├── database/        # Camada ORM Prisma com suporte a Neon PostgreSQL Multi-tenant
│   └── types/           # Interfaces DTOs e Tipos TypeScript compartilhados
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

### 🏬 Modelo Multi-Tenant
Todas as tabelas críticas (`User`, `BarberProfile`, `ClientProfile`, `Service`, `Appointment`) possuem isolamento por **Organization / Tenant ID**.
- O contexto do tenant é repassado via **JWT Token** e cabeçalho HTTP `x-tenant-id`.
- Middleware de isolamento garante privacidade de dados entre diferentes barbearias na mesma infraestrutura.

---

## ⚙️ Tecnologias Utilizadas

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend API:** Express.js, Node.js, TypeScript, JWT Auth
- **ORM & Banco de Dados:** Prisma ORM, Neon PostgreSQL (Connection Pooling & Direct Link)
- **Monorepo Management:** pnpm workspaces
- **Testes:** Vitest

---

## 🚀 Como Executar Localmente

### 1. Requisitos Previos
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 2. Instalação de Dependências
```bash
pnpm install
```

### 3. Configuração de Variáveis de Ambiente
Copie o exemplo em `packages/database/.env.example` ou crie os arquivos `.env`:

`packages/database/.env`
```env
DATABASE_URL="postgresql://neondb_owner:sua_senha@ep-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:sua_senha@ep-direct.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

`apps/api/.env`
```env
PORT=4000
JWT_SECRET=super-secret-barber-jwt-key
NODE_ENV=development
```

`apps/web/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 4. Compilar pacotes e rodar a aplicação em desenvolvimento
```bash
# Build das tipagens compartilhadas
pnpm --filter @barber-ecosystem/types build

# Executar Backend API e Frontend em paralelo
pnpm dev
```

---

## 🌐 Deploy Gratuito (Render / Vercel / Neon)

### 1. Banco de Dados (Neon PostgreSQL)
1. Crie uma conta no [Neon.tech](https://neon.tech).
2. Crie um projeto PostgreSQL e obtenha a **Pooled Connection String** e a **Direct Connection String**.
3. Execute as migrações/push com: `pnpm db:push`

### 2. Backend API (Render)
1. Conecte este repositório no [Render](https://render.com).
2. Crie um **Web Service** selecionando o diretório de origem `apps/api`.
3. Configure o comando de Build: `pnpm install && pnpm --filter @barber-ecosystem/types build && pnpm --filter @barber-ecosystem/api build`
4. Configure o comando de Start: `pnpm --filter @barber-ecosystem/api start`
5. Adicione a variável `JWT_SECRET` e a URL de saúde para verificação: `/health`.

### 3. Frontend Dashboard (Vercel)
1. Conecte este repositório na [Vercel](https://vercel.com).
2. Selecione como **Root Directory** a pasta `apps/web`.
3. Adicione a variável de ambiente `NEXT_PUBLIC_API_URL` apontando para a URL da API no Render.
4. Clique em Deploy.

---

## 🧪 Testes

Para rodar os testes unitários e de integração do backend:
```bash
pnpm test
```
