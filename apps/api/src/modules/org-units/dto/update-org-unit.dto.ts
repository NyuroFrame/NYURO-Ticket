import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateOrgUnitDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  managerName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  parentId?: string;
}
