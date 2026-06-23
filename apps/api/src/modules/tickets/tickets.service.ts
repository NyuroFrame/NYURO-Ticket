import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

interface AttachmentInput {
  filename: string;
  originalname: string;
  mimeType: string;
  size: number;
  url: string;
}

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly ticketIncludes = {
    createdBy: { select: { id: true, name: true } },
    assignee: { select: { id: true, name: true } },
    orgUnit: { select: { id: true, name: true } },
    attachments: { select: { id: true, filename: true, mimeType: true, size: true, url: true, createdAt: true } },
  };

  async create(userId: string, organizationId: string, orgUnitId: string, dto: CreateTicketDto) {
    if (!dto.title || !dto.title.trim()) {
      throw new BadRequestException('El titulo es requerido');
    }
    if (!dto.description || !dto.description.trim()) {
      throw new BadRequestException('La descripcion es requerida');
    }

    const orgUnit = await this.prisma.orgUnit.findFirst({
      where: { id: orgUnitId, organizationId },
    });
    if (!orgUnit) {
      throw new BadRequestException('Area no encontrada en esta organizacion');
    }

    return this.prisma.ticket.create({
      data: {
        title: dto.title.trim(),
        description: dto.description.trim(),
        priority: dto.priority ?? 'MEDIUM',
        organizationId,
        orgUnitId,
        createdById: userId,
      },
    });
  }

  async findByOrganization(organizationId: string) {
    return this.prisma.ticket.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: this.ticketIncludes,
    });
  }

  async findByAssignee(assigneeId: string) {
    return this.prisma.ticket.findMany({
      where: { assigneeId },
      orderBy: { createdAt: 'desc' },
      include: this.ticketIncludes,
    });
  }

  async findByCreatedBy(createdById: string) {
    return this.prisma.ticket.findMany({
      where: { createdById },
      orderBy: { createdAt: 'desc' },
      include: this.ticketIncludes,
    });
  }

  async findOne(id: string, organizationId?: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: this.ticketIncludes,
    });

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    if (organizationId && ticket.organizationId !== organizationId) {
      throw new ForbiddenException('No tienes acceso a este ticket');
    }

    return ticket;
  }

  async update(id: string, organizationId: string, dto: UpdateTicketDto) {
    const ticket = await this.findOne(id, organizationId);

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description.trim();
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.priority !== undefined) data.priority = dto.priority;

    if (Object.keys(data).length === 0) {
      return ticket;
    }

    return this.prisma.ticket.update({
      where: { id },
      data,
      include: this.ticketIncludes,
    });
  }

  async assign(id: string, organizationId: string, assigneeId: string) {
    const ticket = await this.findOne(id, organizationId);

    const assignee = await this.prisma.user.findFirst({
      where: { id: assigneeId, organizationId, role: 'AGENT' },
    });

    if (!assignee) {
      throw new BadRequestException('Agente no encontrado en esta organizacion');
    }

    return this.prisma.ticket.update({
      where: { id },
      data: { assigneeId },
      include: this.ticketIncludes,
    });
  }

  async take(id: string, organizationId: string, agentId: string) {
    const ticket = await this.findOne(id, organizationId);

    if (ticket.assigneeId) {
      throw new BadRequestException('El ticket ya tiene un agente asignado');
    }

    const agent = await this.prisma.user.findFirst({
      where: { id: agentId, organizationId, role: 'AGENT' },
    });

    if (!agent) {
      throw new BadRequestException('Agente no encontrado en esta organizacion');
    }

    return this.prisma.ticket.update({
      where: { id },
      data: { assigneeId: agentId },
      include: this.ticketIncludes,
    });
  }

  async addAttachment(id: string, organizationId: string, file: AttachmentInput) {
    const ticket = await this.findOne(id, organizationId);
    return this.prisma.ticketAttachment.create({
      data: {
        ticketId: ticket.id,
        filename: file.filename,
        mimeType: file.mimeType,
        size: file.size,
        url: file.url,
      },
      select: { id: true, filename: true, mimeType: true, size: true, url: true, createdAt: true },
    });
  }

  async resolve(id: string, organizationId: string, agentId: string, resolutionNotes?: string) {
    const ticket = await this.findOne(id, organizationId);

    if (ticket.assigneeId !== agentId) {
      throw new ForbiddenException('Solo el agente asignado puede resolver este ticket');
    }

    if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
      throw new BadRequestException('El ticket ya esta finalizado');
    }

    return this.prisma.ticket.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolutionNotes: resolutionNotes ? resolutionNotes.trim() : null,
        completedAt: new Date(),
      },
      include: this.ticketIncludes,
    });
  }
}
