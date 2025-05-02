import { IsString, MinLength, Matches, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  description: string;

  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'Price must have at most two decimal places',
  })
  price: string;

  @IsUUID()
  categoryId: string;
}
