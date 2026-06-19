import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { CreateOrgUnitDto } from './dto/create-org-unit.dto';
import { UpdateOrgUnitDto } from './dto/update-org-unit.dto';

@Injectable()
export class OrgUnitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async create(
    tenantId: string,
    organizationId: string,
    createOrgUnitDto: CreateOrgUnitDto,
  ) {
    const normalizedTenantId = this.validateTenantId(tenantId);
    const normalizedOrganizationId =
      this.validateOrganizationId(organizationId);
    const name = createOrgUnitDto?.name;

    if (!name || !name.trim()) {
      throw new BadRequestException('El nombre de la unidad es requerido');
    }

    const normalizedParentId = this.validateOptionalParentId(
      createOrgUnitDto?.parentId,
    );

    await this.organizationsService.findOneByTenant(
      normalizedTenantId,
      normalizedOrganizationId,
    );

    if (normalizedParentId) {
      const parent = await this.prisma.orgUnit.findFirst({
        where: {
          id: normalizedParentId,
          tenantId: normalizedTenantId,
          organizationId: normalizedOrganizationId,
        },
      });

      if (!parent) {
        throw new NotFoundException(
          `Unidad padre con id "${normalizedParentId}" no encontrada en esta organizacion`,
        );
      }
    }

    const existing = await this.prisma.orgUnit.findFirst({
      where: {
        tenantId: normalizedTenantId,
        organizationId: normalizedOrganizationId,
        parentId: normalizedParentId ?? null,
        name: name.trim(),
      },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe una unidad con el nombre "${name.trim()}" bajo el mismo padre`,
      );
    }

    try {
      return await this.prisma.orgUnit.create({
        data: {
          tenantId: normalizedTenantId,
          organizationId: normalizedOrganizationId,
          name: name.trim(),
          ...(normalizedParentId ? { parentId: normalizedParentId } : {}),
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException(
          `Ya existe una unidad con el nombre "${name.trim()}" bajo el mismo padre`,
        );
      }

      throw error;
    }
  }

  async findAllByOrganization(tenantId: string, organizationId: string) {
    const normalizedTenantId = this.validateTenantId(tenantId);
    const normalizedOrganizationId =
      this.validateOrganizationId(organizationId);

    await this.organizationsService.findOneByTenant(
      normalizedTenantId,
      normalizedOrganizationId,
    );

    return this.prisma.orgUnit.findMany({
      where: {
        tenantId: normalizedTenantId,
        organizationId: normalizedOrganizationId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneByOrganization(
    tenantId: string,
    organizationId: string,
    id: string,
  ) {
    const normalizedTenantId = this.validateTenantId(tenantId);
    const normalizedOrganizationId =
      this.validateOrganizationId(organizationId);
    const normalizedId = this.validateOrgUnitId(id);

    await this.organizationsService.findOneByTenant(
      normalizedTenantId,
      normalizedOrganizationId,
    );

    const orgUnit = await this.prisma.orgUnit.findFirst({
      where: {
        id: normalizedId,
        tenantId: normalizedTenantId,
        organizationId: normalizedOrganizationId,
      },
    });

    if (!orgUnit) {
      throw new NotFoundException(
        `Unidad con id "${normalizedId}" no encontrada en esta organizacion`,
      );
    }

    return orgUnit;
  }

  async update(
    tenantId: string,
    organizationId: string,
    id: string,
    dto: UpdateOrgUnitDto,
  ) {
    const normalizedTenantId = this.validateTenantId(tenantId);
    const normalizedOrganizationId = this.validateOrganizationId(organizationId);
    const normalizedId = this.validateOrgUnitId(id);

    await this.organizationsService.findOneByTenant(
      normalizedTenantId,
      normalizedOrganizationId,
    );

    const existing = await this.prisma.orgUnit.findFirst({
      where: {
        id: normalizedId,
        tenantId: normalizedTenantId,
        organizationId: normalizedOrganizationId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Unidad con id "${normalizedId}" no encontrada en esta organizacion`,
      );
    }

    const data: any = {};

    if (dto.name !== undefined) {
      const trimmed = dto.name.trim();
      if (!trimmed) {
        throw new BadRequestException('El nombre de la unidad es requerido');
      }
      data.name = trimmed;
    }

    if (dto.managerName !== undefined) data.managerName = dto.managerName.trim() || null;
    if (dto.description !== undefined) data.description = dto.description.trim() || null;
    if (dto.email !== undefined) data.email = dto.email.trim() || null;
    if (dto.phone !== undefined) data.phone = dto.phone.trim() || null;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    if (dto.parentId !== undefined) {
      if (dto.parentId === null || dto.parentId === '') {
        data.parentId = null;
      } else {
        const parent = await this.prisma.orgUnit.findFirst({
          where: {
            id: dto.parentId,
            tenantId: normalizedTenantId,
            organizationId: normalizedOrganizationId,
          },
        });
        if (!parent) {
          throw new NotFoundException(
            `Unidad padre con id "${dto.parentId}" no encontrada en esta organizacion`,
          );
        }
        data.parentId = dto.parentId;
      }
    }

    if (Object.keys(data).length === 0) {
      return existing;
    }

    return await this.prisma.orgUnit.update({
      where: { id: normalizedId },
      data,
    });
  }

  async remove(tenantId: string, organizationId: string, id: string) {
    const normalizedTenantId = this.validateTenantId(tenantId);
    const normalizedOrganizationId = this.validateOrganizationId(organizationId);
    const normalizedId = this.validateOrgUnitId(id);

    await this.organizationsService.findOneByTenant(
      normalizedTenantId,
      normalizedOrganizationId,
    );

    const existing = await this.prisma.orgUnit.findFirst({
      where: {
        id: normalizedId,
        tenantId: normalizedTenantId,
        organizationId: normalizedOrganizationId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Unidad con id "${normalizedId}" no encontrada en esta organizacion`,
      );
    }

    await this.prisma.orgUnit.delete({
      where: { id: normalizedId },
    });

    return { message: 'Unidad eliminada exitosamente' };
  }

  private validateTenantId(tenantId: string): string {
    if (!tenantId || !tenantId.trim()) {
      throw new BadRequestException('El tenantId es requerido');
    }

    return tenantId.trim();
  }

  private validateOrganizationId(organizationId: string): string {
    if (!organizationId || !organizationId.trim()) {
      throw new BadRequestException('El organizationId es requerido');
    }

    return organizationId.trim();
  }

  private validateOrgUnitId(id: string): string {
    if (!id || !id.trim()) {
      throw new BadRequestException('El id de la unidad es requerido');
    }

    return id.trim();
  }

  private validateOptionalParentId(parentId?: string): string | undefined {
    if (parentId === undefined) {
      return undefined;
    }

    if (!parentId || !parentId.trim()) {
      throw new BadRequestException('El parentId no puede estar vacio');
    }

    return parentId.trim();
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    );
  }
}
