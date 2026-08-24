import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticate, tenantContext, requireRole, AuthenticatedRequest } from '../middlewares/auth';
import { hashPassword, comparePassword } from '../utils/auth';
import { Role } from '@prisma/client';

export const userRouter = Router();

// Protected: Update current user profile (name/phone)
userRouter.patch('/me', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const { name, phone } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name : undefined,
        phone: phone !== undefined ? phone : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        barbershopId: true,
      },
    });

    return res.json({ success: true, data: updatedUser });
  } catch (err) {
    next(err);
  }
});

// Protected: Update current user password
userRouter.patch('/me/password', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current password and new password are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Senha atual incorreta' });
    }

    const newPasswordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: newPasswordHash },
    });

    return res.json({ success: true, message: 'Senha alterada com sucesso' });
  } catch (err) {
    next(err);
  }
});

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
