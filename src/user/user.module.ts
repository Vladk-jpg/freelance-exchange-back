import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { BcryptModule } from 'src/services/bcrypt/bcrypt.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), BcryptModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
