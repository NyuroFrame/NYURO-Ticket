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

    const slug = rawSlug
      ? this.normalizeSlug(rawSlug)
      : this.normalizeSlug(name);

    if (!slug) {
      throw new BadRequestException('El slug generado no es valido');
    }

    const existing = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Ya existe un tenant con el slug "${slug}"`);
    }

    return this.prisma.tenant.create({
      data: { name: name.trim(), slug },
    });
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
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  }
}