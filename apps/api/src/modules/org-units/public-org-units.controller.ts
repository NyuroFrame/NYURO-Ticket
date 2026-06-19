import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Controller('public/org-units')
export class PublicOrgUnitsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':orgCode')
  async findByOrgCode(@Param('orgCode') orgCode: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { code: orgCode },
    });

    if (!organization) {
      throw new NotFoundException('Organizacion no encontrada');
    }

    return this.prisma.orgUnit.findMany({
      where: {
        organizationId: organization.id,
        isActive: true,
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        managerName: true,
        description: true,
      },
    });
  }
}
