import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/config/prisma';

jest.mock('../src/config/prisma', () => ({
  prisma: {
    platformSettings: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'default',
        platformName: 'Central de Barbearias',
        supportEmail: 'suporte@barberecosystem.com.br',
        maintenanceMode: false,
      }),
      create: jest.fn(),
    },
    contactMessage: {
      create: jest.fn().mockResolvedValue({
        id: 'msg-1',
        senderName: 'João Silva',
        senderEmail: 'joao@example.com',
        subject: 'Dúvida sobre planos',
        message: 'Gostaria de obter informações sobre o plano premium.',
        status: 'PENDING',
      }),
    },
    featureToggle: {
      findMany: jest.fn().mockResolvedValue([
        { key: 'AI_AGENT', name: 'Agente de IA de Atendimento', enabled: true },
      ]),
    },
    platformAnnouncement: {
      findMany: jest.fn().mockResolvedValue([
        { id: 'ann-1', title: 'Promoção de Aniversário', content: '20% de desconto', targetAudience: 'ALL', active: true },
      ]),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  },
}));

describe('LGPD and Admin System Endpoints', () => {
  it('GET /api/settings/public should return public platform configuration', async () => {
    const res = await request(app).get('/api/settings/public');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('platformName');
    expect(res.body.data).toHaveProperty('supportEmail');
  });

  it('POST /api/contacts should submit a public contact message', async () => {
    const contactData = {
      senderName: 'João Silva',
      senderEmail: 'joao@example.com',
      subject: 'Dúvida sobre planos',
      message: 'Gostaria de obter informações sobre o plano premium.',
    };

    const res = await request(app).post('/api/contacts').send(contactData);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.senderName).toBe(contactData.senderName);
    expect(res.body.data.status).toBe('PENDING');
  });

  it('GET /api/features/status should return feature toggles map', async () => {
    const res = await request(app).get('/api/features/status');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data).toBe('object');
    expect(res.body.data.AI_AGENT).toBe(true);
  });

  it('GET /api/announcements/active should return active announcements list', async () => {
    const res = await request(app).get('/api/announcements/active?audience=ALL');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });
});
