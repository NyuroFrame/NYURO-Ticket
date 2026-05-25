import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { OrganizationsService } from '../organizations.service';
import { CreateOrganizationDomainDto } from './dto/create-organization-domain.dto';

@Injectable()
export class OrganizationDomainsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async create(
    tenantId: string,
    organizationId: string,
    createOrganizationDomainDto: CreateOrganizationDomainDto,
  ) {
    const normalizedTenantId = this.validateTenantId(tenantId);
    const normalizedOrganizationId =
      this.validateOrganizationId(organizationId);
    const domain = this.normalizeDomain(createOrganizationDomainDto?.domain);

    this.validateDomainFormat(domain);
    await this.organizationsService.findOneByTenant(
      normalizedTenantId,
      normalizedOrganizationId,
    );

    const existing = await this.prisma.organizationDomain.findFirst({
      where: { tenantId: normalizedTenantId, domain },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un dominio "${domain}" en este tenant`,
      );
    }

    try {
      return await this.prisma.organizationDomain.create({
        data: {
          tenantId: normalizedTenantId,
          organizationId: normalizedOrganizationId,
          domain,
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException(
          `Ya existe un dominio "${domain}" en este tenant`,
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

    return this.prisma.organizationDomain.findMany({
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
    const normalizedId = this.validateDomainId(id);

    await this.organizationsService.findOneByTenant(
      normalizedTenantId,
      normalizedOrganizationId,
    );

    const organizationDomain = await this.prisma.organizationDomain.findFirst({
      where: {
        id: normalizedId,
        tenantId: normalizedTenantId,
        organizationId: normalizedOrganizationId,
      },
    });

    if (!organizationDomain) {
      throw new NotFoundException(
        `Dominio con id "${normalizedId}" no encontrado en esta organizacion`,
      );
    }

    return organizationDomain;
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

  private validateDomainId(id: string): string {
    if (!id || !id.trim()) {
      throw new BadRequestException('El id del dominio es requerido');
    }

    return id.trim();
  }

  private normalizeDomain(value?: string): string {
    const domain = value?.trim().toLowerCase() ?? '';

    return domain.endsWith('.') ? domain.slice(0, -1) : domain;
  }

  private validateDomainFormat(domain: string): void {
    const domainPattern =
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

    if (!domain) {
      throw new BadRequestException('El dominio es requerido');
    }

    if (
      domain.includes('@') ||
      domain.includes('/') ||
      domain.includes(':') ||
      /\s/.test(domain)
    ) {
      throw new BadRequestException('El formato del dominio no es valido');
    }

    if (!domainPattern.test(domain)) {
      throw new BadRequestException('El formato del dominio no es valido');
    }
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
