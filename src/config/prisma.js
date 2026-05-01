// Prisma v7 requires a driver adapter for the default "client" engine.
// This uses @prisma/adapter-pg with the pg Pool driver.
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000, // Fail fast if Neon is unreachable
  idleTimeoutMillis: 10000, // Release idle connections back to Neon quickly
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;