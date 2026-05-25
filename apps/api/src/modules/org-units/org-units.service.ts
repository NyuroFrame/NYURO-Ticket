import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { CreateOrgUnitDto } from './dto/create-org-unit.dto';

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

    const slug = createOrgUnitDto?.slug?.trim()
      ? this.normalizeSlug(createOrgUnitDto.slug)
      : this.normalizeSlug(name);

    if (!slug) {
      throw new BadRequestException('El slug generado no es valido');
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
        slug,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe una unidad con el slug "${slug}" bajo el mismo padre`,
      );
    }

    try {
      return await this.prisma.orgUnit.create({
        data: {
          tenantId: normalizedTenantId,
          organizationId: normalizedOrganizationId,
          name: name.trim(),
          slug,
          ...(normalizedParentId ? { parentId: normalizedParentId } : {}),
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException(
          `Ya existe una unidad con el slug "${slug}" bajo el mismo padre`,
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

  private normalizeSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '');
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
