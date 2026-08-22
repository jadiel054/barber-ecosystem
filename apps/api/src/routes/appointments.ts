import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticate, tenantContext, AuthenticatedRequest } from '../middlewares/auth';
import { Role, AppointmentStatus } from '@prisma/client';

export const appointmentRouter = Router();

// Protected: Create appointment
appointmentRouter.post('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { barbershopId, serviceId, barberId, dateTime, notes } = req.body;
    const clientId = req.user?.userId;

    if (!clientId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!barbershopId || !serviceId || !barberId || !dateTime) {
      return res.status(400).json({ success: false, error: 'Barbershop, Service, Barber, and DateTime are required' });
    }

    // Verify service exists
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        barbershopId,
        serviceId,
        barberId,
        clientId,
        dateTime: new Date(dateTime),
        notes,
        status: AppointmentStatus.PENDING,
      },
      include: {
        barbershop: { select: { name: true } },
        service: { select: { name: true, price: true, durationMin: true } },
        barber: { select: { name: true } },
        client: { select: { name: true, email: true, phone: true } },
      },
    });

    return res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
});

// Protected: List appointments for user or tenant
appointmentRouter.get('/', authenticate, tenantContext, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const tenantId = req.tenantId || req.user?.barbershopId;

    let whereClause: any = {};

    if (userRole === Role.CLIENT) {
      whereClause.clientId = userId;
    } else if (userRole === Role.BARBER) {
      whereClause.barberId = userId;
    } else if (userRole === Role.ADMIN && tenantId) {
      whereClause.barbershopId = tenantId;
    } else if (tenantId) {
      whereClause.barbershopId = tenantId;
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        barbershop: { select: { id: true, name: true, slug: true } },
        service: { select: { id: true, name: true, price: true, durationMin: true } },
        barber: { select: { id: true, name: true } },
        client: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { dateTime: 'asc' },
    });

    return res.json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
});

// Protected: Update appointment status
appointmentRouter.patch('/:id/status', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(AppointmentStatus).includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid appointment status' });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
    });

    return res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
});
