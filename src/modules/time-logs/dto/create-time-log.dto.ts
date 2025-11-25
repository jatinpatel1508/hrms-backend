import { IsString, IsOptional, IsDate, IsNumber, IsUUID, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTimeLogDto {
  // userId is added by the controller from JWT token, so it's optional here
  @IsOptional()
  @ValidateIf((o) => o.userId !== null)
  @IsUUID()
  userId?: string;

  @IsOptional()
  @ValidateIf((o) => o.projectId !== null)
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @ValidateIf((o) => o.taskId !== null)
  @IsUUID()
  taskId?: string;

  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endTime?: Date;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  idleTime?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

