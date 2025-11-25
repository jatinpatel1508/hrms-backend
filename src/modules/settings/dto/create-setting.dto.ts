import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateSettingDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isUserConfigurable?: boolean;

  @IsOptional()
  @IsUUID()
  companyId?: string;
}

