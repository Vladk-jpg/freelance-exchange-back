import { IsEmail } from 'class-validator';

export class BlockUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}
