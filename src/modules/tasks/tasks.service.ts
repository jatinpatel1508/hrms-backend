import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from '../../entities/task.entity';
import { Project } from '../../entities/project.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createTaskDto: CreateTaskDto, companyId: string): Promise<Task> {
    // Verify project belongs to company
    const project = await this.projectsRepository.findOne({
      where: { id: createTaskDto.projectId, companyId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const task = this.tasksRepository.create({
      ...createTaskDto,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
    });
    return this.tasksRepository.save(task);
  }

  async findAll(companyId?: string, projectId?: string): Promise<Task[]> {
    if (projectId) {
      const where: any = { id: projectId };
      if (companyId) where.companyId = companyId;
      // Verify project belongs to company (if companyId provided)
      const project = await this.projectsRepository.findOne({ where });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
      
      return this.tasksRepository.find({
        where: { projectId },
        relations: ['project', 'assignedUser', 'project.company'],
        order: { createdAt: 'DESC' },
      });
    } else {
      if (companyId) {
        // Filter by company through projects
        const projects = await this.projectsRepository.find({
          where: { companyId },
          select: ['id'],
        });
        const projectIds = projects.map(p => p.id);
        
        if (projectIds.length === 0) {
          return [];
        }

        return this.tasksRepository
          .createQueryBuilder('task')
          .where('task.projectId IN (:...projectIds)', { projectIds })
          .leftJoinAndSelect('task.project', 'project')
          .leftJoinAndSelect('project.company', 'company')
          .leftJoinAndSelect('task.assignedUser', 'assignedUser')
          .orderBy('task.createdAt', 'DESC')
          .getMany();
      } else {
        // Super admin: return all tasks
        return this.tasksRepository.find({
          relations: ['project', 'assignedUser', 'project.company'],
          order: { createdAt: 'DESC' },
        });
      }
    }
  }

  async findOne(id: string, companyId?: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['project', 'assignedUser', 'project.company'],
    });
    
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Verify task belongs to company (if companyId provided)
    if (companyId && task.project.companyId !== companyId) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, companyId?: string): Promise<Task> {
    const task = await this.findOne(id, companyId);
    
    if (updateTaskDto.projectId) {
      const where: any = { id: updateTaskDto.projectId };
      if (companyId) where.companyId = companyId;
      // Verify new project belongs to company (if companyId provided)
      const project = await this.projectsRepository.findOne({ where });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    await this.tasksRepository.update(id, {
      ...updateTaskDto,
      dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
    });
    return this.findOne(id, companyId);
  }

  async remove(id: string, companyId?: string): Promise<void> {
    await this.findOne(id, companyId);
    await this.tasksRepository.delete(id);
  }

  async assignTask(id: string, userId: string, companyId?: string): Promise<Task> {
    const task = await this.findOne(id, companyId);
    // TODO: Verify user belongs to company
    await this.tasksRepository.update(id, { assignedUserId: userId });
    return this.findOne(id, companyId);
  }

  async updateStatus(id: string, status: TaskStatus, companyId?: string): Promise<Task> {
    await this.findOne(id, companyId);
    await this.tasksRepository.update(id, { status });
    return this.findOne(id, companyId);
  }
}

