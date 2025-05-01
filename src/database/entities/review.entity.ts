import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  comment: string;

  @Column()
  rating: number;

  @Column({ type: 'uuid' })
  senderId: string;

  @ManyToOne(() => User, (user) => user.reviews)
  recepient: User;
}
