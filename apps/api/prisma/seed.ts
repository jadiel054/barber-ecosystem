import { PrismaClient, Role } from '@prisma/client';
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

  // Create demo barbershop
  const barbershop = await prisma.barbershop.upsert({
    where: { slug: 'barbearia-vintage' },
    update: {},
    create: {
      name: 'Barbearia Vintage',
      slug: 'barbearia-vintage',
      phone: '(11) 99999-8888',
      address: 'Rua das Flores, 123 - São Paulo, SP',
    },
  });

  const passwordHash = await bcrypt.hash('123456', 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vintage.com' },
    update: {},
    create: {
      name: 'Carlos Admin',
      email: 'admin@vintage.com',
      password: passwordHash,
      role: Role.ADMIN,
      barbershopId: barbershop.id,
    },
  });

  // Create Barber
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
  const service = await prisma.service.create({
    data: {
      name: 'Corte de Cabelo + Barba',
      description: 'Corte completo tesoura/máquina com toalha quente na barba',
      price: 75.0,
      durationMin: 45,
      barbershopId: barbershop.id,
    },
  });

  console.log('Seed completed successfully!', { superAdmin, barbershop, admin, barber, client, service });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
