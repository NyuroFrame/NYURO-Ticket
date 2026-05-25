const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function upsertOrgUnit(params) {
  const parentId = params.parentId ?? null;

  const existing = await prisma.orgUnit.findFirst({
    where: {
      tenantId: params.tenantId,
      organizationId: params.organizationId,
      parentId,
      slug: params.slug,
    },
  });

  if (existing) {
    return prisma.orgUnit.update({
      where: { id: existing.id },
      data: {
        name: params.name,
        isActive: true,
      },
    });
  }

  return prisma.orgUnit.create({
    data: {
      tenantId: params.tenantId,
      organizationId: params.organizationId,
      parentId,
      name: params.name,
      slug: params.slug,
      isActive: true,
    },
  });
}

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'nyuro-demo' },
    update: {
      name: 'NYURO Demo',
      isActive: true,
    },
    create: {
      name: 'NYURO Demo',
      slug: 'nyuro-demo',
      isActive: true,
    },
  });

  const organization = await prisma.organization.upsert({
    where: {
      tenantId_slug: {
        tenantId: tenant.id,
        slug: 'organizacion-demo',
      },
    },
    update: {
      name: 'Organizaci\u00f3n Demo',
      isActive: true,
    },
    create: {
      tenantId: tenant.id,
      name: 'Organizaci\u00f3n Demo',
      slug: 'organizacion-demo',
      isActive: true,
    },
  });

  for (const domain of ['demo.local', 'nyuro.test']) {
    await prisma.organizationDomain.upsert({
      where: {
        tenantId_domain: {
          tenantId: tenant.id,
          domain,
        },
      },
      update: {
        organizationId: organization.id,
        isActive: true,
      },
      create: {
        tenantId: tenant.id,
        organizationId: organization.id,
        domain,
        isActive: true,
      },
    });
  }

  const ti = await upsertOrgUnit({
    tenantId: tenant.id,
    organizationId: organization.id,
    name: 'TI',
    slug: 'ti',
  });

  await upsertOrgUnit({
    tenantId: tenant.id,
    organizationId: organization.id,
    parentId: ti.id,
    name: 'Soporte',
    slug: 'soporte',
  });

  await upsertOrgUnit({
    tenantId: tenant.id,
    organizationId: organization.id,
    parentId: ti.id,
    name: 'Infraestructura',
    slug: 'infraestructura',
  });

  await upsertOrgUnit({
    tenantId: tenant.id,
    organizationId: organization.id,
    name: 'Administraci\u00f3n',
    slug: 'administracion',
  });

  console.log('Seed demo M1 completado');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
