import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { TicketsService } from './tickets.service';

interface AuthUser {
  id: string;
  name: string;
  role: string;
  tenantId: string | null;
  organizationId: string | null;
  orgUnitId: string | null;
}

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles('REQUESTER')
  async create(
    @Body() dto: CreateTicketDto,
    @CurrentUser() user: AuthUser,
  ) {
    if (!user.organizationId || !user.orgUnitId) {
      throw new BadRequestException('Usuario no tiene organizacion o area asignada');
    }
    return this.ticketsService.create(user.id, user.organizationId, user.orgUnitId, dto);
  }

  @Get('my')
  @Roles('REQUESTER')
  async findMyTickets(@CurrentUser() user: AuthUser) {
    return this.ticketsService.findByCreatedBy(user.id);
  }

  @Get('organization')
  @UseGuards(RolesGuard)
  @Roles('IT_MANAGER', 'AGENT')
  async findByOrganization(@CurrentUser() user: AuthUser) {
    if (!user.organizationId) {
      throw new BadRequestException('Usuario no tiene organizacion asignada');
    }
    return this.ticketsService.findByOrganization(user.organizationId);
  }

  @Get('assigned')
  @UseGuards(RolesGuard)
  @Roles('AGENT')
  async findAssigned(@CurrentUser() user: AuthUser) {
    return this.ticketsService.findByAssignee(user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const ticket = await this.ticketsService.findOne(id);
    // REQUESTER solo ve sus propios tickets
    if (user.role === 'REQUESTER' && ticket.createdById !== user.id) {
      throw new ForbiddenException('No tienes acceso a este ticket');
    }
    // AGENT ve tickets de su organizacion
    if (user.role === 'AGENT' && ticket.organizationId !== user.organizationId) {
      throw new ForbiddenException('No tienes acceso a este ticket');
    }
    // IT_MANAGER solo ve tickets de su organización
    if (user.role === 'IT_MANAGER' && ticket.organizationId !== user.organizationId) {
      throw new ForbiddenException('No tienes acceso a este ticket');
    }
    return ticket;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
    @CurrentUser() user: AuthUser,
  ) {
    const ticket = await this.ticketsService.findOne(id);
    // AGENT puede actualizar tickets de su organizacion (normalmente solo status)
    if (user.role === 'AGENT') {
      if (ticket.organizationId !== user.organizationId) {
        throw new ForbiddenException('No tienes acceso a este ticket');
      }
      // AGENT solo puede cambiar status
      const allowed = { status: dto.status };
      return this.ticketsService.update(id, ticket.organizationId, allowed as UpdateTicketDto);
    }
    // IT_MANAGER solo puede actualizar tickets de su organización
    if (user.role === 'IT_MANAGER') {
      if (ticket.organizationId !== user.organizationId) {
        throw new ForbiddenException('No tienes acceso a este ticket');
      }
    }
    // REQUESTER no puede actualizar
    if (user.role === 'REQUESTER') {
      throw new ForbiddenException('No tienes permiso para actualizar tickets');
    }
    return this.ticketsService.update(id, ticket.organizationId, dto);
  }

  @Patch(':id/assign')
  @UseGuards(RolesGuard)
  @Roles('IT_MANAGER')
  async assign(
    @Param('id') id: string,
    @Body() dto: AssignTicketDto,
    @CurrentUser() user: AuthUser,
  ) {
    if (!user.organizationId) {
      throw new BadRequestException('Usuario no tiene organizacion asignada');
    }
    return this.ticketsService.assign(id, user.organizationId, dto.assigneeId);
  }

  @Patch(':id/take')
  @UseGuards(RolesGuard)
  @Roles('AGENT')
  async take(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    if (!user.organizationId) {
      throw new BadRequestException('Usuario no tiene organizacion asignada');
    }
    return this.ticketsService.take(id, user.organizationId, user.id);
  }
}
