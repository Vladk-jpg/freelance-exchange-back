import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { Payment } from 'src/database/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Payment])],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
