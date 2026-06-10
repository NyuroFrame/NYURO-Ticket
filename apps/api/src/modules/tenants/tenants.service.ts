import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateTenantWithOwnerDto } from './dto/create-tenant-with-owner.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    const { name, slug: rawSlug, isActive } = createTenantDto;

    if (!name || !name.trim()) {
      throw new BadRequestException('El nombre del tenant es requerido');
    }

    const slug = rawSlug?.trim()
      ? this.normalizeSlug(rawSlug)
      : this.normalizeSlug(name);

    if (!slug) {
      throw new BadRequestException('El slug generado no es valido');
    }

    const existing = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Ya existe un tenant con el slug "${slug}"`);
    }

    try {
      return await this.prisma.tenant.create({
        data: {
          name: name.trim(),
          slug,
          isActive: isActive ?? true,
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException(`Ya existe un tenant con el slug "${slug}"`);
      }

      throw error;
    }
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant con id "${id}" no encontrado`);
    }
    return tenant;
  }

  async findBySlug(slug: string) {
    const normalized = this.normalizeSlug(slug);
    if (!normalized) {
      throw new BadRequestException('El slug del tenant es requerido');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: normalized },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant con slug "${slug}" no encontrado`);
    }
    return tenant;
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

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant con id "${id}" no encontrado`);
    }

    const data: any = {};

    if (updateTenantDto.name !== undefined) {
      if (!updateTenantDto.name.trim()) {
        throw new BadRequestException('El nombre del tenant no puede estar vacio');
      }
      data.name = updateTenantDto.name.trim();
    }

    if (updateTenantDto.slug !== undefined) {
      const normalizedSlug = this.normalizeSlug(updateTenantDto.slug);
      if (!normalizedSlug) {
        throw new BadRequestException('El slug no es valido');
      }
      if (normalizedSlug !== tenant.slug) {
        const existing = await this.prisma.tenant.findUnique({
          where: { slug: normalizedSlug },
        });
        if (existing) {
          throw new ConflictException(`Ya existe un tenant con el slug "${normalizedSlug}"`);
        }
      }
      data.slug = normalizedSlug;
    }

    if (updateTenantDto.isActive !== undefined) {
      data.isActive = updateTenantDto.isActive;
    }

    try {
      return await this.prisma.tenant.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException(`Ya existe un tenant con el slug "${data.slug}"`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant con id "${id}" no encontrado`);
    }

    await this.prisma.tenant.delete({ where: { id } });
    return { message: `Tenant "${tenant.name}" eliminado correctamente` };
  }

  async createWithOwner(dto: CreateTenantWithOwnerDto) {
    const { tenantName, tenantSlug, isActive, ownerName } = dto;

    if (!tenantName || !tenantName.trim()) {
      throw new BadRequestException('El nombre del tenant es requerido');
    }
    if (!ownerName || !ownerName.trim()) {
      throw new BadRequestException('El nombre del owner es requerido');
    }

    const slug = tenantSlug?.trim()
      ? this.normalizeSlug(tenantSlug)
      : this.normalizeSlug(tenantName);

    if (!slug) {
      throw new BadRequestException('El slug generado no es valido');
    }

    const existingTenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existingTenant) {
      throw new ConflictException(`Ya existe un tenant con el slug "${slug}"`);
    }

    const existingUser = await this.prisma.user.findUnique({ where: { name: ownerName.trim() } });
    if (existingUser) {
      throw new ConflictException(`Ya existe un usuario con el nombre "${ownerName.trim()}"`);
    }

    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
          data: {
            name: tenantName.trim(),
            slug,
            isActive: isActive ?? true,
          },
        });

        const user = await tx.user.create({
          data: {
            name: ownerName.trim(),
            password: hashedPassword,
            role: 'TENANT_OWNER',
            tenantId: tenant.id,
            mustResetPassword: true,
          },
        });

        return { tenant, user };
      });

      return {
        tenant: {
          id: result.tenant.id,
          name: result.tenant.name,
          slug: result.tenant.slug,
          isActive: result.tenant.isActive,
          createdAt: result.tenant.createdAt,
        },
        owner: {
          id: result.user.id,
          name: result.user.name,
          role: result.user.role,
          tenantId: result.user.tenantId,
        },
        tempPassword,
      };
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Ya existe un tenant o usuario con esos datos');
      }
      throw error;
    }
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
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
