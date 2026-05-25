import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { OrgUnitsController } from './org-units.controller';
import { OrgUnitsService } from './org-units.service';

@Module({
  imports: [PrismaModule, OrganizationsModule],
  controllers: [OrgUnitsController],
  providers: [OrgUnitsService],
  exports: [OrgUnitsService],
})
export class OrgUnitsModule {}
