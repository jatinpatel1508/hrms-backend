import { IsString, IsOptional, IsUUID, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { TaskStatus, TaskPriority } from '../../../entities/task.entity';

export class CreateTaskDto {
  @IsUUID()
  projectId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsUUID()
  assignedUserId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;
}

