import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { TenantsModule } from './modules/tenants/tenants.module';

@Module({
  imports: [AuthModule, TenantsModule, OrganizationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
