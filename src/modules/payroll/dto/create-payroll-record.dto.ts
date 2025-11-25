import { IsUUID, IsDate, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePayrollRecordDto {
  @IsUUID()
  userId: string;

  @Type(() => Date)
  @IsDate()
  periodStart: Date;

  @Type(() => Date)
  @IsDate()
  periodEnd: Date;

  @IsNumber()
  totalHours: number;

  @IsNumber()
  idleHours: number;

  @IsNumber()
  hourlyRate: number;

  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;
}

