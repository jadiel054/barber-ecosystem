import { Router, Response } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { tenantMiddleware, TenantRequest } from '../../middlewares/tenant.middleware';
import { AppointmentStatus } from '@barber-ecosystem/types';

export const appointmentsRouter: Router = Router();

appointmentsRouter.use(authMiddleware);
appointmentsRouter.use(tenantMiddleware);

const mockAppointments = [
  {
    id: 'apt-1',
    organizationId: 'org-demo-123',
    clientProfileId: 'client-1',
    barberProfileId: 'barber-1',
    serviceId: 'srv-1',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 88200000).toISOString(),
    status: AppointmentStatus.CONFIRMED,
    notes: 'Cliente prefere tesoura no topo.'
  }
];

appointmentsRouter.get('/', (req: TenantRequest, res: Response): void => {
  const tenantAppointments = mockAppointments.filter((a) => a.organizationId === req.tenantId);
  res.json({ success: true, data: tenantAppointments });
});

appointmentsRouter.post('/', (req: TenantRequest, res: Response): void => {
  const { clientProfileId, barberProfileId, serviceId, startTime, durationMinutes, notes } = req.body;

  if (!clientProfileId || !barberProfileId || !serviceId || !startTime) {
    res.status(400).json({ success: false, error: 'Missing required appointment fields' });
    return;
  }

  const start = new Date(startTime);
  const duration = durationMinutes ? Number(durationMinutes) : 30;
  const end = new Date(start.getTime() + duration * 60000);

  const newAppointment = {
    id: `apt-${Date.now()}`,
    organizationId: req.tenantId!,
    clientProfileId,
    barberProfileId,
    serviceId,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    status: AppointmentStatus.PENDING,
    notes: notes || null
  };

  mockAppointments.push(newAppointment);
  res.status(201).json({ success: true, data: newAppointment });
});
