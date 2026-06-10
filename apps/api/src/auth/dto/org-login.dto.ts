import { IsString, MinLength } from 'class-validator';

export class OrgLoginDto {
  @IsString()
  @MinLength(1)
  orgCode: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  password: string;
}
