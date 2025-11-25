import { IsEnum, IsDate, IsUUID, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ScreenshotType } from '../../../entities/screenshot.entity';

export class CreateScreenshotDto {
  // userId is added by the controller from JWT token, so it's optional here
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsEnum(ScreenshotType)
  type: ScreenshotType;

  @Type(() => Date)
  @IsDate()
  capturedAt: Date;
}

