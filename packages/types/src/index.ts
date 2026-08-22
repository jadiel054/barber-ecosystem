export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  BARBER = 'BARBER',
  CLIENT = 'CLIENT',
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface OrganizationDTO {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  logoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  organizationId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BarberProfileDTO {
  id: string;
  userId: string;
  organizationId: string;
  bio?: string | null;
  specialties: string[];
  workingHours?: Record<string, { start: string; end: string }> | null;
  isActive: boolean;
  user?: UserDTO;
}

export interface ClientProfileDTO {
  id: string;
  userId: string;
  organizationId: string;
  notes?: string | null;
  user?: UserDTO;
}

export interface ServiceDTO {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

export interface AppointmentDTO {
  id: string;
  organizationId: string;
  clientProfileId: string;
  barberProfileId: string;
  serviceId: string;
  startTime: Date | string;
  endTime: Date | string;
  status: AppointmentStatus;
  notes?: string | null;
  client?: ClientProfileDTO;
  barber?: BarberProfileDTO;
  service?: ServiceDTO;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
