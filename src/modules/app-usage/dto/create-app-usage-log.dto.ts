import { IsString, IsDate, IsNumber, IsBoolean, IsUUID, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppUsageLogDto {
  // userId is added by the controller from JWT token, so it's optional here
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  appName: string;

  @IsOptional()
  @IsString()
  windowTitle?: string;

  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endTime?: Date;

  @IsNumber()
  duration: number;

  @IsOptional()
  @IsBoolean()
  isProductive?: boolean;
}

