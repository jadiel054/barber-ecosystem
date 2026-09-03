import { Router } from 'express';
import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { authenticate, requireRole, AuthenticatedRequest } from '../middlewares/auth';
import { hashPassword } from '../utils/auth';
import { sanitizeCNPJ, isValidCNPJ } from '../utils/cnpj';

export const adminRouter = Router();

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'];

// Default Plans Seeding helper
const DEFAULT_PLANS = [
  {
    name: 'Gratuito',
    description: 'Plano inicial de teste sem custos com recursos essenciais',
    price: 0,
    interval: 'MONTHLY',
    features: { maxBarbers: 1, maxAppointmentsMonth: 50, customPage: false, reports: false },
  },
  {
    name: 'Básico',
    description: 'Ideal para barbearias individuais e pequeno porte',
    price: 49.90,
    interval: 'MONTHLY',
    features: { maxBarbers: 2, maxAppointmentsMonth: 200, customPage: true, reports: false },
  },
  {
    name: 'Premium',
    description: 'Para barbearias em crescimento com suporte completo',
    price: 99.90,
    interval: 'MONTHLY',
    features: { maxBarbers: 5, maxAppointmentsMonth: 1000, customPage: true, reports: true },
  },
  {
    name: 'Pro',
    description: 'Plano ilimitado para redes de barbearias e grandes equipes',
    price: 199.90,
    interval: 'MONTHLY',
    features: { maxBarbers: 999, maxAppointmentsMonth: 99999, customPage: true, reports: true, aiAgent: true },
  },
];

// ==========================================
// 🏢 1. GESTÃO DE BARBEARIAS
// ==========================================

// GET /admin/barbershops — listar barbearias com filtros (status, plano, cidade, busca por nome/slug/cnpj)
adminRouter.get('/barbershops', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { status, city, plan, search } = req.query;

    const where: any = {};

    if (status === 'active') {
      where.active = true;
    } else if (status === 'inactive') {
      where.active = false;
    }

    if (city && typeof city === 'string') {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (search && typeof search === 'string') {
      const cleanSearch = search.trim();
      where.OR = [
        { name: { contains: cleanSearch, mode: 'insensitive' } },
        { slug: { contains: cleanSearch, mode: 'insensitive' } },
        { city: { contains: cleanSearch, mode: 'insensitive' } },
        { cnpj: { contains: sanitizeCNPJ(cleanSearch) } },
        { corporateName: { contains: cleanSearch, mode: 'insensitive' } },
      ];
    }

    if (plan && typeof plan === 'string') {
      where.subscription = {
        plan: {
          name: { contains: plan, mode: 'insensitive' },
        },
      };
    }

    const barbershops = await prisma.barbershop.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
        subscription: {
          include: { plan: true },
        },
        users: {
          select: { id: true, name: true, email: true, role: true },
        },
        _count: {
          select: { services: true, appointments: true, professionals: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: barbershops });
  } catch (err) {
    next(err);
  }
});

