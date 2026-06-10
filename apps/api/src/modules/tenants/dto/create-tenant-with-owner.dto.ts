import { IsString, MinLength, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateTenantWithOwnerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  tenantName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  tenantSlug?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  ownerName: string;
}
