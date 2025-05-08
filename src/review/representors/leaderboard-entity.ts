import { User } from 'src/database/entities/user.entity';

export class LeaderboardEntity {
  recepient: User | null;
  avgRating: number;
  count: number;
}
