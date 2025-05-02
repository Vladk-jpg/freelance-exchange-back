import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BlockUserDto } from './dto/block-user.dto';
import { UserStatus } from 'src/database/enums/user-status.enum';
import { BcryptService } from 'src/services/bcrypt/bcrypt.service';
import { Profile } from './representors/profile.repr';
import { Wallet } from 'src/database/entities/wallet.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    private readonly bcryptService: BcryptService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    let foundUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (foundUser != null) {
      throw new ConflictException('User with this email already exists');
    }
    foundUser = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (foundUser != null) {
      throw new ConflictException('User with this username already exists');
    }

    const user = this.userRepo.create(dto);
    user.passwordHash = await this.bcryptService.hash(dto.password);

    const wallet = await this.walletRepo.save(
      this.walletRepo.create({ balance: 0.0 }),
    );
    user.wallet = wallet;

    return await this.userRepo.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepo.findOne({ where: { id } });
  }

  async findProfile(id: string): Promise<Profile | null> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) return null;
    return new Profile(user.username, user.email, user.role, user.createdAt);
  }

  async update(id: string, dto: UpdateUserDto): Promise<Profile> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (dto.email && dto.email !== user.email) {
      const foundUser = await this.userRepo.findOne({
        where: { email: dto.email },
      });
      if (foundUser) {
        throw new ConflictException('User with this email already exists');
      }
      user.email = dto.email;
    }
    if (dto.username && dto.username !== user.username) {
      const foundUser = await this.userRepo.findOne({
        where: { username: dto.username },
      });
      if (foundUser) {
        throw new ConflictException('User with this username already exists');
      }
      user.username = dto.username;
    }
    if (dto.password) {
      user.passwordHash = await this.bcryptService.hash(dto.password);
    }

    const newUser = await this.userRepo.save(user);
    return new Profile(
      newUser.username,
      newUser.email,
      newUser.role,
      newUser.createdAt,
    );
  }

  async profile(id: string): Promise<Profile> {
    const user = await this.findById(id);
    if (!user) throw new BadRequestException('User not found');
    const profile = new Profile(
      user.username,
      user.email,
      user.role,
      user.createdAt,
    );
    return profile;
  }

  async delete(id: string): Promise<void> {
    const result = await this.userRepo.delete(id);
    if (result.affected === 0) {
      throw new BadRequestException('Can not delete user or user not found');
    }
  }

  async blockByEmail(dto: BlockUserDto): Promise<void> {
    const user = await this.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    user.status = UserStatus.BLOCKED;
    await this.userRepo.save(user);
  }

  async unblockByEmail(dto: BlockUserDto): Promise<void> {
    const user = await this.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    user.status = UserStatus.ACTIVE;
    await this.userRepo.save(user);
  }

  async softDelete(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    user.status = UserStatus.DELETED;
    await this.userRepo.save(user);
  }
}
