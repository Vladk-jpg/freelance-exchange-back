import { IsEnum, IsOptional, IsUUID, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ProjectSort } from '../enums/project-sort.enum';

export class FilterProjectsDto {
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsUUID('4', { each: true })
  categories?: string[];

  @IsOptional()
  @IsEnum(ProjectSort)
  sortBy?: ProjectSort;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
