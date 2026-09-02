import { Router } from 'express';
import { prisma } from '../config/prisma';

export const publicRouter = Router();

// POST /contacts — Enviar mensagem de contato
publicRouter.post('/contacts', async (req, res, next) => {
  try {
    const { senderName, senderEmail, subject, message, barbershopId } = req.body;

    if (!senderName || !senderEmail || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Nome, e-mail, assunto e mensagem são obrigatórios',
      });
    }

    const contactMsg = await prisma.contactMessage.create({
      data: {
        senderName,
        senderEmail,
        subject,
        message,
        barbershopId: barbershopId || null,
        status: 'PENDING',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Mensagem de contato enviada com sucesso',
      data: contactMsg,
    });
  } catch (err) {
    next(err);
  }
});

// GET /announcements/active — Anúncios e promoções ativas para um determinado público
publicRouter.get('/announcements/active', async (req, res, next) => {
  try {
    const audience = (req.query.audience as string) || 'ALL';
    const now = new Date();

    const announcements = await prisma.platformAnnouncement.findMany({
      where: {
        active: true,
        OR: [{ targetAudience: 'ALL' }, { targetAudience: audience }],
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    // Increment view counts asynchronously
    if (announcements.length > 0) {
      const ids = announcements.map((a) => a.id);
      await prisma.platformAnnouncement.updateMany({
        where: { id: { in: ids } },
        data: { viewsCount: { increment: 1 } },
      });
    }

    return res.json({ success: true, data: announcements });
  } catch (err) {
    next(err);
  }
});

// POST /announcements/:id/use — Incrementa contagem de uso do anúncio/cupom
publicRouter.post('/announcements/:id/use', async (req, res, next) => {
  try {
    const { id } = req.params;

    const announcement = await prisma.platformAnnouncement.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });

    return res.json({ success: true, data: announcement });
  } catch (err) {
    next(err);
  }
});

// GET /features/status — Status de ativado/desativado das funcionalidades
publicRouter.get('/features/status', async (req, res, next) => {
  try {
    const features = await prisma.featureToggle.findMany();
    const statusMap: Record<string, boolean> = {};

    features.forEach((f) => {
      statusMap[f.key] = f.enabled;
    });

    return res.json({ success: true, data: statusMap });
  } catch (err) {
    next(err);
  }
});

// GET /settings/public — Configurações públicas da plataforma
publicRouter.get('/settings/public', async (req, res, next) => {
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

    return res.json({
      success: true,
      data: {
        platformName: settings.platformName,
        supportEmail: settings.supportEmail,
        phone: settings.phone,
        maintenanceMode: settings.maintenanceMode,
        footerTexts: settings.footerTexts,
      },
    });
  } catch (err) {
    next(err);
  }
});
