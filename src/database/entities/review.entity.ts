import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'int', nullable: false })
  rating: number;

  @Column({ type: 'uuid' })
  senderId: string;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn()
  recepient: User;

  @CreateDateColumn()
  createdAt: Date;
}
