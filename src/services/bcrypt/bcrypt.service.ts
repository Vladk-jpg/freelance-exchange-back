import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  rounds: number = 10;

  KEYWORD: string = 'bombardiro crocodilo';

  async hash(hashString: string): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashed: string = await bcrypt.hash(
      this.KEYWORD + hashString,
      this.rounds,
    );
    return hashed;
  }

  async compare(password: string, hashPassword: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await bcrypt.compare(this.KEYWORD + password, hashPassword);
  }
}
