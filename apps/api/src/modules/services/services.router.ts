import { Router, Response } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { tenantMiddleware, TenantRequest } from '../../middlewares/tenant.middleware';

export const servicesRouter: Router = Router();

servicesRouter.use(authMiddleware);
servicesRouter.use(tenantMiddleware);

const mockServices = [
  {
    id: 'srv-1',
    organizationId: 'org-demo-123',
    name: 'Corte Masculino',
    description: 'Corte moderno ou tradicional com lavagem.',
    price: 50.0,
    durationMinutes: 30,
    isActive: true
  },
  {
    id: 'srv-2',
    organizationId: 'org-demo-123',
    name: 'Barba Completa',
    description: 'Modelagem com toalha quente e óleo hidratante.',
    price: 40.0,
    durationMinutes: 30,
    isActive: true
  }
];

servicesRouter.get('/', (req: TenantRequest, res: Response): void => {
  const tenantServices = mockServices.filter((s) => s.organizationId === req.tenantId);
  res.json({ success: true, data: tenantServices });
});

servicesRouter.post('/', (req: TenantRequest, res: Response): void => {
  const { name, description, price, durationMinutes } = req.body;

  if (!name || price === undefined || !durationMinutes) {
    res.status(400).json({ success: false, error: 'Name, price, and durationMinutes are required' });
    return;
  }

  const newService = {
    id: `srv-${Date.now()}`,
    organizationId: req.tenantId!,
    name,
    description: description || null,
    price: Number(price),
    durationMinutes: Number(durationMinutes),
    isActive: true
  };

  mockServices.push(newService);
  res.status(201).json({ success: true, data: newService });
});
