import { IsNumber, IsPositive } from 'class-validator';

export class WithdrawDto {
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Amount must be a number with up to 2 decimal places' },
  )
  @IsPositive({ message: 'Amount must be a positive number' })
  amount: number;
}
