import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantsService: TenantsService,
  ) {}

  async create(tenantId: string, createOrganizationDto: CreateOrganizationDto) {
    const normalizedTenantId = this.validateTenantId(tenantId);
    const { name, slug: rawSlug, code: rawCode } = createOrganizationDto;

    if (!name || !name.trim()) {
      throw new BadRequestException('El nombre de la organizacion es requerido');
    }

    const slug = rawSlug?.trim()
      ? this.normalizeSlug(rawSlug)
      : this.normalizeSlug(name);

    if (!slug) {
      throw new BadRequestException('El slug generado no es valido');
    }

    // Generar code automáticamente si no se proporciona
    const code = rawCode?.trim() || this.generateCode(slug);

    await this.tenantsService.findOne(normalizedTenantId);

    const existing = await this.prisma.organization.findFirst({
      where: { tenantId: normalizedTenantId, slug },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe una organizacion con el slug "${slug}" en este tenant`,
      );
    }

    try {
      return await this.prisma.organization.create({
        data: {
          tenantId: normalizedTenantId,
          name: name.trim(),
          slug,
          code,
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException(
          `Ya existe una organizacion con el slug "${slug}" o code "${code}" en este tenant`,
        );
      }

      throw error;
    }
  }

  async findAllByTenant(tenantId: string) {
    const normalizedTenantId = this.validateTenantId(tenantId);
    await this.tenantsService.findOne(normalizedTenantId);

    return this.prisma.organization.findMany({
      where: { tenantId: normalizedTenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneByTenant(tenantId: string, id: string) {
    const normalizedTenantId = this.validateTenantId(tenantId);
    const normalizedId = this.validateOrganizationId(id);
    await this.tenantsService.findOne(normalizedTenantId);

    const organization = await this.prisma.organization.findFirst({
      where: { id: normalizedId, tenantId: normalizedTenantId },
    });

    if (!organization) {
      throw new NotFoundException(
        `Organizacion con id "${normalizedId}" no encontrada en este tenant`,
      );
    }

    return organization;
  }

  private validateTenantId(tenantId: string): string {
    if (!tenantId || !tenantId.trim()) {
      throw new BadRequestException('El tenantId es requerido');
    }

    return tenantId.trim();
  }

  private validateOrganizationId(id: string): string {
    if (!id || !id.trim()) {
      throw new BadRequestException('El id de la organizacion es requerido');
    }

    return id.trim();
  }

  private generateCode(slug: string): string {
    const random = Math.random().toString(36).substring(2, 6);
    return `${slug}-${random}`;
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
