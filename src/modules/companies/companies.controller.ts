import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../../entities/user.entity';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post('register')
  register(@Body() registerCompanyDto: RegisterCompanyDto) {
    return this.companiesService.register(registerCompanyDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createCompanyDto: CreateCompanyDto, @Request() req) {
    // Only super admin can create companies
    if (req.user.role !== UserRole.SUPER_ADMIN) {
      throw new Error('Only super admin can create companies');
    }
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req) {
    // Only super admin can list all companies
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return this.companiesService.findAll();
    }
    // Company admin can view their own company
    return this.companiesService.findOne(req.user.companyId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    // Super admin can view any company
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return this.companiesService.findOne(id);
    }
    // Others can only view their own company
    if (req.user.companyId !== id) {
      throw new Error('Access denied');
    }
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto, @Request() req) {
    // Super admin or company admin can update
    if (req.user.role !== UserRole.SUPER_ADMIN && req.user.companyId !== id) {
      throw new Error('Access denied');
    }
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    // Only super admin can delete companies
    if (req.user.role !== UserRole.SUPER_ADMIN) {
      throw new Error('Only super admin can delete companies');
    }
    return this.companiesService.remove(id);
  }
}

