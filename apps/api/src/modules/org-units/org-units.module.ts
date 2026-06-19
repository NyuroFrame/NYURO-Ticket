import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { OrgUnitsController } from './org-units.controller';
import { PublicOrgUnitsController } from './public-org-units.controller';
import { OrgUnitsService } from './org-units.service';

@Module({
  imports: [PrismaModule, OrganizationsModule],
  controllers: [OrgUnitsController, PublicOrgUnitsController],
  providers: [OrgUnitsService],
  exports: [OrgUnitsService],
})
export class OrgUnitsModule {}
