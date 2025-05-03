import { Module } from '@nestjs/common';
import { ProposalService } from './proposal.service';
import { ProposalController } from './proposal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from 'src/database/entities/proposal.entity';
import { Project } from 'src/database/entities/project.entity';
import { User } from 'src/database/entities/user.entity';
import { Wallet } from 'src/database/entities/wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Project, Proposal, Wallet])],
  providers: [ProposalService],
  controllers: [ProposalController],
})
export class ProposalModule {}
