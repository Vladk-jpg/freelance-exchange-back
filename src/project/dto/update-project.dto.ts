import {
  IsString,
  MinLength,
  IsNumber,
  IsPositive,
  Matches,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be a positive number' })
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'Price must have at most two decimal places',
  })
  price?: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
