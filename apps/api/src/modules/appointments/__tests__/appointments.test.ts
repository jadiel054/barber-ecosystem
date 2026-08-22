import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { UserRole } from '@barber-ecosystem/types';

const JWT_SECRET = 'super-secret-barber-jwt-key';

describe('API Multi-Tenancy & Authorization', () => {
  it('should generate and verify multi-tenant JWT tokens correctly', () => {
    const payload = {
      userId: 'user-123',
      email: 'owner@barbershop.com',
      role: UserRole.ADMIN,
      organizationId: 'org-tenant-abc'
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, JWT_SECRET) as typeof payload;

    expect(decoded.organizationId).toBe('org-tenant-abc');
    expect(decoded.role).toBe(UserRole.ADMIN);
    expect(decoded.email).toBe('owner@barbershop.com');
  });
});
