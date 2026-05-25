import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { TenantsModule } from '../tenants/tenants.module';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

@Module({
  imports: [PrismaModule, TenantsModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
