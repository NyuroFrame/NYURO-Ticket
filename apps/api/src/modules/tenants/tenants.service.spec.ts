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
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      tenant: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    service = new TenantsService(prisma as unknown as PrismaService);
  });

  it('create genera slug desde name', async () => {
    const tenant = { id: 'tenant-1', name: 'Acme Peru', slug: 'acme-peru', isActive: true };
    prisma.tenant.findUnique.mockResolvedValue(null);
    prisma.tenant.create.mockResolvedValue(tenant);

    await expect(service.create({ name: ' Acme Peru ' })).resolves.toBe(tenant);

    expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
      where: { slug: 'acme-peru' },
    });
    expect(prisma.tenant.create).toHaveBeenCalledWith({
      data: { name: 'Acme Peru', slug: 'acme-peru', isActive: true },
    });
  });

  it('create normaliza slug explicito', async () => {
    const tenant = { id: 'tenant-1', name: 'Acme', slug: 'mi-tenant-pe', isActive: true };
    prisma.tenant.findUnique.mockResolvedValue(null);
    prisma.tenant.create.mockResolvedValue(tenant);

    await expect(
      service.create({ name: 'Acme', slug: ' Mi Ténant -- PE ' }),
    ).resolves.toBe(tenant);

    expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
      where: { slug: 'mi-tenant-pe' },
    });
    expect(prisma.tenant.create).toHaveBeenCalledWith({
      data: { name: 'Acme', slug: 'mi-tenant-pe', isActive: true },
    });
  });

  it('create permite especificar isActive', async () => {
    const tenant = { id: 'tenant-1', name: 'Acme', slug: 'acme', isActive: false };
    prisma.tenant.findUnique.mockResolvedValue(null);
    prisma.tenant.create.mockResolvedValue(tenant);

    await expect(service.create({ name: 'Acme', isActive: false })).resolves.toBe(tenant);

    expect(prisma.tenant.create).toHaveBeenCalledWith({
      data: { name: 'Acme', slug: 'acme', isActive: false },
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

  it('update actualiza nombre y slug', async () => {
    const existingTenant = { id: 'tenant-1', name: 'Acme', slug: 'acme' };
    const updatedTenant = { id: 'tenant-1', name: 'Acme Corp', slug: 'acme-corp' };
    
    prisma.tenant.findUnique
      .mockResolvedValueOnce(existingTenant)
      .mockResolvedValueOnce(null);
    prisma.tenant.update.mockResolvedValue(updatedTenant);

    await expect(service.update('tenant-1', { name: 'Acme Corp', slug: 'acme-corp' })).resolves.toBe(updatedTenant);

    expect(prisma.tenant.update).toHaveBeenCalledWith({
      where: { id: 'tenant-1' },
      data: { name: 'Acme Corp', slug: 'acme-corp' },
    });
  });

  it('update actualiza isActive', async () => {
    const existingTenant = { id: 'tenant-1', name: 'Acme', slug: 'acme', isActive: true };
    const updatedTenant = { id: 'tenant-1', name: 'Acme', slug: 'acme', isActive: false };
    
    prisma.tenant.findUnique.mockResolvedValue(existingTenant);
    prisma.tenant.update.mockResolvedValue(updatedTenant);

    await expect(service.update('tenant-1', { isActive: false })).resolves.toBe(updatedTenant);

    expect(prisma.tenant.update).toHaveBeenCalledWith({
      where: { id: 'tenant-1' },
      data: { isActive: false },
    });
  });

  it('update lanza NotFoundException si tenant no existe', async () => {
    prisma.tenant.findUnique.mockResolvedValue(null);

    await expect(service.update('tenant-1', { name: 'Acme' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update lanza BadRequestException si name queda vacio', async () => {
    prisma.tenant.findUnique.mockResolvedValue({ id: 'tenant-1', name: 'Acme', slug: 'acme' });

    await expect(service.update('tenant-1', { name: '   ' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('update lanza ConflictException si nuevo slug ya existe', async () => {
    prisma.tenant.findUnique
      .mockResolvedValueOnce({ id: 'tenant-1', name: 'Acme', slug: 'acme' })
      .mockResolvedValueOnce({ id: 'tenant-2', name: 'Other', slug: 'other' });

    await expect(service.update('tenant-1', { slug: 'other' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('remove elimina tenant existente', async () => {
    const tenant = { id: 'tenant-1', name: 'Acme', slug: 'acme' };
    prisma.tenant.findUnique.mockResolvedValue(tenant);
    prisma.tenant.delete.mockResolvedValue(tenant);

    await expect(service.remove('tenant-1')).resolves.toEqual({
      message: 'Tenant "Acme" eliminado correctamente',
    });

    expect(prisma.tenant.delete).toHaveBeenCalledWith({
      where: { id: 'tenant-1' },
    });
  });

  it('remove lanza NotFoundException si tenant no existe', async () => {
    prisma.tenant.findUnique.mockResolvedValue(null);

    await expect(service.remove('tenant-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
