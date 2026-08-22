import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticate, requireRole, AuthenticatedRequest } from '../middlewares/auth';
import { Role } from '@prisma/client';

export const barbershopRouter = Router();

// Public: List all barbershops
barbershopRouter.get('/', async (req, res, next) => {
  try {
    const barbershops = await prisma.barbershop.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        phone: true,
        address: true,
        logoUrl: true,
      },
    });
    return res.json({ success: true, data: barbershops });
  } catch (err) {
    next(err);
  }
});

// Public: Get barbershop details by ID or Slug
barbershopRouter.get('/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    const barbershop = await prisma.barbershop.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        services: true,
        users: {
          where: { role: Role.BARBER },
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!barbershop) {
      return res.status(404).json({ success: false, error: 'Barbershop not found' });
    }

    return res.json({ success: true, data: barbershop });
  } catch (err) {
    next(err);
  }
});

// Protected (Admin): Create a barbershop
barbershopRouter.post('/', authenticate, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, slug, phone, address, logoUrl } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, error: 'Name and slug are required' });
    }

    const existingSlug = await prisma.barbershop.findUnique({ where: { slug } });
    if (existingSlug) {
      return res.status(400).json({ success: false, error: 'Barbershop slug already in use' });
    }

    const barbershop = await prisma.barbershop.create({
      data: { name, slug, phone, address, logoUrl },
    });

    // Update admin user to be associated with this barbershop if not associated yet
    if (req.user?.userId) {
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { barbershopId: barbershop.id },
      });
    }

    return res.status(201).json({ success: true, data: barbershop });
  } catch (err) {
    next(err);
  }
});
