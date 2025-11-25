import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  billingRate?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

