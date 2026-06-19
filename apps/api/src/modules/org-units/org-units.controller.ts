import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CreateOrgUnitDto } from './dto/create-org-unit.dto';
import { UpdateOrgUnitDto } from './dto/update-org-unit.dto';
import { OrgUnitsService } from './org-units.service';

interface AuthUser {
  id: string;
  name: string;
  role: string;
  tenantId: string | null;
  organizationId: string | null;
}

@Controller('tenants/:tenantId/organizations/:organizationId/org-units')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ACCOUNT_ADMIN')
export class OrgUnitsController {
  constructor(private readonly orgUnitsService: OrgUnitsService) {}

  private ensureTenantAccess(user: AuthUser, tenantId: string): void {
    if (user.tenantId !== tenantId) {
      throw new ForbiddenException('No tienes acceso a este tenant');
    }
  }

  @Post()
  create(
    @Param('tenantId') tenantId: string,
    @Param('organizationId') organizationId: string,
    @Body() createOrgUnitDto: CreateOrgUnitDto,
    @CurrentUser() user: AuthUser,
  ) {
    this.ensureTenantAccess(user, tenantId);
    return this.orgUnitsService.create(
      tenantId,
      organizationId,
      createOrgUnitDto,
    );
  }

  @Get()
  findAllByOrganization(
    @Param('tenantId') tenantId: string,
    @Param('organizationId') organizationId: string,
    @CurrentUser() user: AuthUser,
  ) {
    this.ensureTenantAccess(user, tenantId);
    return this.orgUnitsService.findAllByOrganization(tenantId, organizationId);
  }

  @Get(':id')
  findOneByOrganization(
    @Param('tenantId') tenantId: string,
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    this.ensureTenantAccess(user, tenantId);
    return this.orgUnitsService.findOneByOrganization(
      tenantId,
      organizationId,
      id,
    );
  }

  @Patch(':id')
  update(
    @Param('tenantId') tenantId: string,
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOrgUnitDto,
    @CurrentUser() user: AuthUser,
  ) {
    this.ensureTenantAccess(user, tenantId);
    return this.orgUnitsService.update(tenantId, organizationId, id, dto);
  }

  @Delete(':id')
  remove(
    @Param('tenantId') tenantId: string,
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    this.ensureTenantAccess(user, tenantId);
    return this.orgUnitsService.remove(tenantId, organizationId, id);
  }
}
