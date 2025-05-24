import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UUIDParam } from 'src/common/pipes/uuid.pipe';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Get('user')
  async findByUserId(@Req() req: any) {
    return await this.paymentService.findPaymentsByUserId(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.user.id as string,
    );
  }

  @Get(':id')
  async findById(@Param('id', UUIDParam()) id: string) {
    return await this.paymentService.findPaymentById(id);
  }
}
