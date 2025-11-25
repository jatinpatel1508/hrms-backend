import { Controller, Get, Post, Body, UseGuards, Query, Request } from '@nestjs/common';
import { AppUsageService } from './app-usage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAppUsageLogDto } from './dto/create-app-usage-log.dto';

@Controller('app-usage')
@UseGuards(JwtAuthGuard)
export class AppUsageController {
  constructor(private readonly appUsageService: AppUsageService) {}

  @Post()
  create(@Body() createAppUsageLogDto: CreateAppUsageLogDto, @Request() req) {
    return this.appUsageService.create({
      ...createAppUsageLogDto,
      userId: req.user.id,
    }, req.user.companyId);
  }

  @Post('batch')
  createBatch(@Body() createAppUsageLogDtos: CreateAppUsageLogDto[], @Request() req) {
    const logsWithUserId = createAppUsageLogDtos.map((dto) => ({
      ...dto,
      userId: req.user.id,
    }));
    return this.appUsageService.createBatch(logsWithUserId, req.user.companyId);
  }

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?: any,
  ) {
    // Super admin can see all app usage logs, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    const filterUserId = req.user.role === 'admin' || req.user.role === 'manager' || req.user.role === 'super_admin' ? userId : req.user.id;
    return this.appUsageService.findAll(
      companyId,
      filterUserId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('stats')
  getStats(
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req: any,
  ) {
    // Super admin can see stats for any user, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    const filterUserId = req.user.role === 'admin' || req.user.role === 'manager' || req.user.role === 'super_admin' ? userId : req.user.id;
    return this.appUsageService.getAppUsageStats(
      companyId,
      filterUserId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}

