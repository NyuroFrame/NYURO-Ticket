import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TenantsService } from './tenants.service';

describe('TenantsService', () => {
  let service: TenantsService;
  let prisma: {
    tenant: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      tenant: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    service = new TenantsService(prisma as unknown as PrismaService);
  });

  it('create genera slug desde name', async () => {
    const tenant = { id: 'tenant-1', name: 'Acme Peru', slug: 'acme-peru' };
    prisma.tenant.findUnique.mockResolvedValue(null);
    prisma.tenant.create.mockResolvedValue(tenant);

    await expect(service.create({ name: ' Acme Peru ' })).resolves.toBe(tenant);

    expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
      where: { slug: 'acme-peru' },
    });
    expect(prisma.tenant.create).toHaveBeenCalledWith({
      data: { name: 'Acme Peru', slug: 'acme-peru' },
    });
  });

  it('create normaliza slug explicito', async () => {
    const tenant = { id: 'tenant-1', name: 'Acme', slug: 'mi-tenant-pe' };
    prisma.tenant.findUnique.mockResolvedValue(null);
    prisma.tenant.create.mockResolvedValue(tenant);

    await expect(
      service.create({ name: 'Acme', slug: ' Mi Ténant -- PE ' }),
    ).resolves.toBe(tenant);

    expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
      where: { slug: 'mi-tenant-pe' },
    });
    expect(prisma.tenant.create).toHaveBeenCalledWith({
      data: { name: 'Acme', slug: 'mi-tenant-pe' },
    });
  });

  it('create lanza BadRequestException si name queda vacio', async () => {
    await expect(service.create({ name: '   ' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.tenant.findUnique).not.toHaveBeenCalled();
    expect(prisma.tenant.create).not.toHaveBeenCalled();
  });

  it('create lanza ConflictException si slug ya existe', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant-1',
      name: 'Acme',
      slug: 'acme',
    });

    await expect(service.create({ name: 'Acme' })).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prisma.tenant.create).not.toHaveBeenCalled();
  });

  it('create mapea P2002 a ConflictException', async () => {
    prisma.tenant.findUnique.mockResolvedValue(null);
    prisma.tenant.create.mockRejectedValue({ code: 'P2002' });

    await expect(service.create({ name: 'Acme' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('findOne lanza NotFoundException si no existe', async () => {
    prisma.tenant.findUnique.mockResolvedValue(null);

    await expect(service.findOne('tenant-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('findBySlug lanza BadRequestException si slug normalizado queda vacio', async () => {
    await expect(service.findBySlug(' !!! ')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.tenant.findUnique).not.toHaveBeenCalled();
  });

  it('findBySlug normaliza slug antes de consultar', async () => {
    const tenant = { id: 'tenant-1', name: 'Acme', slug: 'acme-peru' };
    prisma.tenant.findUnique.mockResolvedValue(tenant);

    await expect(service.findBySlug(' Ácme Perú ')).resolves.toBe(tenant);

    expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
      where: { slug: 'acme-peru' },
    });
  });

  it('findAll consulta ordenando por createdAt desc', async () => {
    const tenants = [{ id: 'tenant-1', name: 'Acme', slug: 'acme' }];
    prisma.tenant.findMany.mockResolvedValue(tenants);

    await expect(service.findAll()).resolves.toBe(tenants);

    expect(prisma.tenant.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
  });
});
