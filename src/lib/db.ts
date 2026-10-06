import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

/**
 * Single Prisma client per process (re-used across hot reloads in dev).
 * Uses the MariaDB driver adapter, which works with both MySQL and MariaDB (Hostinger).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const u = new URL(url);
  const adapter = new PrismaMariaDb({
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    connectionLimit: Number(process.env.DATABASE_POOL_SIZE || 5),
    connectTimeout: 10_000,
    allowPublicKeyRetrieval: true,
    // Cloud MySQL (e.g. TiDB Cloud) requires TLS: add `?ssl=true` to DATABASE_URL.
    ssl: u.searchParams.get("ssl") === "true" ? { rejectUnauthorized: true } : undefined,
  });
  return new PrismaClient({ adapter });
}

export const hasDatabase = Boolean(process.env.DATABASE_URL);

export const db: PrismaClient = hasDatabase
  ? (globalForPrisma.prisma ??= createClient())
  : (new Proxy({} as PrismaClient, {
      get() {
        throw new Error("Database is not configured (DATABASE_URL missing).");
      },
    }) as PrismaClient);
