import { Controller, Post, Get, Body, Res, UseGuards, HttpCode } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { OrgRegisterDto } from './dto/org-register.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { OrgLoginDto } from './dto/org-login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateItManagerDto } from './dto/create-it-manager.dto';
import { CreateAgentDto } from './dto/create-agent.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Registro para AGENT y REQUESTER
  @Post('register')
  async register(@Body() dto: OrgRegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.registerOrgUser(dto);
    res.cookie('token', result.token, COOKIE_OPTIONS);
    return { user: result.user, tenant: result.tenant, organization: result.organization, orgUnit: result.orgUnit };
  }

  // Login para SUPER_ADMIN, ACCOUNT_ADMIN y ORG_ADMIN
  @Post('login/admin')
  @HttpCode(200)
  async adminLogin(@Body() dto: AdminLoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.adminLogin(dto);
    res.cookie('token', result.token, COOKIE_OPTIONS);
    return { user: result.user, tenant: result.tenant, mustResetPassword: result.mustResetPassword };
  }

  // Login para AGENT y REQUESTER
  @Post('login/org')
  @HttpCode(200)
  async orgLogin(@Body() dto: OrgLoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.orgLogin(dto);
    res.cookie('token', result.token, COOKIE_OPTIONS);
    return { user: result.user, tenant: result.tenant, organization: result.organization, orgUnit: result.orgUnit };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('token', '', { ...COOKIE_OPTIONS, maxAge: 0 });
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: any) {
    const profile = await this.authService.getProfile(user.id);
    return {
      user: {
        id: profile.id,
        name: profile.name,
        role: profile.role,
        tenantId: profile.tenantId,
        organizationId: profile.organizationId,
        orgUnitId: profile.orgUnitId,
        mustResetPassword: profile.mustResetPassword,
        createdAt: profile.createdAt,
      },
      tenant: profile.tenant,
      organization: profile.organization,
      orgUnit: profile.orgUnit,
    };
  }

  @Post('reset-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async resetPassword(
    @CurrentUser() user: any,
    @Body('newPassword') newPassword: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.resetPassword(user.id, newPassword);
    res.cookie('token', result.token, COOKIE_OPTIONS);
    return {
      user: result.user,
      tenant: result.tenant,
      organization: result.organization,
      orgUnit: result.orgUnit,
    };
  }

  // Crear usuario por SUPER_ADMIN
  @Post('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async createUser(@Body() dto: CreateUserDto) {
    return this.authService.createUserByAdmin(dto);
  }

  // Crear IT_MANAGER por ACCOUNT_ADMIN
  @Post('users/it-manager')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ACCOUNT_ADMIN')
  async createItManager(
    @Body() dto: CreateItManagerDto,
    @CurrentUser() user: any,
  ) {
    return this.authService.createItManager(dto, user.tenantId);
  }

  // Crear AGENT por IT_MANAGER
  @Post('users/agent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('IT_MANAGER')
  async createAgent(
    @Body() dto: CreateAgentDto,
    @CurrentUser() user: any,
  ) {
    return this.authService.createAgent(dto, user.tenantId, user.organizationId);
  }
}
