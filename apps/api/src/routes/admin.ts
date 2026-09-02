import { Router } from 'express';
import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { authenticate, requireRole, AuthenticatedRequest } from '../middlewares/auth';
import { hashPassword } from '../utils/auth';

export const adminRouter = Router();

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'];

// ==========================================
// 🏢 1. GESTÃO DE BARBEARIAS
// ==========================================

// GET /admin/barbershops — listar barbearias com filtros (status, plano, cidade, busca por nome/slug)
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
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
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
// 📬 2. CONTATO COM BARBEARIAS & COMUNICADOS
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
// 📢 3. ANÚNCIOS E PROMOÇÕES DA PLATAFORMA
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
// ⚙️ 4. CONTROLE DE FUNCIONALIDADES PREMIUM
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
// ⚙️ 5. CONFIGURAÇÕES GERAIS DA PLATAFORMA
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
    const { platformName, supportEmail, phone, maintenanceMode, footerTexts, pricingSettings } = req.body;

    const settings = await prisma.platformSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        platformName: platformName || 'Central de Barbearias',
        supportEmail: supportEmail || 'suporte@barberecosystem.com.br',
        phone,
        maintenanceMode: maintenanceMode !== undefined ? maintenanceMode : false,
        footerTexts,
        pricingSettings,
      },
      update: {
        platformName: platformName !== undefined ? platformName : undefined,
        supportEmail: supportEmail !== undefined ? supportEmail : undefined,
        phone: phone !== undefined ? phone : undefined,
        maintenanceMode: maintenanceMode !== undefined ? maintenanceMode : undefined,
        footerTexts: footerTexts !== undefined ? footerTexts : undefined,
        pricingSettings: pricingSettings !== undefined ? pricingSettings : undefined,
      },
    });

    return res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
});
