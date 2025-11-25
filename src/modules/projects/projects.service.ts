import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, companyId: string): Promise<Project> {
    const project = this.projectsRepository.create({
      ...createProjectDto,
      companyId,
    });
    return this.projectsRepository.save(project);
  }

  async findAll(companyId?: string): Promise<Project[]> {
    const where: any = { isActive: true };
    if (companyId) {
      where.companyId = companyId;
    }
    return this.projectsRepository.find({
      where,
      relations: ['company'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId?: string): Promise<Project> {
    const where: any = { id };
    if (companyId) {
      where.companyId = companyId;
    }
    const project = await this.projectsRepository.findOne({ 
      where,
      relations: ['company'],
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, companyId?: string): Promise<Project> {
    await this.findOne(id, companyId); // Verify access
    await this.projectsRepository.update(id, updateProjectDto);
    return this.findOne(id, companyId);
  }

  async remove(id: string, companyId?: string): Promise<void> {
    await this.findOne(id, companyId); // Verify access
    await this.projectsRepository.delete(id);
  }
}

