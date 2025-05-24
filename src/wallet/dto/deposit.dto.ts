import { IsNumber, IsPositive, Matches } from 'class-validator';

export class DepositDto {
  cardNumber: string;

  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    message: 'Expiration date must be in MM/YY format',
  })
  expirationDate: string; // Format: MM/YY

  @Matches(/^\d{3}$/, { message: 'CVV must be a 3-digit number' })
  cvv: string; // 3-digit security code

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Amount must be a number with up to 2 decimal places' },
  )
  @IsPositive({ message: 'Amount must be a positive number' })
  amount: number;
}
