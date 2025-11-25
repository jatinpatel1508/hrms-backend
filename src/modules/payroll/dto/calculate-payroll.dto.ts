import { IsUUID, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CalculatePayrollDto {
  @IsUUID()
  userId: string;

  @Type(() => Date)
  @IsDate()
  periodStart: Date;

  @Type(() => Date)
  @IsDate()
  periodEnd: Date;
}

