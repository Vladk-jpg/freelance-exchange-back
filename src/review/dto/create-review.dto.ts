import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @MinLength(10, { message: 'Comment must be at least 10 characters long' })
  comment: string;

  @IsInt()
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(10, { message: 'Rating must be at most 10' })
  rating: number;
}
