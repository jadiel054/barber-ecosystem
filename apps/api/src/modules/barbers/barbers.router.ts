import { Router, Response } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { tenantMiddleware, TenantRequest } from '../../middlewares/tenant.middleware';
import { UserRole } from '@barber-ecosystem/types';

export const barbersRouter: Router = Router();

barbersRouter.use(authMiddleware);
barbersRouter.use(tenantMiddleware);

const mockBarbers = [
  {
    id: 'barber-1',
    userId: 'user-barber-1',
    organizationId: 'org-demo-123',
    bio: 'Especialista em cortes clássicos e barba.',
    specialties: ['Corte Tesoura', 'Degradê', 'Barboterapia'],
    isActive: true,
    user: {
      id: 'user-barber-1',
      name: 'João Navalha',
      email: 'barber@vintage.com',
      phone: '(11) 99999-1111',
      role: UserRole.BARBER,
      organizationId: 'org-demo-123'
    }
  }
];

barbersRouter.get('/', (req: TenantRequest, res: Response): void => {
  const tenantBarbers = mockBarbers.filter((b) => b.organizationId === req.tenantId);
  res.json({ success: true, data: tenantBarbers });
});

barbersRouter.post('/', (req: TenantRequest, res: Response): void => {
  const { name, email, bio, specialties } = req.body;

  if (!name || !email) {
    res.status(400).json({ success: false, error: 'Name and email are required' });
    return;
  }

  const newBarber = {
    id: `barber-${Date.now()}`,
    userId: `user-${Date.now()}`,
    organizationId: req.tenantId!,
    bio: bio || '',
    specialties: specialties || [],
    isActive: true,
    user: {
      id: `user-${Date.now()}`,
      name,
      email,
      phone: req.body.phone || null,
      role: UserRole.BARBER,
      organizationId: req.tenantId!
    }
  };

  mockBarbers.push(newBarber);
  res.status(201).json({ success: true, data: newBarber });
});
