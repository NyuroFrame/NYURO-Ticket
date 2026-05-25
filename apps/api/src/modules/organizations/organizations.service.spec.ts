import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
import { OrganizationsService } from './organizations.service';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let prisma: {
    organization: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let tenantsService: {
    findOne: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      organization: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    };

    tenantsService = {
      findOne: jest.fn().mockResolvedValue({
        id: 'tenant-1',
        name: 'Tenant 1',
        slug: 'tenant-1',
      }),
    };

    service = new OrganizationsService(
      prisma as unknown as PrismaService,
      tenantsService as unknown as TenantsService,
    );
  });

  it('create valida que tenant existe llamando a TenantsService.findOne', async () => {
    const organization = {
      id: 'org-1',
      tenantId: 'tenant-1',
      name: 'Organizacion Principal',
      slug: 'organizacion-principal',
    };
    prisma.organization.findFirst.mockResolvedValue(null);
    prisma.organization.create.mockResolvedValue(organization);

    await expect(
      service.create('tenant-1', { name: 'Organizacion Principal' }),
    ).resolves.toBe(organization);

    expect(tenantsService.findOne).toHaveBeenCalledWith('tenant-1');
  });

  it('create genera slug desde name', async () => {
    const organization = {
      id: 'org-1',
      tenantId: 'tenant-1',
      name: 'Universidad Central',
      slug: 'universidad-central',
    };
    prisma.organization.findFirst.mockResolvedValue(null);
    prisma.organization.create.mockResolvedValue(organization);

    await expect(
      service.create('tenant-1', { name: ' Universidad Central ' }),
    ).resolves.toBe(organization);

    expect(prisma.organization.findFirst).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1', slug: 'universidad-central' },
    });
    expect(prisma.organization.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-1',
        name: 'Universidad Central',
        slug: 'universidad-central',
      },
    });
  });

  it('create normaliza slug explicito', async () => {
    const organization = {
      id: 'org-1',
      tenantId: 'tenant-1',
      name: 'Sede Lima',
      slug: 'sede-lima-norte',
    };
    prisma.organization.findFirst.mockResolvedValue(null);
    prisma.organization.create.mockResolvedValue(organization);

    await expect(
      service.create('tenant-1', {
        name: 'Sede Lima',
        slug: ' Sede L\u00edma -- Norte ',
      }),
    ).resolves.toBe(organization);

    expect(prisma.organization.findFirst).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1', slug: 'sede-lima-norte' },
    });
  });

  it('create lanza BadRequestException si tenantId esta vacio', async () => {
    await expect(
      service.create('   ', { name: 'Organizacion Principal' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tenantsService.findOne).not.toHaveBeenCalled();
    expect(prisma.organization.findFirst).not.toHaveBeenCalled();
    expect(prisma.organization.create).not.toHaveBeenCalled();
  });

  it('create lanza BadRequestException si name esta vacio', async () => {
    await expect(
      service.create('tenant-1', { name: '   ' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tenantsService.findOne).not.toHaveBeenCalled();
    expect(prisma.organization.findFirst).not.toHaveBeenCalled();
    expect(prisma.organization.create).not.toHaveBeenCalled();
  });

  it('create lanza ConflictException si ya existe slug dentro del tenant', async () => {
    prisma.organization.findFirst.mockResolvedValue({
      id: 'org-1',
      tenantId: 'tenant-1',
      name: 'Sede Lima',
      slug: 'sede-lima',
    });

    await expect(
      service.create('tenant-1', { name: 'Sede Lima' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.organization.create).not.toHaveBeenCalled();
  });

  it('create mapea P2002 a ConflictException', async () => {
    prisma.organization.findFirst.mockResolvedValue(null);
    prisma.organization.create.mockRejectedValue({ code: 'P2002' });

    await expect(
      service.create('tenant-1', { name: 'Sede Lima' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('findAllByTenant valida tenant y filtra por tenantId', async () => {
    const organizations = [
      {
        id: 'org-1',
        tenantId: 'tenant-1',
        name: 'Sede Lima',
        slug: 'sede-lima',
      },
    ];
    prisma.organization.findMany.mockResolvedValue(organizations);

    await expect(service.findAllByTenant('tenant-1')).resolves.toBe(
      organizations,
    );

    expect(tenantsService.findOne).toHaveBeenCalledWith('tenant-1');
    expect(prisma.organization.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('findOneByTenant usa id y tenantId', async () => {
    const organization = {
      id: 'org-1',
      tenantId: 'tenant-1',
      name: 'Sede Lima',
      slug: 'sede-lima',
    };
    prisma.organization.findFirst.mockResolvedValue(organization);

    await expect(service.findOneByTenant('tenant-1', 'org-1')).resolves.toBe(
      organization,
    );

    expect(prisma.organization.findFirst).toHaveBeenCalledWith({
      where: { id: 'org-1', tenantId: 'tenant-1' },
    });
  });

  it('findOneByTenant lanza NotFoundException si no existe', async () => {
    prisma.organization.findFirst.mockResolvedValue(null);

    await expect(
      service.findOneByTenant('tenant-1', 'org-missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('no llama a Prisma sin tenantId', async () => {
    await expect(service.findAllByTenant('')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(
      service.findOneByTenant('', 'org-1'),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.organization.findMany).not.toHaveBeenCalled();
    expect(prisma.organization.findFirst).not.toHaveBeenCalled();
  });
});
