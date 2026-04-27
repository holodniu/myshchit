import { PrismaClient } from "@prisma/client";

// Singleton-паттерн: один экземпляр Prisma на всё приложение
// (важно для Next.js в dev-режиме, где файлы перезапускаются)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;