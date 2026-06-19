import { IsString, IsOptional, IsIn } from 'class-validator';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export class CreateTicketDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsIn(PRIORITIES)
  @IsOptional()
  priority?: string;
}
