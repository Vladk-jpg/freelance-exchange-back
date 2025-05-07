import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/database/enums/user-role.enum';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Roles(UserRole.FREELANCER, UserRole.CLIENT)
  @Get()
  async getWallet(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return await this.walletService.getWalletByUserId(req.user.id as string);
  }

  @Patch('deposit')
  async deposit(@Body() dto: DepositDto, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return await this.walletService.deposit(req.user.id as string, dto.amount);
  }

  @Patch('withdraw')
  async withdraw(@Req() req: any, @Body() dto: WithdrawDto) {
    return await this.walletService.withdraw(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.user.id as string,
      dto.amount,
    );
  }
}
