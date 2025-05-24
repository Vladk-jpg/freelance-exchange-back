import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from 'src/database/entities/payment.entity';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  async findPaymentById(id: string) {
    const found = await this.paymentRepo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Payment not found');
    return found;
  }

  async deletePayment(id: string) {
    const result = await this.paymentRepo.delete(id);
    if (result.affected === 0) {
      throw new BadRequestException('Can not delete project');
    }
  }

  async findPaymentsByUserId(id: string) {
    const found = await this.paymentRepo.find({
      where: [{ recepientId: id }, { senderId: id }],
      order: { updatedAt: 'DESC' }, // сортировка по убыванию
    });
    return found;
  }
}
