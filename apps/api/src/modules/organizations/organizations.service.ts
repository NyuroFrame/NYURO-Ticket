import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

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

  async update(tenantId: string, id: string, dto: UpdateOrganizationDto) {
    const normalizedTenantId = this.validateTenantId(tenantId);
    const normalizedId = this.validateOrganizationId(id);
    await this.tenantsService.findOne(normalizedTenantId);

    const existing = await this.prisma.organization.findFirst({
      where: { id: normalizedId, tenantId: normalizedTenantId },
    });

    if (!existing) {
      throw new NotFoundException(
        `Organizacion con id "${normalizedId}" no encontrada en este tenant`,
      );
    }

    const data: {
      name?: string;
      slug?: string;
      code?: string;
      isActive?: boolean;
    } = {};

    if (dto.name !== undefined) {
      const trimmed = dto.name.trim();
      if (!trimmed) {
        throw new BadRequestException('El nombre de la organizacion es requerido');
      }
      data.name = trimmed;
    }

    if (dto.slug !== undefined) {
      const slug = this.normalizeSlug(dto.slug);
      if (!slug) {
        throw new BadRequestException('El slug no es valido');
      }
      if (slug !== existing.slug) {
        const duplicate = await this.prisma.organization.findFirst({
          where: { tenantId: normalizedTenantId, slug },
        });
        if (duplicate) {
          throw new ConflictException(
            `Ya existe una organizacion con el slug "${slug}" en este tenant`,
          );
        }
      }
      data.slug = slug;
    }

    if (dto.code !== undefined) {
      const code = dto.code.trim();
      if (!code) {
        throw new BadRequestException('El codigo de la organizacion es requerido');
      }
      if (code !== existing.code) {
        const duplicate = await this.prisma.organization.findFirst({
          where: { tenantId: normalizedTenantId, code },
        });
        if (duplicate) {
          throw new ConflictException(
            `Ya existe una organizacion con el codigo "${code}" en este tenant`,
          );
        }
      }
      data.code = code;
    }

    if (dto.isActive !== undefined) {
      data.isActive = dto.isActive;
    }

    if (Object.keys(data).length === 0) {
      return existing;
    }

    try {
      return await this.prisma.organization.update({
        where: { id: normalizedId },
        data,
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException(
          `Ya existe una organizacion con el slug "${data.slug ?? existing.slug}" o code "${data.code ?? existing.code}" en este tenant`,
        );
      }
      throw error;
    }
  }

  async remove(tenantId: string, id: string) {
    const normalizedTenantId = this.validateTenantId(tenantId);
    const normalizedId = this.validateOrganizationId(id);
    await this.tenantsService.findOne(normalizedTenantId);

    const existing = await this.prisma.organization.findFirst({
      where: { id: normalizedId, tenantId: normalizedTenantId },
    });

    if (!existing) {
      throw new NotFoundException(
        `Organizacion con id "${normalizedId}" no encontrada en este tenant`,
      );
    }

    await this.prisma.organization.delete({
      where: { id: normalizedId },
    });

    return { message: 'Organizacion eliminada exitosamente' };
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
