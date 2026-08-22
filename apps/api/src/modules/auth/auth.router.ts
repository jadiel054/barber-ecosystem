import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@barber-ecosystem/types';

export const authRouter: Router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-barber-jwt-key';

const mockOrganizations = [
  { id: 'org-demo-123', name: 'Barbearia Vintage', slug: 'barbearia-vintage' }
];

const mockUsers = [
  {
    id: 'user-admin-1',
    email: 'admin@vintage.com',
    passwordHash: 'hashed_password',
    name: 'Carlos Admin',
    role: UserRole.ADMIN,
    organizationId: 'org-demo-123'
  },
  {
    id: 'user-barber-1',
    email: 'barber@vintage.com',
    passwordHash: 'hashed_password',
    name: 'João Navalha',
    role: UserRole.BARBER,
    organizationId: 'org-demo-123'
  }
];

authRouter.post('/register-tenant', (req: Request, res: Response): void => {
  const { organizationName, slug, adminEmail, adminName, password } = req.body;

  if (!organizationName || !slug || !adminEmail || !adminName || !password) {
    res.status(400).json({ success: false, error: 'Missing required fields for tenant registration' });
    return;
  }

  const newOrg = {
    id: `org-${Date.now()}`,
    name: organizationName,
    slug
  };

  const newUser = {
    id: `user-${Date.now()}`,
    email: adminEmail,
    passwordHash: 'hashed_' + password,
    name: adminName,
    role: UserRole.ADMIN,
    organizationId: newOrg.id
  };

  mockOrganizations.push(newOrg);
  mockUsers.push(newUser);

  const token = jwt.sign(
    {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      organizationId: newUser.organizationId
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.status(201).json({
    success: true,
    data: {
      token,
      organization: newOrg,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        organizationId: newUser.organizationId
      }
    }
  });
});

authRouter.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password are required' });
    return;
  }

  const user = mockUsers.find((u) => u.email === email);
  if (!user) {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId
      }
    }
  });
});
