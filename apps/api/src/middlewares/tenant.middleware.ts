import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export interface TenantRequest extends AuthenticatedRequest {
  tenantId?: string;
}

export const tenantMiddleware = (req: TenantRequest, res: Response, next: NextFunction): void => {
  const headerTenantId = req.headers['x-tenant-id'] as string | undefined;
  const userTenantId = req.user?.organizationId;

  const tenantId = headerTenantId || userTenantId;

  if (!tenantId) {
    res.status(400).json({ success: false, error: 'Tenant context missing (x-tenant-id header or auth token required)' });
    return;
  }

  req.tenantId = tenantId;
  next();
};
