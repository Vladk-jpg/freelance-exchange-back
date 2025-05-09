import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';
import { Project } from './project.entity';
import { Wallet } from './wallet.entity';
import { Proposal } from './proposal.entity';
import { Review } from './review.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'text', default: UserRole.CLIENT })
  role: UserRole;

  @Column({ type: 'text', default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ nullable: true, default: '' })
  profilePicture?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  @JoinColumn()
  wallet: Wallet;

  @OneToMany(() => Project, (project) => project.client)
  projectsClient: Project[];

  @OneToMany(() => Project, (project) => project.freelancer)
  projectsFreelancer: Project[];

  @OneToMany(() => Proposal, (proposal) => proposal.freelancer)
  proposals: Proposal[];

  @OneToMany(() => Review, (review) => review.recepient)
  reviews: Review[];
}