// POST /admin/settings/reset — restaurar configurações para o padrão original
adminRouter.post('/settings/reset', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const defaultData = {
      platformName: 'Central de Barbearias',
      operatorCnpj: '00.000.000/0001-99',
      supportEmail: 'suporte@barberecosystem.com.br',
      phone: '(11) 99999-9999',
      address: 'Av. Paulista, 1000 - São Paulo/SP',
      supportHours: 'Segunda a Sexta, das 08h às 18h',
      currency: 'BRL R$',
      paymentMethods: ['PIX', 'CREDIT_CARD', 'BOLETO'],
      billingDueDay: '10',
      refundRules: 'Reembolso proporcional em até 7 dias',
      commissionFee: '5.0',
      minBookingNoticeMin: '30',
      maxBookingFutureDays: '30',
      defaultOpeningHours: '08:00 - 20:00',
      delayToleranceMin: '15',
      blockNationalHolidays: true,
      allowCustomHours: true,
      enableReminders: true,
      reminderHoursNotice: '2',
      autoReplyEmail: 'nao-responda@barberecosystem.com.br',
      emailSignature: 'Atenciosamente, Equipe Barber Ecosystem',
      enableSystemNotifications: true,
      sessionTimeoutMin: '60',
      maxLoginAttempts: '5',
      requireEmailVerification: true,
      forcePasswordChangeDays: '90',
      primaryColor: '#f59e0b',
      accentColor: '#d97706',
      defaultTheme: 'DARK',
      logoUrl: '/logo.png',
      maintenanceMode: false,
      maintenanceMessage: 'Estamos realizando melhorias no sistema. Voltaremos em breve!',
      systemVersion: 'v2.4.0',
      lastUpdateDate: new Date().toLocaleDateString('pt-BR'),
    };

    const settings = await prisma.platformSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        platformName: defaultData.platformName,
        supportEmail: defaultData.supportEmail,
        phone: defaultData.phone,
        maintenanceMode: false,
        footerTexts: defaultData,
      },
      update: {
        platformName: defaultData.platformName,
        supportEmail: defaultData.supportEmail,
        phone: defaultData.phone,
        maintenanceMode: false,
        footerTexts: defaultData,
      },
    });

    return res.json({
      success: true,
      message: 'Configurações restauradas com sucesso para os valores originais',
      data: { settings, defaultValues: defaultData },
    });
  } catch (err) {
    next(err);
  }
});

// POST /admin/barbershops — cadastrar nova barbearia com dados completos + CNPJ
adminRouter.post('/barbershops', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const {
      name,
      slug,
      phone,
      address,
      neighborhood,
      city,
      state,
      zipCode,
      street,
      number,
      email,
      cnpj,
      corporateName,
      cnpjStatus,
      cnpjStatusDate,
      cnpjConsultedAt,
      cnpjSource,
      cnae,
      ownerEmail,
      ownerName,
      planId,
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, error: 'Nome e slug são obrigatórios' });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const existingSlug = await prisma.barbershop.findUnique({ where: { slug: cleanSlug } });
    if (existingSlug) {
      return res.status(400).json({ success: false, error: 'O slug informado já está em uso por outra barbearia' });
    }

    const cleanCnpj = cnpj ? sanitizeCNPJ(cnpj) : null;
    if (cleanCnpj) {
      if (!isValidCNPJ(cleanCnpj)) {
        return res.status(400).json({ success: false, error: 'CNPJ inválido, verifique os dígitos' });
      }

      const existingCnpj = await prisma.barbershop.findUnique({ where: { cnpj: cleanCnpj } });
      if (existingCnpj) {
        return res.status(400).json({ success: false, error: 'CNPJ já cadastrado para outra barbearia' });
      }
    }

    // Process Owner User if provided
    let ownerId: string | undefined = undefined;
    if (ownerEmail) {
      let owner = await prisma.user.findUnique({ where: { email: ownerEmail } });
      if (!owner) {
        const tempPassword = crypto.randomBytes(4).toString('hex');
        const hashedPassword = await hashPassword(tempPassword);

        owner = await prisma.user.create({
          data: {
            email: ownerEmail,
            name: ownerName || name,
            password: hashedPassword,
            role: 'ADMIN',
          },
        });
      }
      ownerId = owner.id;
    }

    const barbershop = await prisma.barbershop.create({
      data: {
        name,
        slug: cleanSlug,
        phone,
        address: address || (street ? `${street}${number ? `, ${number}` : ''}` : undefined),
        neighborhood,
        city,
        state,
        zipCode,
        street,
        number,
        email,
        cnpj: cleanCnpj,
        corporateName,
        cnpjStatus,
        cnpjStatusDate: cnpjStatusDate ? new Date(cnpjStatusDate) : null,
        cnpjConsultedAt: cnpjConsultedAt ? new Date(cnpjConsultedAt) : new Date(),
        cnpjSource: cnpjSource || (cleanCnpj ? 'Receita Federal via API' : null),
        cnae,
        ownerId,
      },
    });

    if (ownerId) {
      await prisma.user.update({
        where: { id: ownerId },
        data: { barbershopId: barbershop.id },
      });
    }

    // Attach plan subscription if specified
    if (planId) {
      const plan = await prisma.plan.findUnique({ where: { id: planId } });
      if (plan) {
        await prisma.subscription.create({
          data: {
            barbershopId: barbershop.id,
            planId: plan.id,
            status: 'ACTIVE',
          },
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Barbearia cadastrada com sucesso',
      data: barbershop,
    });
  } catch (err) {
    next(err);
  }
});

