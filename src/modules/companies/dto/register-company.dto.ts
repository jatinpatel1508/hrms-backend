import { IsString, IsEmail, IsOptional } from 'class-validator';

export class RegisterCompanyDto {
  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  adminPassword: string;

  @IsString()
  adminFirstName: string;

  @IsString()
  adminLastName: string;
}

