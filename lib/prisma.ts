import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton for database access.
 * In development, we store the client on the global object to prevent
 * multiple instances from being created during hot-reloads.
 * In production, a single instance is created and reused.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Singleton Prisma client — reused across hot-reloads in development */
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
