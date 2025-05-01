import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { Match } from 'src/common/validators/match.validator';
import { UserRole } from 'src/database/enums/user-role.enum';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsNotEmpty({ message: 'Password confirmation is required' })
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;

  @IsEnum(UserRole, { message: 'User role must be valid' })
  role: UserRole;
}