// GET /admin/barbershops/:id — detalhes da barbearia
adminRouter.get('/barbershops/:id', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const barbershop = await prisma.barbershop.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true } },
        subscription: { include: { plan: true } },
        services: true,
        professionals: true,
        users: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!barbershop) {
      return res.status(404).json({ success: false, error: 'Barbearia não encontrada' });
    }

    return res.json({ success: true, data: barbershop });
  } catch (err) {
    next(err);
  }
});

// PUT /admin/barbershops/:id — editar barbearia existente
adminRouter.put('/barbershops/:id', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      phone,
      address,
      neighborhood,
      city,
      state,
      zipCode,
      street,
      number,
      email,
      cnpj,
      corporateName,
      cnpjStatus,
      cnpjStatusDate,
      cnpjConsultedAt,
      cnpjSource,
      cnae,
      planId,
      active,
    } = req.body;

    const existingShop = await prisma.barbershop.findUnique({ where: { id } });
    if (!existingShop) {
      return res.status(404).json({ success: false, error: 'Barbearia não encontrada' });
    }

    let cleanCnpj = cnpj ? sanitizeCNPJ(cnpj) : existingShop.cnpj;
    if (cleanCnpj && cleanCnpj !== existingShop.cnpj) {
      if (!isValidCNPJ(cleanCnpj)) {
        return res.status(400).json({ success: false, error: 'CNPJ inválido, verifique os dígitos' });
      }
      const otherCnpj = await prisma.barbershop.findUnique({ where: { cnpj: cleanCnpj } });
      if (otherCnpj && otherCnpj.id !== id) {
        return res.status(400).json({ success: false, error: 'Este CNPJ já está cadastrado em outra barbearia' });
      }
    }

    const updated = await prisma.barbershop.update({
      where: { id },
      data: {
        name: name || existingShop.name,
        slug: slug ? slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') : existingShop.slug,
        phone: phone !== undefined ? phone : existingShop.phone,
        address: address !== undefined ? address : existingShop.address,
        neighborhood: neighborhood !== undefined ? neighborhood : existingShop.neighborhood,
        city: city !== undefined ? city : existingShop.city,
        state: state !== undefined ? state : existingShop.state,
        zipCode: zipCode !== undefined ? zipCode : existingShop.zipCode,
        street: street !== undefined ? street : existingShop.street,
        number: number !== undefined ? number : existingShop.number,
        email: email !== undefined ? email : existingShop.email,
        cnpj: cleanCnpj,
        corporateName: corporateName !== undefined ? corporateName : existingShop.corporateName,
        cnpjStatus: cnpjStatus !== undefined ? cnpjStatus : existingShop.cnpjStatus,
        cnpjStatusDate: cnpjStatusDate ? new Date(cnpjStatusDate) : existingShop.cnpjStatusDate,
        cnpjConsultedAt: cnpjConsultedAt ? new Date(cnpjConsultedAt) : existingShop.cnpjConsultedAt,
        cnpjSource: cnpjSource !== undefined ? cnpjSource : existingShop.cnpjSource,
        cnae: cnae !== undefined ? cnae : existingShop.cnae,
        active: active !== undefined ? active : existingShop.active,
      },
    });

    if (planId) {
      await prisma.subscription.upsert({
        where: { barbershopId: id },
        create: { barbershopId: id, planId, status: 'ACTIVE' },
        update: { planId, status: 'ACTIVE' },
      });
    }

    return res.json({ success: true, message: 'Barbearia atualizada com sucesso', data: updated });
  } catch (err) {
    next(err);
  }
});

