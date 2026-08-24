import { Router } from 'express';
import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { authenticate, requireRole, AuthenticatedRequest } from '../middlewares/auth';
import { hashPassword } from '../utils/auth';
import { Role } from '@prisma/client';

export const adminRouter = Router();

// PATCH /admin/barbershops/:id/status — ativa/desativa uma barbearia
adminRouter.patch('/barbershops/:id/status', authenticate, requireRole(['SUPER_ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (active === undefined || typeof active !== 'boolean') {
      return res.status(400).json({ success: false, error: 'Field "active" (boolean) is required' });
    }

    const barbershop = await prisma.barbershop.findUnique({ where: { id } });
    if (!barbershop) {
      return res.status(404).json({ success: false, error: 'Barbershop not found' });
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

// POST /admin/users/:id/reset-password — gera uma senha temporária aleatória, faz o hash e salva, e retorna essa senha em texto puro
adminRouter.post('/users/:id/reset-password', authenticate, requireRole(['SUPER_ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Generate random 8-character temporary password
    const tempPassword = crypto.randomBytes(4).toString('hex'); // 8 char hex
    const hashedPassword = await hashPassword(tempPassword);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return res.json({
      success: true,
      message: 'Password reset successfully',
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
