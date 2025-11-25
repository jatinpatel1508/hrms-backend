import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersRepository.find({
      relations: ['company'],
    });
    // Remove password from response
    return users.map(({ password, ...user }) => user as Omit<User, 'password'>);
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['company'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password'>;
  }

  async findOneByCompany(id: string, companyId: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ 
      where: { id, companyId },
      relations: ['company'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found in your company`);
    }
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password'>;
  }

  async findByEmail(email: string, companyId?: string): Promise<User | null> {
    const where: any = { email };
    if (companyId) {
      where.companyId = companyId;
    }
    return this.usersRepository.findOne({ where });
  }

  async findAllByCompany(companyId: string): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersRepository.find({
      where: { companyId },
      relations: ['company'],
    });
    // Remove password from response
    return users.map(({ password, ...user }) => user as Omit<User, 'password'>);
  }

  async update(id: string, updateData: Partial<User>): Promise<Omit<User, 'password'>> {
    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    await this.usersRepository.update(id, updateData);
    return this.findOne(id);
  }

  async updateByCompany(id: string, updateData: Partial<User>, companyId: string): Promise<Omit<User, 'password'>> {
    // Verify user belongs to company
    const user = await this.usersRepository.findOne({ where: { id, companyId } });
    if (!user) {
      throw new ForbiddenException('User not found in your company');
    }
    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    await this.usersRepository.update(id, updateData);
    return this.findOneByCompany(id, companyId);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async removeByCompany(id: string, companyId: string): Promise<void> {
    // Verify user belongs to company
    const user = await this.usersRepository.findOne({ where: { id, companyId } });
    if (!user) {
      throw new ForbiddenException('User not found in your company');
    }
    await this.usersRepository.delete(id);
  }
}