// PATCH /admin/barbershops/:id/status — ativa/desativa/suspende barbearia
adminRouter.patch('/barbershops/:id/status', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (active === undefined || typeof active !== 'boolean') {
      return res.status(400).json({ success: false, error: 'O campo "active" (boolean) é obrigatório' });
    }

    const barbershop = await prisma.barbershop.findUnique({ where: { id } });
    if (!barbershop) {
      return res.status(404).json({ success: false, error: 'Barbearia não encontrada' });
    }

    const updated = await prisma.barbershop.update({
      where: { id },
      data: { active },
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// PATCH /admin/barbershops/:id/plan — alterar plano da barbearia
adminRouter.patch('/barbershops/:id/plan', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ success: false, error: 'O id do plano é obrigatório' });
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plano não encontrado' });
    }

    const subscription = await prisma.subscription.upsert({
      where: { barbershopId: id },
      create: {
        barbershopId: id,
        planId: plan.id,
        status: 'ACTIVE',
      },
      update: {
        planId: plan.id,
        status: 'ACTIVE',
      },
      include: { plan: true },
    });

    return res.json({ success: true, data: subscription });
  } catch (err) {
    next(err);
  }
});

// DELETE /admin/barbershops/:id — excluir barbearia
adminRouter.delete('/barbershops/:id', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const barbershop = await prisma.barbershop.findUnique({ where: { id } });
    if (!barbershop) {
      return res.status(404).json({ success: false, error: 'Barbearia não encontrada' });
    }

    await prisma.barbershop.delete({ where: { id } });

    return res.json({ success: true, message: 'Barbearia excluída com sucesso' });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 👤 2. GESTÃO DE USUÁRIOS & PERFIS DE ACESSO
// ==========================================

// GET /admin/users — listar todos os usuários com filtro por papel/nome
adminRouter.get('/users', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { role, search } = req.query;

    const where: any = {};
    if (role && typeof role === 'string' && role !== 'ALL') {
      where.role = role;
    }

    if (search && typeof search === 'string') {
      const clean = search.trim();
      where.OR = [
        { name: { contains: clean, mode: 'insensitive' } },
        { email: { contains: clean, mode: 'insensitive' } },
        { phone: { contains: clean, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        barbershop: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

// PATCH /admin/users/:id/role — alterar perfil de acesso do usuário
adminRouter.patch('/users/:id/role', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['SUPER_ADMIN', 'ADMIN', 'BARBER', 'CLIENT'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ success: false, error: `Perfil inválido. Use um dos seguintes: ${validRoles.join(', ')}` });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role: role as any },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.json({ success: true, message: 'Perfil do usuário atualizado', data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /admin/users/:id — excluir usuário
adminRouter.delete('/users/:id', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    if (req.user?.userId === id) {
      return res.status(400).json({ success: false, error: 'Você não pode excluir sua própria conta' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }

    await prisma.user.delete({ where: { id } });

    return res.json({ success: true, message: 'Usuário excluído com sucesso' });
  } catch (err) {
    next(err);
  }
});

// POST /admin/users/:id/reset-password — gera senha temporária para proprietário/usuário
adminRouter.post('/users/:id/reset-password', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }

    const tempPassword = crypto.randomBytes(4).toString('hex');
    const hashedPassword = await hashPassword(tempPassword);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return res.json({
      success: true,
      message: 'Senha resetada com sucesso',
      data: {
        tempPassword,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 💎 3. GESTÃO DE PLANOS & LIMITES
// ==========================================

// GET /admin/plans — listar planos e inicializar padrão se vazio
adminRouter.get('/plans', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    let plans = await prisma.plan.findMany({
      include: { _count: { select: { subscriptions: true } } },
      orderBy: { price: 'asc' },
    });

    if (plans.length === 0) {
      for (const def of DEFAULT_PLANS) {
        await prisma.plan.create({ data: def });
      }
      plans = await prisma.plan.findMany({
        include: { _count: { select: { subscriptions: true } } },
        orderBy: { price: 'asc' },
      });
    }

    return res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
});

// POST /admin/plans — criar novo plano
adminRouter.post('/plans', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, description, price, interval, features, active } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: 'Nome e preço são obrigatórios' });
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        interval: interval || 'MONTHLY',
        features: features || {},
        active: active !== undefined ? active : true,
      },
    });

    return res.status(201).json({ success: true, message: 'Plano criado com sucesso', data: plan });
  } catch (err) {
    next(err);
  }
});

// PATCH /admin/plans/:id — editar plano
adminRouter.patch('/plans/:id', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, interval, features, active } = req.body;

    const updated = await prisma.plan.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        interval: interval !== undefined ? interval : undefined,
        features: features !== undefined ? features : undefined,
        active: active !== undefined ? active : undefined,
      },
    });

    return res.json({ success: true, message: 'Plano atualizado', data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /admin/plans/:id — excluir plano
adminRouter.delete('/plans/:id', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const subscriptionsCount = await prisma.subscription.count({ where: { planId: id } });
    if (subscriptionsCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Não é possível excluir este plano pois existem ${subscriptionsCount} barbearia(s) assinante(s). Desative-o em vez de excluir.`,
      });
    }

    await prisma.plan.delete({ where: { id } });

    return res.json({ success: true, message: 'Plano excluído com sucesso' });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 📬 4. CONTATO COM BARBEARIAS & COMUNICADOS
// ==========================================

// GET /admin/contacts — listar mensagens recebidas
adminRouter.get('/contacts', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      include: {
        barbershop: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
});

// PATCH /admin/contacts/:id/reply — responder mensagem de contato
adminRouter.patch('/contacts/:id/reply', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ success: false, error: 'O texto de resposta é obrigatório' });
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        reply,
        status: 'REPLIED',
      },
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// PATCH /admin/contacts/:id/status — alternar status de leitura/pendente
adminRouter.patch('/contacts/:id/status', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status: status || 'READ' },
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// POST /admin/broadcasts — criar/agendar comunicado em massa
adminRouter.post('/broadcasts', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { title, content, targetAudience, scheduledAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Título e conteúdo são obrigatórios' });
    }

    const broadcast = await prisma.broadcastCommunication.create({
      data: {
        title,
        content,
        targetAudience: targetAudience || 'ALL',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        sentAt: scheduledAt ? null : new Date(),
        status: scheduledAt ? 'SCHEDULED' : 'SENT',
      },
    });

    return res.status(201).json({ success: true, data: broadcast });
  } catch (err) {
    next(err);
  }
});

// GET /admin/broadcasts — histórico de comunicados enviados/agendados
adminRouter.get('/broadcasts', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const broadcasts = await prisma.broadcastCommunication.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: broadcasts });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 📢 5. ANÚNCIOS E PROMOÇÕES DA PLATAFORMA
// ==========================================

// GET /admin/announcements — listar anúncios
adminRouter.get('/announcements', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const announcements = await prisma.platformAnnouncement.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: announcements });
  } catch (err) {
    next(err);
  }
});

// POST /admin/announcements — criar anúncio/promoção
adminRouter.post('/announcements', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { title, content, type, couponCode, discountPercent, targetAudience, startDate, endDate, active } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Título e conteúdo são obrigatórios' });
    }

    const announcement = await prisma.platformAnnouncement.create({
      data: {
        title,
        content,
        type: type || 'BANNER',
        couponCode,
        discountPercent: discountPercent ? parseFloat(discountPercent) : null,
        targetAudience: targetAudience || 'ALL',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        active: active !== undefined ? active : true,
      },
    });

    return res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    next(err);
  }
});

// PATCH /admin/announcements/:id — editar anúncio / ativar / desativar
adminRouter.patch('/announcements/:id', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, type, couponCode, discountPercent, targetAudience, startDate, endDate, active } = req.body;

    const updated = await prisma.platformAnnouncement.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        content: content !== undefined ? content : undefined,
        type: type !== undefined ? type : undefined,
        couponCode: couponCode !== undefined ? couponCode : undefined,
        discountPercent: discountPercent !== undefined ? (discountPercent ? parseFloat(discountPercent) : null) : undefined,
        targetAudience: targetAudience !== undefined ? targetAudience : undefined,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
        active: active !== undefined ? active : undefined,
      },
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /admin/announcements/:id — excluir anúncio
adminRouter.delete('/announcements/:id', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    await prisma.platformAnnouncement.delete({ where: { id } });

    return res.json({ success: true, message: 'Anúncio excluído com sucesso' });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// ⚙️ 6. CONTROLE DE FUNCIONALIDADES PREMIUM
// ==========================================

const DEFAULT_FEATURES = [
  { key: 'AI_AGENT', name: 'Agente de IA de Atendimento' },
  { key: 'ADVANCED_REPORTS', name: 'Relatórios avançados e exportação' },
  { key: 'WHATSAPP_INSTAGRAM', name: 'Integração WhatsApp / Instagram' },
  { key: 'ADVANCED_CUSTOMIZATION', name: 'Personalização avançada do site' },
  { key: 'LOYALTY_PROGRAM', name: 'Programa de Fidelidade' },
  { key: 'MULTI_UNIT', name: 'Multi-unidades' },
];

// GET /admin/features — consultar funcionalidades e inicializar padrão
adminRouter.get('/features', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    let features = await prisma.featureToggle.findMany();

    if (features.length === 0) {
      for (const def of DEFAULT_FEATURES) {
        await prisma.featureToggle.create({
          data: {
            key: def.key,
            name: def.name,
            enabled: true,
          },
        });
      }
      features = await prisma.featureToggle.findMany();
    }

    return res.json({ success: true, data: features });
  } catch (err) {
    next(err);
  }
});

// PATCH /admin/features/:key — ativas/desativar funcionalidade
adminRouter.patch('/features/:key', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { key } = req.params;
    const { enabled, reason } = req.body;

    if (enabled === undefined || typeof enabled !== 'boolean') {
      return res.status(400).json({ success: false, error: 'O campo "enabled" (boolean) é obrigatório' });
    }

    const feature = await prisma.featureToggle.upsert({
      where: { key },
      create: {
        key,
        name: DEFAULT_FEATURES.find((f) => f.key === key)?.name || key,
        enabled,
      },
      update: { enabled },
    });

    // Registrar histórico de alteração
    await prisma.featureToggleHistory.create({
      data: {
        featureKey: key,
        action: enabled ? 'ENABLED' : 'DISABLED',
        adminId: req.user?.userId,
        adminEmail: req.user?.email,
        reason: reason || 'Alteração pelo painel de administração',
      },
    });

    return res.json({ success: true, data: feature });
  } catch (err) {
    next(err);
  }
});

// GET /admin/features/history — histórico de alterações de funcionalidades
adminRouter.get('/features/history', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const history = await prisma.featureToggleHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// ⚙️ 7. CONFIGURAÇÕES GERAIS DA PLATAFORMA
// ==========================================

// GET /admin/settings — obter configurações
adminRouter.get('/settings', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    let settings = await prisma.platformSettings.findUnique({ where: { id: 'default' } });

    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: {
          id: 'default',
          platformName: 'Central de Barbearias',
          supportEmail: 'suporte@barberecosystem.com.br',
          maintenanceMode: false,
        },
      });
    }

    const plans = await prisma.plan.findMany();

    return res.json({ success: true, data: { settings, plans } });
  } catch (err) {
    next(err);
  }
});

// PATCH /admin/settings — atualizar configurações e planos
adminRouter.patch('/settings', authenticate, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = req.body;

    const settings = await prisma.platformSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        platformName: body.platformName || 'Central de Barbearias',
        supportEmail: body.supportEmail || 'suporte@barberecosystem.com.br',
        phone: body.phone,
        maintenanceMode: body.maintenanceMode !== undefined ? body.maintenanceMode : false,
        footerTexts: body.footerTexts || body,
        pricingSettings: body.pricingSettings,
      },
      update: {
        platformName: body.platformName !== undefined ? body.platformName : undefined,
        supportEmail: body.supportEmail !== undefined ? body.supportEmail : undefined,
        phone: body.phone !== undefined ? body.phone : undefined,
        maintenanceMode: body.maintenanceMode !== undefined ? body.maintenanceMode : undefined,
        footerTexts: body.footerTexts !== undefined ? body.footerTexts : body,
        pricingSettings: body.pricingSettings !== undefined ? body.pricingSettings : undefined,
      },
    });

    return res.json({ success: true, message: 'Configurações salvas com sucesso', data: settings });
  } catch (err) {
    next(err);
  }
});
