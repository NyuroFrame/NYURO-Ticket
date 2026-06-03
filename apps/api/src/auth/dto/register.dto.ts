import { IsString, MinLength, MaxLength, Matches, Length } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsString()
  @Length(12, 12)
  @Matches(/^\d{12}$/, { message: 'Tenant code must be 12 digits' })
  tenantCode: string;
}
