import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from 'src/database/entities/review.entity';
import { User } from 'src/database/entities/user.entity';
import { Project } from 'src/database/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, User, Project])],
  providers: [ReviewService],
  controllers: [ReviewController],
})
export class ReviewModule {}
