import request from 'supertest';
import { app } from '../src/index';
import { generateToken, verifyToken, hashPassword, comparePassword } from '../src/utils/auth';
import { prisma } from '../src/config/prisma';

describe('Auth Utility Tests', () => {
  it('should hash and compare passwords correctly', async () => {
    const raw = 'myPassword123';
    const hashed = await hashPassword(raw);
    expect(hashed).not.toBe(raw);
    const match = await comparePassword(raw, hashed);
    expect(match).toBe(true);
  });

  it('should sign and verify JWT tokens correctly', () => {
    const payload = { userId: '123', email: 'test@barber.com', role: 'CLIENT', barbershopId: 'b1' };
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.barbershopId).toBe(payload.barbershopId);
  });

  it('POST /api/auth/login should return "E-mail não cadastrado" when user does not exist', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);

    const res = await request(app).post('/api/auth/login').send({
      email: 'nonexistent@barber.com',
      password: 'somepassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('E-mail não cadastrado');
  });

  it('POST /api/auth/login should return "Senha incorreta" when password is incorrect', async () => {
    const hashedPassword = await hashPassword('realPassword123');
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
      id: 'u1',
      name: 'Test User',
      email: 'test@barber.com',
      password: hashedPassword,
      phone: null,
      role: 'CLIENT',
      barbershopId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@barber.com',
      password: 'wrongPassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Senha incorreta');
  });
});
