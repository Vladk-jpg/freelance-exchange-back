/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/database/enums/user-role.enum';
import { CreateReviewDto } from './dto/create-review.dto';
import { UUIDParam } from 'src/common/pipes/uuid.pipe';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Roles(UserRole.CLIENT)
  @Post()
  async createReview(
    @Query('projectId', UUIDParam()) projectId: string,
    @Req() req: any,
    @Body() dto: CreateReviewDto,
  ) {
    const senderId = req.user.id as string;
    return await this.reviewService.createReview(senderId, projectId, dto);
  }

  @Get(':id')
  async getReview(@Query('id', UUIDParam()) id: string) {
    return await this.reviewService.findReview(id);
  }

  @Get('user/:id')
  async getUserReviews(@Query('id', UUIDParam()) id: string) {
    return await this.reviewService.findUserReviews(id);
  }
}
