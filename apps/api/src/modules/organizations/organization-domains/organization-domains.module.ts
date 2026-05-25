import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../database/prisma.module';
import { OrganizationsModule } from '../organizations.module';
import { OrganizationDomainsController } from './organization-domains.controller';
import { OrganizationDomainsService } from './organization-domains.service';

@Module({
  imports: [PrismaModule, OrganizationsModule],
  controllers: [OrganizationDomainsController],
  providers: [OrganizationDomainsService],
  exports: [OrganizationDomainsService],
})
export class OrganizationDomainsModule {}
