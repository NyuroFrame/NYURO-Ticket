import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateOrganizationDomainDto } from './dto/create-organization-domain.dto';
import { OrganizationDomainsService } from './organization-domains.service';

@Controller('tenants/:tenantId/organizations/:organizationId/domains')
export class OrganizationDomainsController {
  constructor(
    private readonly organizationDomainsService: OrganizationDomainsService,
  ) {}

  @Post()
  create(
    @Param('tenantId') tenantId: string,
    @Param('organizationId') organizationId: string,
    @Body() createOrganizationDomainDto: CreateOrganizationDomainDto,
  ) {
    return this.organizationDomainsService.create(
      tenantId,
      organizationId,
      createOrganizationDomainDto,
    );
  }

  @Get()
  findAllByOrganization(
    @Param('tenantId') tenantId: string,
    @Param('organizationId') organizationId: string,
  ) {
    return this.organizationDomainsService.findAllByOrganization(
      tenantId,
      organizationId,
    );
  }

  @Get(':id')
  findOneByOrganization(
    @Param('tenantId') tenantId: string,
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.organizationDomainsService.findOneByOrganization(
      tenantId,
      organizationId,
      id,
    );
  }
}
