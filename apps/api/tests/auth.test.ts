import { generateToken, verifyToken, hashPassword, comparePassword } from '../src/utils/auth';

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
});
