import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { OrganizationDomainsModule } from './modules/organizations/organization-domains/organization-domains.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { OrgUnitsModule } from './modules/org-units/org-units.module';
import { TenantsModule } from './modules/tenants/tenants.module';

@Module({
  imports: [
    AuthModule,
    TenantsModule,
    OrganizationsModule,
    OrganizationDomainsModule,
    OrgUnitsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
