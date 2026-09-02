# Central de Barbearias — Ecossistema Completo (Barber Ecosystem)

> A maior e mais completa plataforma de gerenciamento, marketplace e agendamento de barbearias do Brasil.

---

## 📋 Visão Geral

O **Central de Barbearias** é uma solução profissional multi-tenant no modelo SaaS que conecta clientes e barbearias.
- **Para o Cliente**: Plataforma fluida para encontrar barbearias, consultar horários disponíveis, agendar serviços, avaliar atendimentos e favoritar estabelecimentos.
- **Para o Barbeiro / Dono**: Painel completo para gerenciar agenda, equipe, comissões, catálogo de serviços, perfil público, feed de notícias/promoções, folgas e assinaturas do sistema.
- **Para o SuperAdmin**: Controle centralizado de barbearias ativas, planos SaaS e métricas globais.

---

## 🏗️ Arquitetura & Tecnologias

O projeto é estruturado como um **Monorepo** com `pnpm`:

```
barber-ecosystem/
├── apps/
│   ├── api/      # Backend RESTful (Express + TypeScript + Prisma ORM + Node.js)
│   └── web/      # Frontend Next.js 14 (App Router + Tailwind CSS + TypeScript)
├── package.json
└── pnpm-workspace.yaml
```

### Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM, JWT (httpOnly cookies), Jest, Supertest
- **Database**: PostgreSQL (Neon Serverless PostgreSQL com pooled e direct connection)
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Gerenciador de Pacotes**: `pnpm`

---

## 🗄️ Modelo de Dados Expandido (Prisma Schema)

O modelo de dados segue as especificações da **Central de Barbearias Blueprint**:

- **`Barbershop`**: Barbearia com dono (`ownerId`), endereço completo (rua, bairro, cidade, estado), foto de logo e capa, descrição e horários de funcionamento (`openingHours`).
- **`User`**: Usuários do sistema com papéis configurados (`SUPER_ADMIN`, `ADMIN`, `BARBER`, `CLIENT`).
- **`Professional`**: Equipe interna da barbearia com taxa de comissão, horários individuais de trabalho (`workingHours`) e vínculo com usuário.
- **`Service`**: Serviços oferecidos (ex: corte, barba), com preço, duração em minutos e vínculo multi-tenant.
- **`Appointment`**: Agendamento de clientes com profissional, serviço, data/hora e status (`PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`).
- **`Holiday` + `BarbershopHoliday`**: Calendário inteligente de feriados nacionais/estaduais e folgas/recessos customizados da barbearia.
- **`Plan` + `Subscription`**: Estrutura SaaS para cobrança recorrente de mensalidades/anuidades das barbearias assinantes.
- **`Review`**: Avaliação com nota e comentários deixados pelos clientes após os atendimentos.
- **`Favorite`**: Barbearias favoritadas pelos clientes para acesso rápido.
- **`Publication`**: Postagens, comunicados e fotos de cortes publicados pelas barbearias.

---

## 🚀 Como Executar o Projeto

### Prerequisitos

- Node.js >= 18.x
- pnpm >= 8.x
- Instância PostgreSQL (ex: Neon DB)

### 1. Clonar o repositório e instalar dependências

```bash
git clone https://github.com/jadiel054/barber-ecosystem.git
cd barber-ecosystem
pnpm install
```

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env` na raiz ou em `apps/api/.env` baseado no `.env.example`:

```env
DATABASE_URL="postgresql://user:password@neon.tech/barber_ecosystem?sslmode=require"
DIRECT_URL="postgresql://user:password@neon.tech/barber_ecosystem?sslmode=require"
PORT=3001
JWT_SECRET="seu-secret-jwt-aqui"
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### 3. Executar o Prisma (Gerar Cliente e Migrações)

```bash
# Gerar Prisma Client
pnpm --filter api exec prisma generate

# Executar Seed (Dados Iniciais)
pnpm --filter api seed
```

### 4. Executar em Modo de Desenvolvimento

```bash
# Executar a API
pnpm --filter api dev

# Executar a Aplicação Web
pnpm --filter web dev
```

A API estará rodando em `http://localhost:3001` e a aplicação Web em `http://localhost:3000`.

---

## 🧪 Testes

Para executar a suíte de testes unitários e de integração do backend:

```bash
pnpm --filter api test
```

Para verificar os tipos e fazer o build de produção da aplicação Web:

```bash
pnpm --filter web build
```

---

## 📌 Principais Módulos do Sistema

1. **Área Pública (Cliente)**:
   - Busca por nome, cidade ou bairro
   - Perfil detalhado da barbearia com fotos, horários, serviços e avaliações
   - Agendamento de horários em tempo real
   - Histórico de agendamentos e estabelecimentos favoritos
2. **Painel do Barbeiro / Dono**:
   - Dashboard com estatísticas e métricas de atendimentos
   - Gestão de agenda e bloqueios
   - Cadastro de equipe (profissionais) e definição de comissões
   - Publicação de fotos e comunicados no feed
   - Gestão de folgas e feriados
3. **Painel SuperAdmin**:
   - Gestão global de barbearias cadastradas
   - Controle de planos SaaS e assinaturas ativas

---

## 📄 Licença

Este projeto é privado e de propriedade da Central de Barbearias.
