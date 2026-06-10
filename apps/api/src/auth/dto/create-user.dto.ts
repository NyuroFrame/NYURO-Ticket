import { IsString, MinLength, MaxLength, IsIn } from 'class-validator';

const USER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'REQUESTER'] as const;
type UserRole = typeof USER_ROLES[number];

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsIn(USER_ROLES)
  role: UserRole;

  @IsString()
  @MinLength(1)
  tenantId: string;
}
