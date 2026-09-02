import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth';
import { Role } from '@prisma/client';

export const authRouter = Router();

// Register User
authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, phone, role, barbershopId } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);
    const userRole = role && Object.values(Role).includes(role) ? (role as Role) : Role.CLIENT;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        phone,
        role: userRole,
        barbershopId: userRole !== Role.CLIENT ? barbershopId : undefined,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      barbershopId: user.barbershopId,
    });

    res.cookie('barber_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          barbershopId: user.barbershopId,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// Login
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`[Auth Log] Tentativa de login para email: "${email}"`);

    if (!email || !password) {
      console.warn(`[Auth Log] Tentativa de login com campos incompletos.`);
      return res.status(400).json({ success: false, error: 'E-mail e senha são obrigatórios' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.warn(`[Auth Log] E-mail não encontrado no banco de dados: "${email}"`);
      return res.status(401).json({ success: false, error: 'E-mail não cadastrado' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      console.warn(`[Auth Log] Senha incorreta para o email: "${email}"`);
      return res.status(401).json({ success: false, error: 'Senha incorreta' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      barbershopId: user.barbershopId,
    });

    console.log(`[Auth Log] Login bem-sucedido para o email: "${email}" (ID: ${user.id}, Role: ${user.role})`);

    res.cookie('barber_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          barbershopId: user.barbershopId,
        },
      },
    });
  } catch (err) {
    console.error(`[Auth Log] Erro ao processar login:`, err);
    next(err);
  }
});

// Get Current User Profile
authRouter.get('/me', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        barbershopId: true,
        barbershop: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});
