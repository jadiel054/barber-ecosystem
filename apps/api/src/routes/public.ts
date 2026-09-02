import { Router } from 'express';
import { prisma } from '../config/prisma';
import { sanitizeCNPJ, isValidCNPJ, formatCNPJ } from '../utils/cnpj';

export const publicRouter = Router();

// GET /cnpj/:cnpj — Validação e consulta pública de CNPJ na Receita Federal
publicRouter.get('/cnpj/:cnpj', async (req, res, next) => {
  try {
    const rawCnpj = req.params.cnpj;
    const cleanCnpj = sanitizeCNPJ(rawCnpj);

    if (!isValidCNPJ(cleanCnpj)) {
      return res.status(400).json({
        success: false,
        error: 'CNPJ inválido, verifique os dígitos',
      });
    }

    let companyData: any = null;
    let source = '';

    // 1. Try BrasilAPI
    try {
      const brasilApiRes = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (brasilApiRes.ok) {
        const data = await brasilApiRes.json();
        source = 'Receita Federal via BrasilAPI';
        const isInactive = (data.descricao_situacao_cadastral || '').toUpperCase() !== 'ATIVA';

        companyData = {
          cnpj: cleanCnpj,
          formattedCnpj: formatCNPJ(cleanCnpj),
          corporateName: data.razao_social || '',
          tradeName: data.nome_fantasia || data.razao_social || '',
          status: data.descricao_situacao_cadastral || 'ATIVA',
          statusDate: data.data_situacao_cadastral || null,
          isInactive,
          zipCode: data.cep || '',
          street: data.logradouro || '',
          number: data.numero || '',
          neighborhood: data.bairro || '',
          city: data.municipio || '',
          state: data.uf || '',
          phone: data.ddd_telefone_1 || data.ddd_telefone_2 || '',
          email: data.email || '',
          cnae: data.cnae_fiscal_descricao ? `${data.cnae_fiscal} - ${data.cnae_fiscal_descricao}` : (data.cnae_fiscal ? String(data.cnae_fiscal) : ''),
          consultedAt: new Date().toISOString(),
          source,
        };
      }
    } catch {
      // Ignore and fallback
    }

    // 2. Fallback to ReceitaWS if BrasilAPI failed
    if (!companyData) {
      try {
        const receitaWsRes = await fetch(`https://receitaws.com.br/v1/cnpj/${cleanCnpj}`);
        if (receitaWsRes.ok) {
          const data = await receitaWsRes.json();
          if (data.status !== 'ERROR') {
            source = 'Receita Federal via ReceitaWS';
            const statusUpper = (data.situacao || '').toUpperCase();
            const isInactive = statusUpper !== 'ATIVA';

            companyData = {
              cnpj: cleanCnpj,
              formattedCnpj: formatCNPJ(cleanCnpj),
              corporateName: data.nome || '',
              tradeName: data.fantasia || data.nome || '',
              status: data.situacao || 'ATIVA',
              statusDate: data.data_situacao || null,
              isInactive,
              zipCode: (data.cep || '').replace(/\D/g, ''),
              street: data.logradouro || '',
              number: data.numero || '',
              neighborhood: data.bairro || '',
              city: data.municipio || '',
              state: data.uf || '',
              phone: data.telefone || '',
              email: data.email || '',
              cnae: Array.isArray(data.atividade_principal) && data.atividade_principal.length > 0
                ? `${data.atividade_principal[0].code} - ${data.atividade_principal[0].text}`
                : '',
              consultedAt: new Date().toISOString(),
              source,
            };
          }
        }
      } catch {
        // Ignore
      }
    }

    if (!companyData) {
      return res.status(404).json({
        success: false,
        error: 'CNPJ não encontrado na base da Receita Federal. Verifique o número ou digite manualmente.',
      });
    }

    return res.json({
      success: true,
      data: companyData,
    });
  } catch (err) {
    next(err);
  }
});

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
