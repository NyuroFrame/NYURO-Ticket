import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { OrgUnitsService } from './org-units.service';

describe('OrgUnitsService', () => {
  let service: OrgUnitsService;
  let prisma: {
    orgUnit: {
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
      orgUnit: {
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

    service = new OrgUnitsService(
      prisma as unknown as PrismaService,
      organizationsService as unknown as OrganizationsService,
    );
  });

  it('create valida que organizacion existe usando OrganizationsService.findOneByTenant', async () => {
    const orgUnit = {
      id: 'unit-1',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      name: 'TI',
      slug: 'ti',
    };
    prisma.orgUnit.findFirst.mockResolvedValue(null);
    prisma.orgUnit.create.mockResolvedValue(orgUnit);

    await expect(
      service.create('tenant-1', 'org-1', { name: 'TI' }),
    ).resolves.toBe(orgUnit);

    expect(organizationsService.findOneByTenant).toHaveBeenCalledWith(
      'tenant-1',
      'org-1',
    );
  });

  it('create genera slug desde name', async () => {
    const orgUnit = {
      id: 'unit-1',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      name: 'Secretaria Academica',
      slug: 'secretaria-academica',
    };
    prisma.orgUnit.findFirst.mockResolvedValue(null);
    prisma.orgUnit.create.mockResolvedValue(orgUnit);

    await expect(
      service.create('tenant-1', 'org-1', { name: ' Secretaria Academica ' }),
    ).resolves.toBe(orgUnit);

    expect(prisma.orgUnit.findFirst).toHaveBeenCalledWith({
      where: {
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        parentId: null,
        slug: 'secretaria-academica',
      },
    });
    expect(prisma.orgUnit.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        name: 'Secretaria Academica',
        slug: 'secretaria-academica',
      },
    });
  });

  it('create normaliza slug explicito', async () => {
    const orgUnit = {
      id: 'unit-1',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      name: 'Sede Lima',
      slug: 'sede-lima-norte',
    };
    prisma.orgUnit.findFirst.mockResolvedValue(null);
    prisma.orgUnit.create.mockResolvedValue(orgUnit);

    await expect(
      service.create('tenant-1', 'org-1', {
        name: 'Sede Lima',
        slug: ' Sede L\u00edma -- Norte ',
      }),
    ).resolves.toBe(orgUnit);

    expect(prisma.orgUnit.findFirst).toHaveBeenCalledWith({
      where: {
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        parentId: null,
        slug: 'sede-lima-norte',
      },
    });
  });

  it('create crea unidad raiz sin parentId', async () => {
    const orgUnit = {
      id: 'unit-1',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      name: 'TI',
      slug: 'ti',
    };
    prisma.orgUnit.findFirst.mockResolvedValue(null);
    prisma.orgUnit.create.mockResolvedValue(orgUnit);

    await expect(
      service.create(' tenant-1 ', ' org-1 ', { name: ' TI ' }),
    ).resolves.toBe(orgUnit);

    expect(prisma.orgUnit.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        name: 'TI',
        slug: 'ti',
      },
    });
  });

  it('create crea unidad hija con parentId valido', async () => {
    const parent = {
      id: 'parent-1',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      name: 'TI',
      slug: 'ti',
    };
    const child = {
      id: 'unit-2',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      parentId: 'parent-1',
      name: 'Soporte',
      slug: 'soporte',
    };
    prisma.orgUnit.findFirst
      .mockResolvedValueOnce(parent)
      .mockResolvedValueOnce(null);
    prisma.orgUnit.create.mockResolvedValue(child);

    await expect(
      service.create('tenant-1', 'org-1', {
        name: 'Soporte',
        parentId: ' parent-1 ',
      }),
    ).resolves.toBe(child);

    expect(prisma.orgUnit.findFirst).toHaveBeenNthCalledWith(1, {
      where: {
        id: 'parent-1',
        tenantId: 'tenant-1',
        organizationId: 'org-1',
      },
    });
    expect(prisma.orgUnit.findFirst).toHaveBeenNthCalledWith(2, {
      where: {
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        parentId: 'parent-1',
        slug: 'soporte',
      },
    });
    expect(prisma.orgUnit.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        name: 'Soporte',
        slug: 'soporte',
        parentId: 'parent-1',
      },
    });
  });

  it('create rechaza tenantId vacio', async () => {
    await expect(
      service.create('   ', 'org-1', { name: 'TI' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(organizationsService.findOneByTenant).not.toHaveBeenCalled();
    expect(prisma.orgUnit.findFirst).not.toHaveBeenCalled();
    expect(prisma.orgUnit.create).not.toHaveBeenCalled();
  });

  it('create rechaza organizationId vacio', async () => {
    await expect(
      service.create('tenant-1', '   ', { name: 'TI' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(organizationsService.findOneByTenant).not.toHaveBeenCalled();
    expect(prisma.orgUnit.findFirst).not.toHaveBeenCalled();
    expect(prisma.orgUnit.create).not.toHaveBeenCalled();
  });

  it('create rechaza name vacio', async () => {
    await expect(
      service.create('tenant-1', 'org-1', { name: '   ' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(organizationsService.findOneByTenant).not.toHaveBeenCalled();
    expect(prisma.orgUnit.findFirst).not.toHaveBeenCalled();
    expect(prisma.orgUnit.create).not.toHaveBeenCalled();
  });

  it('create rechaza slug final vacio', async () => {
    await expect(
      service.create('tenant-1', 'org-1', { name: 'TI', slug: '---' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(organizationsService.findOneByTenant).not.toHaveBeenCalled();
    expect(prisma.orgUnit.findFirst).not.toHaveBeenCalled();
  });

  it('create rechaza parentId vacio si viene como string vacio', async () => {
    await expect(
      service.create('tenant-1', 'org-1', { name: 'Soporte', parentId: '   ' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(organizationsService.findOneByTenant).not.toHaveBeenCalled();
    expect(prisma.orgUnit.findFirst).not.toHaveBeenCalled();
    expect(prisma.orgUnit.create).not.toHaveBeenCalled();
  });

  it('create lanza NotFoundException si parentId no existe dentro de la misma organizacion', async () => {
    prisma.orgUnit.findFirst.mockResolvedValue(null);

    await expect(
      service.create('tenant-1', 'org-1', {
        name: 'Soporte',
        parentId: 'parent-missing',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.orgUnit.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'parent-missing',
        tenantId: 'tenant-1',
        organizationId: 'org-1',
      },
    });
    expect(prisma.orgUnit.create).not.toHaveBeenCalled();
  });

  it('create no permite parentId de otra organizacion porque busca con tenantId y organizationId', async () => {
    prisma.orgUnit.findFirst.mockResolvedValue(null);

    await expect(
      service.create('tenant-1', 'org-1', {
        name: 'Soporte',
        parentId: 'parent-other-org',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.orgUnit.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'parent-other-org',
        tenantId: 'tenant-1',
        organizationId: 'org-1',
      },
    });
  });

  it('create lanza ConflictException si ya existe slug bajo el mismo parent', async () => {
    prisma.orgUnit.findFirst.mockResolvedValue({
      id: 'unit-1',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      name: 'TI',
      slug: 'ti',
    });

    await expect(
      service.create('tenant-1', 'org-1', { name: 'TI' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.orgUnit.create).not.toHaveBeenCalled();
  });

  it('create mapea P2002 a ConflictException', async () => {
    prisma.orgUnit.findFirst.mockResolvedValue(null);
    prisma.orgUnit.create.mockRejectedValue({ code: 'P2002' });

    await expect(
      service.create('tenant-1', 'org-1', { name: 'TI' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('findAllByOrganization valida organizacion y filtra por tenantId y organizationId', async () => {
    const orgUnits = [
      {
        id: 'unit-1',
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        name: 'TI',
        slug: 'ti',
      },
    ];
    prisma.orgUnit.findMany.mockResolvedValue(orgUnits);

    await expect(
      service.findAllByOrganization('tenant-1', 'org-1'),
    ).resolves.toBe(orgUnits);

    expect(organizationsService.findOneByTenant).toHaveBeenCalledWith(
      'tenant-1',
      'org-1',
    );
    expect(prisma.orgUnit.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1', organizationId: 'org-1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('findOneByOrganization usa id, tenantId y organizationId', async () => {
    const orgUnit = {
      id: 'unit-1',
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      name: 'TI',
      slug: 'ti',
    };
    prisma.orgUnit.findFirst.mockResolvedValue(orgUnit);

    await expect(
      service.findOneByOrganization('tenant-1', 'org-1', 'unit-1'),
    ).resolves.toBe(orgUnit);

    expect(prisma.orgUnit.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'unit-1',
        tenantId: 'tenant-1',
        organizationId: 'org-1',
      },
    });
  });

  it('findOneByOrganization lanza NotFoundException si no existe', async () => {
    prisma.orgUnit.findFirst.mockResolvedValue(null);

    await expect(
      service.findOneByOrganization('tenant-1', 'org-1', 'unit-missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('no llama a Prisma sin tenantId', async () => {
    await expect(
      service.findAllByOrganization('', 'org-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.findOneByOrganization('', 'org-1', 'unit-1'),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.orgUnit.findMany).not.toHaveBeenCalled();
    expect(prisma.orgUnit.findFirst).not.toHaveBeenCalled();
  });

  it('no llama a Prisma sin organizationId', async () => {
    await expect(
      service.findAllByOrganization('tenant-1', ''),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.findOneByOrganization('tenant-1', '', 'unit-1'),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.orgUnit.findMany).not.toHaveBeenCalled();
    expect(prisma.orgUnit.findFirst).not.toHaveBeenCalled();
  });
});
