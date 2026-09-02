import { PrismaClient, Role, SubscriptionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial database data...');

  const superAdminEmail = process.env.SUPERADMIN_EMAIL || 'admin@barberecosystem.com';
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD || 'trocar-esta-senha-123';
  const superAdminPasswordHash = await bcrypt.hash(superAdminPassword, 10);

  // Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      name: 'Super Admin',
      email: superAdminEmail,
      password: superAdminPasswordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  const passwordHash = await bcrypt.hash('123456', 10);

  // Create Admin / Owner
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vintage.com' },
    update: {},
    create: {
      name: 'Carlos Admin',
      email: 'admin@vintage.com',
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  // Create or Update demo barbershop
  const barbershop = await prisma.barbershop.upsert({
    where: { slug: 'barbearia-vintage' },
    update: {
      ownerId: admin.id,
      neighborhood: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      description: 'A melhor barbearia tradicional da região dos Jardins.',
      openingHours: {
        monday: { open: '09:00', close: '19:00' },
        tuesday: { open: '09:00', close: '19:00' },
        wednesday: { open: '09:00', close: '19:00' },
        thursday: { open: '09:00', close: '19:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '08:00', close: '18:00' },
        sunday: null,
      },
    },
    create: {
      name: 'Barbearia Vintage',
      slug: 'barbearia-vintage',
      phone: '(11) 99999-8888',
      address: 'Rua das Flores, 123',
      neighborhood: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      description: 'A melhor barbearia tradicional da região dos Jardins.',
      ownerId: admin.id,
      openingHours: {
        monday: { open: '09:00', close: '19:00' },
        tuesday: { open: '09:00', close: '19:00' },
        wednesday: { open: '09:00', close: '19:00' },
        thursday: { open: '09:00', close: '19:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '08:00', close: '18:00' },
        sunday: null,
      },
    },
  });

  // Associate admin with barbershop
  await prisma.user.update({
    where: { id: admin.id },
    data: { barbershopId: barbershop.id },
  });

  // Create Barber User
  const barber = await prisma.user.upsert({
    where: { email: 'barber@vintage.com' },
    update: {},
    create: {
      name: 'João Navalha',
      email: 'barber@vintage.com',
      password: passwordHash,
      role: Role.BARBER,
      barbershopId: barbershop.id,
    },
  });

  // Create Professional team member
  const professional = await prisma.professional.upsert({
    where: { userId: barber.id },
    update: {},
    create: {
      name: barber.name,
      email: barber.email,
      phone: '(11) 98888-7777',
      commission: 50.0,
      barbershopId: barbershop.id,
      userId: barber.id,
      workingHours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '19:00' },
        saturday: { open: '08:00', close: '17:00' },
      },
    },
  });

  // Create Client
  const client = await prisma.user.upsert({
    where: { email: 'cliente@gmail.com' },
    update: {},
    create: {
      name: 'Pedro Cliente',
      email: 'cliente@gmail.com',
      password: passwordHash,
      role: Role.CLIENT,
    },
  });

  // Create Service
  const existingService = await prisma.service.findFirst({
    where: { barbershopId: barbershop.id, name: 'Corte de Cabelo + Barba' },
  });

  const service = existingService
    ? existingService
    : await prisma.service.create({
        data: {
          name: 'Corte de Cabelo + Barba',
          description: 'Corte completo tesoura/máquina com toalha quente na barba',
          price: 75.0,
          durationMin: 45,
          barbershopId: barbershop.id,
        },
      });

  // Create Plans
  const planPro = await prisma.plan.upsert({
    where: { id: 'plan-pro' },
    update: {},
    create: {
      id: 'plan-pro',
      name: 'Plano Pro',
      description: 'Acesso completo a gestão de equipe, agenda e IA',
      price: 149.90,
      interval: 'MONTHLY',
      features: ['Gestão de equipe', 'Agente de IA', 'Métricas avançadas', 'Site próprio'],
    },
  });

  // Create Subscription for Barbershop
  await prisma.subscription.upsert({
    where: { barbershopId: barbershop.id },
    update: {},
    create: {
      barbershopId: barbershop.id,
      planId: planPro.id,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
    },
  });

  // Create National Holidays
  const holidayNatal = await prisma.holiday.create({
    data: {
      name: 'Natal',
      date: new Date('2025-12-25'),
      isNational: true,
    },
  });

  // Create Barbershop Holiday
  await prisma.barbershopHoliday.create({
    data: {
      barbershopId: barbershop.id,
      holidayId: holidayNatal.id,
      date: new Date('2025-12-25'),
      description: 'Recesso de Natal da Barbearia',
      isClosed: true,
    },
  });

  // Create Favorite
  await prisma.favorite.upsert({
    where: {
      clientId_barbershopId: {
        clientId: client.id,
        barbershopId: barbershop.id,
      },
    },
    update: {},
    create: {
      clientId: client.id,
      barbershopId: barbershop.id,
    },
  });

  // Create Publication
  await prisma.publication.create({
    data: {
      barbershopId: barbershop.id,
      authorId: admin.id,
      title: 'Novo ambiente renovado!',
      content: 'Venha conhecer as novas instalações da Barbearia Vintage.',
    },
  });

  console.log('Seed completed successfully!', {
    superAdmin,
    barbershop,
    admin,
    barber,
    professional,
    client,
    service,
    planPro,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
