import { Injectable, Inject, forwardRef, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AppUsageLog } from '../../entities/app-usage-log.entity';
import { CreateAppUsageLogDto } from './dto/create-app-usage-log.dto';
import { EventsGateway } from '../../gateway/events.gateway';

@Injectable()
export class AppUsageService {
  constructor(
    @InjectRepository(AppUsageLog)
    private appUsageLogsRepository: Repository<AppUsageLog>,
    @Optional()
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway?: EventsGateway,
  ) {}

  async create(createAppUsageLogDto: CreateAppUsageLogDto, companyId: string): Promise<AppUsageLog> {
    const appUsageLog = this.appUsageLogsRepository.create({
      ...createAppUsageLogDto,
      companyId,
    });
    return this.appUsageLogsRepository.save(appUsageLog);
  }

  async createBatch(createAppUsageLogDtos: CreateAppUsageLogDto[], companyId: string): Promise<AppUsageLog[]> {
    const appUsageLogs = this.appUsageLogsRepository.create(
      createAppUsageLogDtos.map(dto => ({ ...dto, companyId }))
    );
    const saved = await this.appUsageLogsRepository.save(appUsageLogs);
    // Emit WebSocket event for the user (assuming all logs are for same user)
    if (this.eventsGateway && saved.length > 0 && saved[0].userId) {
      this.eventsGateway.emitAppUsageUpdate(saved[0].userId, saved);
    }
    return saved;
  }

  async findAll(companyId?: string, userId?: string, startDate?: Date, endDate?: Date): Promise<AppUsageLog[]> {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (userId) where.userId = userId;
    if (startDate && endDate) {
      where.startTime = Between(startDate, endDate);
    }

    return this.appUsageLogsRepository.find({
      where,
      relations: ['user', 'company'],
      order: { startTime: 'DESC' },
    });
  }

  async getAppUsageStats(companyId: string | undefined, userId: string, startDate: Date, endDate: Date) {
    const where: any = {
      userId,
      startTime: Between(startDate, endDate),
    };
    if (companyId) where.companyId = companyId;
    const logs = await this.appUsageLogsRepository.find({
      where,
    });

    const stats = logs.reduce((acc, log) => {
      if (!acc[log.appName]) {
        acc[log.appName] = { totalDuration: 0, count: 0 };
      }
      acc[log.appName].totalDuration += log.duration;
      acc[log.appName].count += 1;
      return acc;
    }, {} as Record<string, { totalDuration: number; count: number }>);

    return Object.entries(stats).map(([appName, data]) => ({
      appName,
      totalDuration: data.totalDuration,
      count: data.count,
    }));
  }
}

