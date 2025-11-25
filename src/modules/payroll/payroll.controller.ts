import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query, Request } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePayrollRecordDto } from './dto/create-payroll-record.dto';
import { CalculatePayrollDto } from './dto/calculate-payroll.dto';

@Controller('payroll')
@UseGuards(JwtAuthGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('calculate')
  calculate(@Body() calculatePayrollDto: CalculatePayrollDto, @Request() req) {
    return this.payrollService.calculatePayroll(
      calculatePayrollDto.userId,
      req.user.companyId,
      new Date(calculatePayrollDto.periodStart),
      new Date(calculatePayrollDto.periodEnd),
    );
  }

  @Post()
  create(@Body() createPayrollRecordDto: CreatePayrollRecordDto, @Request() req) {
    return this.payrollService.create(createPayrollRecordDto, req.user.companyId);
  }

  @Get()
  findAll(@Query('userId') userId?: string, @Request() req?: any) {
    // Super admin can see all payroll records, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    const filterUserId = req.user.role === 'admin' || req.user.role === 'manager' || req.user.role === 'super_admin' ? userId : req.user.id;
    return this.payrollService.findAll(companyId, filterUserId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    // Super admin can see any payroll record, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.payrollService.findOne(id, companyId);
  }

  @Patch(':id/mark-paid')
  markAsPaid(@Param('id') id: string, @Request() req) {
    // Super admin can mark any payroll record as paid, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.payrollService.markAsPaid(id, companyId);
  }
}

