import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { OrganizationsService } from '../organizations.service';
import { OrganizationDomainsService } from './organization-domains.service';

describe('OrganizationDomainsService', () => {
  let service: OrganizationDomainsService;
  let prisma: {
    organizationDomain: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let organizationsService: {
    findOneByTenant: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      organizationDomain: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    };

    organizationsService = {
      findOneByTenant: jest.fn().mockResolvedValue({
        id: 'org-1',
        tenantId: 'tenant-1',
        name: 'Organizacion Principal',
        slug: 'organizacion-principal',
      }),
    };

    service = new OrganizationDomainsService(
      prisma as unknown as PrismaService,
      organizationsService as unknown as OrganizationsService,
    );
  });

  it('create valida que organizacion existe usando OrganizationsService.findOneByTenant', async () => {
    const organizationDomain = {
      id: 'domain-1',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      domain: 'empresa.com',
    };
    prisma.organizationDomain.findFirst.mockResolvedValue(null);
    prisma.organizationDomain.create.mockResolvedValue(organizationDomain);

    await expect(
      service.create('tenant-1', 'org-1', { domain: 'empresa.com' }),
    ).resolves.toBe(organizationDomain);

    expect(organizationsService.findOneByTenant).toHaveBeenCalledWith(
      'tenant-1',
      'org-1',
    );
  });

  it('create guarda dominio normalizado', async () => {
    const organizationDomain = {
      id: 'domain-1',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      domain: 'empresa.com',
    };
    prisma.organizationDomain.findFirst.mockResolvedValue(null);
    prisma.organizationDomain.create.mockResolvedValue(organizationDomain);

    await expect(
      service.create(' tenant-1 ', ' org-1 ', { domain: ' EMPRESA.COM. ' }),
    ).resolves.toBe(organizationDomain);

    expect(prisma.organizationDomain.findFirst).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1', domain: 'empresa.com' },
    });
    expect(prisma.organizationDomain.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        domain: 'empresa.com',
      },
    });
  });

  it('create rechaza tenantId vacio', async () => {
    await expect(
      service.create('   ', 'org-1', { domain: 'empresa.com' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(organizationsService.findOneByTenant).not.toHaveBeenCalled();
    expect(prisma.organizationDomain.findFirst).not.toHaveBeenCalled();
    expect(prisma.organizationDomain.create).not.toHaveBeenCalled();
  });

  it('create rechaza organizationId vacio', async () => {
    await expect(
      service.create('tenant-1', '   ', { domain: 'empresa.com' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(organizationsService.findOneByTenant).not.toHaveBeenCalled();
    expect(prisma.organizationDomain.findFirst).not.toHaveBeenCalled();
    expect(prisma.organizationDomain.create).not.toHaveBeenCalled();
  });

  it('create rechaza domain vacio', async () => {
    await expect(
      service.create('tenant-1', 'org-1', { domain: '   ' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(organizationsService.findOneByTenant).not.toHaveBeenCalled();
    expect(prisma.organizationDomain.findFirst).not.toHaveBeenCalled();
    expect(prisma.organizationDomain.create).not.toHaveBeenCalled();
  });

  it('create rechaza usuario@empresa.com', async () => {
    await expect(
      service.create('tenant-1', 'org-1', { domain: 'usuario@empresa.com' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.organizationDomain.findFirst).not.toHaveBeenCalled();
  });

  it('create rechaza https://empresa.com', async () => {
    await expect(
      service.create('tenant-1', 'org-1', { domain: 'https://empresa.com' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.organizationDomain.findFirst).not.toHaveBeenCalled();
  });

  it('create rechaza empresa.com/path', async () => {
    await expect(
      service.create('tenant-1', 'org-1', { domain: 'empresa.com/path' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.organizationDomain.findFirst).not.toHaveBeenCalled();
  });

  it('create rechaza dominio con formato invalido', async () => {
    await expect(
      service.create('tenant-1', 'org-1', { domain: '-empresa.com' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.create('tenant-1', 'org-1', { domain: 'empresa' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.organizationDomain.findFirst).not.toHaveBeenCalled();
  });

  it('create lanza ConflictException si el dominio ya existe dentro del tenant', async () => {
    prisma.organizationDomain.findFirst.mockResolvedValue({
      id: 'domain-1',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      domain: 'empresa.com',
    });

    await expect(
      service.create('tenant-1', 'org-1', { domain: 'empresa.com' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.organizationDomain.create).not.toHaveBeenCalled();
  });

  it('create mapea P2002 a ConflictException', async () => {
    prisma.organizationDomain.findFirst.mockResolvedValue(null);
    prisma.organizationDomain.create.mockRejectedValue({ code: 'P2002' });

    await expect(
      service.create('tenant-1', 'org-1', { domain: 'empresa.com' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('findAllByOrganization valida organizacion y filtra por tenantId y organizationId', async () => {
    const organizationDomains = [
      {
        id: 'domain-1',
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        domain: 'empresa.com',
      },
    ];
    prisma.organizationDomain.findMany.mockResolvedValue(organizationDomains);

    await expect(
      service.findAllByOrganization('tenant-1', 'org-1'),
    ).resolves.toBe(organizationDomains);

    expect(organizationsService.findOneByTenant).toHaveBeenCalledWith(
      'tenant-1',
      'org-1',
    );
    expect(prisma.organizationDomain.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1', organizationId: 'org-1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('findOneByOrganization usa id, tenantId y organizationId', async () => {
    const organizationDomain = {
      id: 'domain-1',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      domain: 'empresa.com',
    };
    prisma.organizationDomain.findFirst.mockResolvedValue(organizationDomain);

    await expect(
      service.findOneByOrganization('tenant-1', 'org-1', 'domain-1'),
    ).resolves.toBe(organizationDomain);

    expect(prisma.organizationDomain.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'domain-1',
        tenantId: 'tenant-1',
        organizationId: 'org-1',
      },
    });
  });

  it('findOneByOrganization lanza NotFoundException si no existe', async () => {
    prisma.organizationDomain.findFirst.mockResolvedValue(null);

    await expect(
      service.findOneByOrganization('tenant-1', 'org-1', 'domain-missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('no llama a Prisma sin tenantId', async () => {
    await expect(
      service.findAllByOrganization('', 'org-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.findOneByOrganization('', 'org-1', 'domain-1'),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.organizationDomain.findMany).not.toHaveBeenCalled();
    expect(prisma.organizationDomain.findFirst).not.toHaveBeenCalled();
  });

  it('no llama a Prisma sin organizationId', async () => {
    await expect(
      service.findAllByOrganization('tenant-1', ''),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.findOneByOrganization('tenant-1', '', 'domain-1'),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.organizationDomain.findMany).not.toHaveBeenCalled();
    expect(prisma.organizationDomain.findFirst).not.toHaveBeenCalled();
  });
});
