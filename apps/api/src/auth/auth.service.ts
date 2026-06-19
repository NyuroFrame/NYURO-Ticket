import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';
import { OrgRegisterDto } from './dto/org-register.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { OrgLoginDto } from './dto/org-login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateItManagerDto } from './dto/create-it-manager.dto';
import { CreateAgentDto } from './dto/create-agent.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Registro para AGENT y REQUESTER (requiere orgCode)
  async registerOrgUser(dto: OrgRegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Name already taken');
    }

    const organization = await this.prisma.organization.findUnique({
      where: { code: dto.orgCode },
      include: { tenant: true },
    });

    if (!organization) {
      throw new BadRequestException('Organization code not found');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const data: any = {
      name: dto.name,
      password: hashedPassword,
      tenantId: organization.tenantId,
      organizationId: organization.id,
    };

    if (dto.orgUnitId) {
      const orgUnit = await this.prisma.orgUnit.findFirst({
        where: { id: dto.orgUnitId, organizationId: organization.id },
      });
      if (!orgUnit) {
        throw new BadRequestException('Area not found in this organization');
      }
      data.orgUnitId = dto.orgUnitId;
    }

    const user = await this.prisma.user.create({
      data,
      include: { tenant: true, organization: true, orgUnit: true },
    });

    return this.buildAuthResponse(user);
  }

  // Login para SUPER_ADMIN, ACCOUNT_ADMIN, ORG_ADMIN e IT_MANAGER (solo name + password)
  async adminLogin(dto: AdminLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { name: dto.name },
      include: { tenant: true, organization: true, orgUnit: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Solo SUPER_ADMIN, ACCOUNT_ADMIN, ORG_ADMIN e IT_MANAGER pueden usar este login
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ACCOUNT_ADMIN' && user.role !== 'ORG_ADMIN' && user.role !== 'IT_MANAGER') {
      throw new UnauthorizedException('Use the organization login instead');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  // Login para AGENT y REQUESTER (orgCode + name + password)
  async orgLogin(dto: OrgLoginDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { code: dto.orgCode },
    });

    if (!organization) {
      throw new UnauthorizedException('Invalid organization code');
    }

    const user = await this.prisma.user.findUnique({
      where: { name: dto.name },
      include: { tenant: true, organization: true, orgUnit: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Solo AGENT y REQUESTER pueden usar este login
    if (user.role !== 'AGENT' && user.role !== 'REQUESTER') {
      throw new UnauthorizedException('Use the admin login instead');
    }

    // Verificar que el usuario pertenezca a la organización correcta
    if (user.organizationId !== organization.id) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  // Crear usuario por SUPER_ADMIN (para crear ADMINs)
  async createUserByAdmin(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Name already taken');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: dto.tenantId },
    });

    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        password: hashedPassword,
        role: dto.role,
        tenantId: dto.tenantId,
      },
      include: { tenant: true },
    });

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      tenant: user.tenant,
    };
  }

  // Crear IT_MANAGER por ACCOUNT_ADMIN
  async createItManager(dto: CreateItManagerDto, tenantId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Name already taken');
    }

    const organization = await this.prisma.organization.findFirst({
      where: { id: dto.organizationId, tenantId },
    });

    if (!organization) {
      throw new BadRequestException('Organization not found in this tenant');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        password: hashedPassword,
        role: 'IT_MANAGER',
        tenantId,
        organizationId: dto.organizationId,
      },
      include: { tenant: true, organization: true },
    });

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      tenant: user.tenant,
      organization: user.organization,
    };
  }

  // Crear AGENT por IT_MANAGER
  async createAgent(dto: CreateAgentDto, tenantId: string, organizationId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Name already taken');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        password: hashedPassword,
        role: 'AGENT',
        tenantId,
        organizationId,
      },
      include: { tenant: true, organization: true },
    });

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      tenant: user.tenant,
      organization: user.organization,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true, organization: true, orgUnit: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async resetPassword(userId: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustResetPassword: false,
      },
      include: { tenant: true, organization: true, orgUnit: true },
    });

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: {
    id: string;
    name: string;
    role: string;
    tenantId: string | null;
    tenant: { id: string; name: string } | null;
    organizationId?: string | null;
    organization?: { id: string; code: string; name: string } | null;
    orgUnitId?: string | null;
    orgUnit?: { id: string; name: string } | null;
    mustResetPassword?: boolean;
  }) {
    const payload = {
      sub: user.id,
      name: user.name,
      tenantId: user.tenantId,
      organizationId: user.organizationId,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        orgUnitId: user.orgUnitId,
      },
      tenant: user.tenant,
      organization: user.organization,
      orgUnit: user.orgUnit,
      mustResetPassword: user.mustResetPassword ?? false,
    };
  }
}
