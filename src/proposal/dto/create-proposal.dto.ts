import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateProposalDto {
  @IsString()
  @MinLength(10, { message: 'Message must be at least 10 characters long' })
  message: string;

  @IsUUID()
  projectId: string;
}
