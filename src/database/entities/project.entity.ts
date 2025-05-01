import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectStatus } from '../enums/project-status.enum';
import { User } from './user.entity';
import { Proposal } from './proposal.entity';
import { Category } from './category.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  descriprion: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  price: number;

  @Column({ type: 'text', default: ProjectStatus.CREATED })
  status: ProjectStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Category)
  @JoinColumn()
  category: Category;

  @ManyToOne(() => User, (user) => user.projectsClient, { onDelete: 'CASCADE' })
  @JoinColumn()
  client: User;

  @ManyToOne(() => User, (user) => user.projectsFreelancer, {
    nullable: true,
  })
  @JoinColumn()
  freelancer: User;

  @OneToMany(() => Proposal, (proposal) => proposal.project)
  proposals: [];
}
