import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { User } from './user.entity';
import { ProposalStatus } from '../enums/proposal-status.enum';

@Entity('proposals')
export class Proposal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', default: ProposalStatus.PENDING })
  status: ProposalStatus;

  @ManyToOne(() => Project, (project) => project.proposals, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  project: Project;

  @ManyToOne(() => User, (user) => user.proposals)
  @JoinColumn()
  freelancer: User;
}
