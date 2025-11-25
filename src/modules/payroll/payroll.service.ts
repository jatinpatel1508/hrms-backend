import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PayrollRecord } from '../../entities/payroll-record.entity';
import { TimeLogsService } from '../time-logs/time-logs.service';
import { UsersService } from '../users/users.service';
import { CreatePayrollRecordDto } from './dto/create-payroll-record.dto';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(PayrollRecord)
    private payrollRecordsRepository: Repository<PayrollRecord>,
    private timeLogsService: TimeLogsService,
    private usersService: UsersService,
  ) {}

  async calculatePayroll(userId: string, companyId: string, periodStart: Date, periodEnd: Date): Promise<PayrollRecord> {
    const user = await this.usersService.findOne(userId);
    // Verify user belongs to company
    if (user.companyId !== companyId) {
      throw new Error('User does not belong to company');
    }
    const timeLogs = await this.timeLogsService.findAll(companyId, userId, undefined, undefined, periodStart, periodEnd);

    let totalSeconds = 0;
    let idleSeconds = 0;

    timeLogs.forEach((log) => {
      totalSeconds += log.duration;
      idleSeconds += log.idleTime;
    });

    const totalHours = (totalSeconds - idleSeconds) / 3600;
    const hourlyRate = user.hourlyRate || 0;
    const totalAmount = totalHours * hourlyRate;

    const payrollRecord = this.payrollRecordsRepository.create({
      userId,
      companyId,
      periodStart,
      periodEnd,
      totalHours: totalSeconds,
      idleHours: idleSeconds,
      hourlyRate,
      totalAmount,
    });

    return this.payrollRecordsRepository.save(payrollRecord);
  }

  async create(createPayrollRecordDto: CreatePayrollRecordDto, companyId: string): Promise<PayrollRecord> {
    const payrollRecord = this.payrollRecordsRepository.create({
      ...createPayrollRecordDto,
      companyId,
    });
    return this.payrollRecordsRepository.save(payrollRecord);
  }

  async findAll(companyId?: string, userId?: string): Promise<PayrollRecord[]> {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (userId) where.userId = userId;

    return this.payrollRecordsRepository.find({
      where,
      relations: ['user', 'company'],
      order: { periodStart: 'DESC' },
    });
  }

  async findOne(id: string, companyId?: string): Promise<PayrollRecord> {
    const where: any = { id };
    if (companyId) where.companyId = companyId;
    const record = await this.payrollRecordsRepository.findOne({
      where,
      relations: ['user', 'company'],
    });
    if (!record) {
      throw new NotFoundException(`Payroll record with ID ${id} not found`);
    }
    return record;
  }

  async markAsPaid(id: string, companyId?: string): Promise<PayrollRecord> {
    const record = await this.findOne(id, companyId);
    record.isPaid = true;
    record.paidAt = new Date();
    return this.payrollRecordsRepository.save(record);
  }
}

