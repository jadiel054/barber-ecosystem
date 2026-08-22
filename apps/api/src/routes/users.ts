import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticate, tenantContext, requireRole, AuthenticatedRequest } from '../middlewares/auth';
import { Role } from '@prisma/client';

export const userRouter = Router();

// Protected: List users (Barbers or Clients) scoped by tenant
userRouter.get('/', authenticate, tenantContext, async (req: AuthenticatedRequest, res, next) => {
  try {
    const barbershopId = req.tenantId || (req.query.barbershopId as string);
    const roleFilter = req.query.role as Role | undefined;

    const whereClause: any = {};
    if (barbershopId) {
      whereClause.barbershopId = barbershopId;
    }
    if (roleFilter && Object.values(Role).includes(roleFilter)) {
      whereClause.role = roleFilter;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        barbershopId: true,
        createdAt: true,
      },
    });

    return res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

// Public: Get barbers of a barbershop
userRouter.get('/barbers/:barbershopId', async (req, res, next) => {
  try {
    const { barbershopId } = req.params;

    const barbers = await prisma.user.findMany({
      where: {
        barbershopId,
        role: Role.BARBER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return res.json({ success: true, data: barbers });
  } catch (err) {
    next(err);
  }
});
