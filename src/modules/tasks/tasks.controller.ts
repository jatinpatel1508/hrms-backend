import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TaskStatus } from '../../entities/task.entity';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user.companyId);
  }

  @Get()
  findAll(@Query('projectId') projectId: string, @Request() req) {
    // Super admin can see all tasks, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.tasksService.findAll(companyId, projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    // Super admin can see any task, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.tasksService.findOne(id, companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req) {
    // Super admin can update any task, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.tasksService.update(id, updateTaskDto, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    // Super admin can delete any task, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.tasksService.remove(id, companyId);
  }

  @Patch(':id/assign')
  assignTask(@Param('id') id: string, @Body('userId') userId: string, @Request() req) {
    // Super admin can assign any task, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.tasksService.assignTask(id, userId, companyId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: TaskStatus, @Request() req) {
    // Super admin can update status of any task, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.tasksService.updateStatus(id, status, companyId);
  }
}

