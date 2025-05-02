import { IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsNotEmpty({ message: 'Id of category must be filled' })
  id: string;

  @IsNotEmpty({ message: 'Name of category must be filled' })
  @MaxLength(255, { message: 'Too long name of category' })
  name: string;
}
