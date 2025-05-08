import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from 'src/database/entities/review.entity';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { User } from 'src/database/entities/user.entity';
import { Project } from 'src/database/entities/project.entity';
import { ProjectStatus } from 'src/database/enums/project-status.enum';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async createReview(
    senderId: string,
    projectId: string,
    dto: CreateReviewDto,
  ) {
    const review = this.reviewRepo.create();
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['freelancer', 'client'],
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.status !== ProjectStatus.COMPLETED)
      throw new ForbiddenException(
        'You can only Freelancer with completed project',
      );

    const recepient = await this.userRepo.findOne({
      where: { id: project.freelancer.id },
    });
    if (!recepient) throw new NotFoundException('Freelancer not found');

    review.comment = dto.comment;
    review.rating = dto.rating;
    review.senderId = senderId;
    review.recepient = recepient;
    return await this.reviewRepo.save(review);
  }

  async findReview(id: string) {
    const review = await this.reviewRepo.findOne({
      where: { id },
      relations: ['recepient'],
    });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async findUserReviews(userId: string) {
    const reviews = await this.reviewRepo.find({
      where: { senderId: userId },
      relations: ['recepient'],
    });
    return reviews;
  }
}
