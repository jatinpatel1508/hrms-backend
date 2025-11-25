import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { TimeLogsService } from './time-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTimeLogDto } from './dto/create-time-log.dto';
import { UpdateTimeLogDto } from './dto/update-time-log.dto';

@Controller('time-logs')
@UseGuards(JwtAuthGuard)
export class TimeLogsController {
  constructor(private readonly timeLogsService: TimeLogsService) {}

  @Post()
  create(@Body() createTimeLogDto: CreateTimeLogDto, @Request() req) {
    return this.timeLogsService.create({
      ...createTimeLogDto,
      userId: req.user.id,
    }, req.user.companyId);
  }

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('projectId') projectId?: string,
    @Query('taskId') taskId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?: any,
  ) {
    // Super admin can see all time logs, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    const filterUserId = req.user.role === 'admin' || req.user.role === 'manager' || req.user.role === 'super_admin' ? userId : req.user.id;
    return this.timeLogsService.findAll(
      companyId,
      filterUserId,
      projectId,
      taskId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('active')
  getActive(@Request() req) {
    // Super admin can see active logs for any user, others only their own
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.timeLogsService.getActiveTimeLog(req.user.id, companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    // Super admin can see any time log, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.timeLogsService.findOne(id, companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTimeLogDto: UpdateTimeLogDto, @Request() req) {
    // Super admin can update any time log, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.timeLogsService.update(id, updateTimeLogDto, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    // Super admin can delete any time log, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.timeLogsService.remove(id, companyId);
  }
}

