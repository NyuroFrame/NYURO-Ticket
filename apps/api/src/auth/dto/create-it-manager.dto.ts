import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateItManagerDto {
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
  organizationId: string;
}
