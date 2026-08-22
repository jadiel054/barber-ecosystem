export interface DatabaseConfig {
  databaseUrl?: string;
  directUrl?: string;
}

export interface MockPrismaClient {
  organization: Record<string, unknown>;
  user: Record<string, unknown>;
  barberProfile: Record<string, unknown>;
  clientProfile: Record<string, unknown>;
  service: Record<string, unknown>;
  appointment: Record<string, unknown>;
}

export const createPrismaClient = (): MockPrismaClient => {
  return {
    organization: {},
    user: {},
    barberProfile: {},
    clientProfile: {},
    service: {},
    appointment: {},
  };
};

export const prisma = createPrismaClient();
