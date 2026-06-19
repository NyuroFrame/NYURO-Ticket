import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class OrgRegisterDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsString()
  @MinLength(1)
  orgCode: string;

  @IsString()
  @IsOptional()
  orgUnitId?: string;
}
