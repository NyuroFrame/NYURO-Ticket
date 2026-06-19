import { IsString, IsOptional, IsIn } from 'class-validator';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export class UpdateTicketDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(STATUSES)
  @IsOptional()
  status?: string;

  @IsIn(PRIORITIES)
  @IsOptional()
  priority?: string;
}
