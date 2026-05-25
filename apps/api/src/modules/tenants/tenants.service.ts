import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    const { name, slug: rawSlug } = createTenantDto;

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
        data: { name: name.trim(), slug },
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

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    );
  }
}
