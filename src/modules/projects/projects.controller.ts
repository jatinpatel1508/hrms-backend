import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(createProjectDto, req.user.companyId);
  }

  @Get()
  findAll(@Request() req) {
    // Super admin can see all projects, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.projectsService.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    // Super admin can see any project, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.projectsService.findOne(id, companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @Request() req) {
    // Super admin can update any project, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.projectsService.update(id, updateProjectDto, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    // Super admin can delete any project, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.projectsService.remove(id, companyId);
  }
}

