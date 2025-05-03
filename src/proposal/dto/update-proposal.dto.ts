import { IsString, MinLength } from 'class-validator';

export class UpdateProposalDto {
  @IsString()
  @MinLength(10, { message: 'Message must be at least 10 characters long' })
  message: string;
}
