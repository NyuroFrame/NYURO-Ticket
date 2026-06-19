import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
