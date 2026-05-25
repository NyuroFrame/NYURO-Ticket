import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationsService } from './organizations.service';

@Controller('tenants/:tenantId/organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  create(
    @Param('tenantId') tenantId: string,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ) {
    return this.organizationsService.create(tenantId, createOrganizationDto);
  }

  @Get()
  findAllByTenant(@Param('tenantId') tenantId: string) {
    return this.organizationsService.findAllByTenant(tenantId);
  }

  @Get(':id')
  findOneByTenant(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.organizationsService.findOneByTenant(tenantId, id);
  }
}
