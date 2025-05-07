import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Wallet } from 'src/database/entities/wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
  ) {}

  async getWalletByUserId(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  async deposit(userId: string, amount: number): Promise<Wallet> {
    const wallet = await this.getWalletByUserId(userId);
    wallet.balance += amount;
    return await this.walletRepo.save(wallet);
  }

  async withdraw(userId: string, amount: number): Promise<Wallet> {
    const wallet = await this.getWalletByUserId(userId);
    if (wallet.balance < amount) {
      throw new ForbiddenException('Insufficient funds');
    }
    wallet.balance -= amount;
    return await this.walletRepo.save(wallet);
  }
}
