import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { Project } from 'src/database/entities/project.entity';
import { User } from 'src/database/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/database/entities/category.entity';
import { Payment } from 'src/database/entities/payment.entity';
import { Wallet } from 'src/database/entities/wallet.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Project, Category, Payment, Wallet]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
