import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationsService } from './organizations.service';

interface AuthUser {
  id: string;
  name: string;
  role: string;
  tenantId: string | null;
  organizationId: string | null;
}

@Controller('tenants/:tenantId/organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ACCOUNT_ADMIN')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  private ensureTenantAccess(user: AuthUser, tenantId: string): void {
    if (user.tenantId !== tenantId) {
      throw new ForbiddenException('No tienes acceso a este tenant');
    }
  }

  @Post()
  create(
    @Param('tenantId') tenantId: string,
    @Body() createOrganizationDto: CreateOrganizationDto,
    @CurrentUser() user: AuthUser,
  ) {
    this.ensureTenantAccess(user, tenantId);
    return this.organizationsService.create(tenantId, createOrganizationDto);
  }

  @Get()
  findAllByTenant(
    @Param('tenantId') tenantId: string,
    @CurrentUser() user: AuthUser,
  ) {
    this.ensureTenantAccess(user, tenantId);
    return this.organizationsService.findAllByTenant(tenantId);
  }

  @Get(':id')
  findOneByTenant(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    this.ensureTenantAccess(user, tenantId);
    return this.organizationsService.findOneByTenant(tenantId, id);
  }

  @Patch(':id')
  update(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() user: AuthUser,
  ) {
    this.ensureTenantAccess(user, tenantId);
    return this.organizationsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    this.ensureTenantAccess(user, tenantId);
    return this.organizationsService.remove(tenantId, id);
  }
}
