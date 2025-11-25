import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto, @Request() req) {
    // Super admin can specify companyId, others use their own company
    const companyId = req.user.role === 'super_admin' && createUserDto.companyId
      ? createUserDto.companyId
      : req.user.companyId;
    
    return this.usersService.create({
      ...createUserDto,
      companyId,
    });
  }

  @Get()
  findAll(@Request() req) {
    // Super admin can see all users, others see only their company
    if (req.user.role === 'super_admin') {
      return this.usersService.findAll();
    }
    return this.usersService.findAllByCompany(req.user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    // Super admin can view any user, others only their company
    if (req.user.role === 'super_admin') {
      return this.usersService.findOne(id);
    }
    return this.usersService.findOneByCompany(id, req.user.companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    // Super admin can update any user, others only their company
    if (req.user.role === 'super_admin') {
      // Super admin can change companyId if provided
      return this.usersService.update(id, updateUserDto);
    }
    // Non-super admin cannot change companyId, remove it if present
    const { companyId, ...updateData } = updateUserDto;
    return this.usersService.updateByCompany(id, updateData, req.user.companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    // Super admin can delete any user, others only their company
    if (req.user.role === 'super_admin') {
      return this.usersService.remove(id);
    }
    return this.usersService.removeByCompany(id, req.user.companyId);
  }
}

