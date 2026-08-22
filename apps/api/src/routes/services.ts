import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticate, tenantContext, requireRole, AuthenticatedRequest } from '../middlewares/auth';
import { Role } from '@prisma/client';

export const serviceRouter = Router();

// Public / Tenant-scoped: List services for a barbershop
serviceRouter.get('/', tenantContext, async (req: AuthenticatedRequest, res, next) => {
  try {
    const barbershopId = (req.query.barbershopId as string) || req.tenantId;

    if (!barbershopId) {
      return res.status(400).json({ success: false, error: 'Barbershop ID is required' });
    }

    const services = await prisma.service.findMany({
      where: { barbershopId },
    });

    return res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
});

// Protected (ADMIN/BARBER): Create service
serviceRouter.post('/', authenticate, tenantContext, requireRole(['ADMIN', 'BARBER']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, description, price, durationMin } = req.body;
    const barbershopId = req.tenantId || req.user?.barbershopId;

    if (!barbershopId) {
      return res.status(400).json({ success: false, error: 'Tenant (barbershopId) is required' });
    }

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: 'Name and price are required' });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        durationMin: durationMin ? parseInt(durationMin, 10) : 30,
        barbershopId,
      },
    });

    return res.status(201).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
});
