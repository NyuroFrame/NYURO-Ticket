/**
 * Seed de emergencia: crea (o actualiza) el usuario SUPER_ADMIN inicial.
 *
 * Uso:
 *   DATABASE_URL=<url> pnpm --filter @nyuro/api exec ts-node scripts/seed-super-admin.ts
 *
 * Opcional:
 *   ADMIN_NAME=admin ADMIN_PASSWORD='TuClaveSegura' ...
 *
 * Nota: debe ejecutarse contra la base de datos del entorno objetivo
 * (local o producción). No requiere que existan tenants.
 */
import { PrismaClient } from '@nyuro/database';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const name = process.env.ADMIN_NAME || 'admin';
  const password =
    process.env.ADMIN_PASSWORD || 'NyuroAdmin!2025';
  const mustReset = process.env.ADMIN_MUST_RESET !== 'false';

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está definida');
  }

  const hashed = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findUnique({ where: { name } });

  if (existing) {
    await prisma.user.update({
      where: { name },
      data: {
        password: hashed,
        role: 'SUPER_ADMIN',
        mustResetPassword: mustReset,
      },
    });
    console.log(`[seed] Usuario existente "${name}" actualizado a SUPER_ADMIN`);
  } else {
    await prisma.user.create({
      data: {
        name,
        password: hashed,
        role: 'SUPER_ADMIN',
        mustResetPassword: mustReset,
      },
    });
    console.log(`[seed] SUPER_ADMIN "${name}" creado`);
  }
}

main()
  .catch((err) => {
    console.error('[seed] Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
