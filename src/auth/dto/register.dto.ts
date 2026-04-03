import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsStrongPassword, MaxLength } from 'class-validator';
import { UserRoleEnum } from 'src/enums/user-role.enum';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsEnum(UserRoleEnum)
  role?: UserRoleEnum = UserRoleEnum.USER;

  
}
