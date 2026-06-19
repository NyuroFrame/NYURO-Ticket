import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateAgentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}
