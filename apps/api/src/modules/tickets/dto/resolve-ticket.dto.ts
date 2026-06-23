import { IsString, IsOptional } from 'class-validator';

export class ResolveTicketDto {
  @IsString()
  @IsOptional()
  resolutionNotes?: string;
}
