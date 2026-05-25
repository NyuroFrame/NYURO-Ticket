import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateOrgUnitDto } from './dto/create-org-unit.dto';
import { OrgUnitsService } from './org-units.service';

@Controller('tenants/:tenantId/organizations/:organizationId/org-units')
export class OrgUnitsController {
  constructor(private readonly orgUnitsService: OrgUnitsService) {}

  @Post()
  create(
    @Param('tenantId') tenantId: string,
    @Param('organizationId') organizationId: string,
    @Body() createOrgUnitDto: CreateOrgUnitDto,
  ) {
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
  ) {
    return this.orgUnitsService.findAllByOrganization(tenantId, organizationId);
  }

  @Get(':id')
  findOneByOrganization(
    @Param('tenantId') tenantId: string,
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.orgUnitsService.findOneByOrganization(
      tenantId,
      organizationId,
      id,
    );
  }
}
