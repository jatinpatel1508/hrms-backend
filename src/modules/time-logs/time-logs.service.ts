import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TimeLog } from '../../entities/time-log.entity';
import { Task } from '../../entities/task.entity';
import { Project } from '../../entities/project.entity';
import { CreateTimeLogDto } from './dto/create-time-log.dto';
import { UpdateTimeLogDto } from './dto/update-time-log.dto';
import { EventsGateway } from '../../gateway/events.gateway';

@Injectable()
export class TimeLogsService {
  constructor(
    @InjectRepository(TimeLog)
    private timeLogsRepository: Repository<TimeLog>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @Optional()
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway?: EventsGateway,
  ) {}

  async create(createTimeLogDto: CreateTimeLogDto, companyId: string): Promise<TimeLog> {
    // Validate task if provided
    if (createTimeLogDto.taskId) {
      const task = await this.tasksRepository.findOne({
        where: { id: createTimeLogDto.taskId },
        relations: ['project'],
      });
      
      if (!task) {
        throw new NotFoundException(`Task with ID ${createTimeLogDto.taskId} not found`);
      }
      
      // Validate task belongs to the project if projectId is also provided
      if (createTimeLogDto.projectId && task.projectId !== createTimeLogDto.projectId) {
        throw new BadRequestException('Task does not belong to the specified project');
      }
      
      // Validate project belongs to company
      if (task.project) {
        const project = await this.projectsRepository.findOne({
          where: { id: task.projectId },
        });
        
        if (!project) {
          throw new NotFoundException(`Project with ID ${task.projectId} not found`);
        }
        
        if (project.companyId !== companyId) {
          throw new BadRequestException('Task does not belong to your company');
        }
        
        // If projectId wasn't provided, use the task's projectId
        if (!createTimeLogDto.projectId) {
          createTimeLogDto.projectId = task.projectId;
        }
      }
    }
    
    // Validate project if provided
    if (createTimeLogDto.projectId) {
      const project = await this.projectsRepository.findOne({
        where: { id: createTimeLogDto.projectId },
      });
      
      if (!project) {
        throw new NotFoundException(`Project with ID ${createTimeLogDto.projectId} not found`);
      }
      
      if (project.companyId !== companyId) {
        throw new BadRequestException('Project does not belong to your company');
      }
    }

    try {
      const timeLog = this.timeLogsRepository.create({
        ...createTimeLogDto,
        companyId,
      });
      const saved = await this.timeLogsRepository.save(timeLog);
      // Emit WebSocket event
      if (this.eventsGateway && createTimeLogDto.userId) {
        this.eventsGateway.emitTimeLogUpdate(createTimeLogDto.userId, saved);
      }
      return saved;
    } catch (error: any) {
      // Handle database errors (e.g., foreign key constraints, missing columns)
      if (error.code === '23503') { // Foreign key violation
        throw new BadRequestException('Invalid task or project reference');
      }
      if (error.code === '42703') { // Column does not exist
        throw new BadRequestException('Database schema error: task_id column may not exist. Please run migrations.');
      }
      throw error;
    }
  }

  async findAll(companyId?: string, userId?: string, projectId?: string, taskId?: string, startDate?: Date, endDate?: Date): Promise<TimeLog[]> {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (userId) where.userId = userId;
    if (projectId) where.projectId = projectId;
    if (taskId) where.taskId = taskId;
    if (startDate && endDate) {
      where.startTime = Between(startDate, endDate);
    }

    return this.timeLogsRepository.find({
      where,
      relations: ['user', 'project', 'task', 'company'],
      order: { startTime: 'DESC' },
    });
  }

  async findOne(id: string, companyId?: string): Promise<TimeLog> {
    const where: any = { id };
    if (companyId) where.companyId = companyId;
    const timeLog = await this.timeLogsRepository.findOne({
      where,
      relations: ['user', 'project', 'task', 'company'],
    });
    if (!timeLog) {
      throw new NotFoundException(`Time log with ID ${id} not found`);
    }
    return timeLog;
  }

  async update(id: string, updateTimeLogDto: UpdateTimeLogDto, companyId?: string): Promise<TimeLog> {
    await this.findOne(id, companyId); // Verify access
    await this.timeLogsRepository.update(id, updateTimeLogDto);
    const updated = await this.findOne(id, companyId);
    // Emit WebSocket event
    if (this.eventsGateway && updated.userId) {
      this.eventsGateway.emitTimeLogUpdate(updated.userId, updated);
    }
    return updated;
  }

  async remove(id: string, companyId?: string): Promise<void> {
    await this.findOne(id, companyId); // Verify access
    await this.timeLogsRepository.delete(id);
  }

  async getActiveTimeLog(userId: string, companyId?: string): Promise<TimeLog | null> {
    const where: any = { userId, endTime: null };
    if (companyId) where.companyId = companyId;
    return this.timeLogsRepository.findOne({
      where,
      order: { startTime: 'DESC' },
    });
  }
}

