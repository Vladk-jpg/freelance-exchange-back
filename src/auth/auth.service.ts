import { Injectable } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { BcryptService } from 'src/services/bcrypt/bcrypt.service';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from 'src/database/enums/user-status.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly bcryptService: BcryptService,
    private jwtService: JwtService,
  ) {}

  async validateUser(dto: AuthPayloadDto) {
    const findUser = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (!findUser) return null;

    const isFound = await this.bcryptService.compare(
      dto.password,
      findUser.passwordHash,
    );
    if (isFound) {
      if (findUser.status != UserStatus.ACTIVE) {
        return null;
      }
      const payload = {
        id: findUser.id,
        email: findUser.email,
        role: findUser.role,
      };
      return { token: this.jwtService.sign(payload) };
    } else {
      return null;
    }
  }
}
