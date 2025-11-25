import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../entities/company.entity';
import { User, UserRole } from '../../entities/user.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const company = this.companiesRepository.create(createCompanyDto);
    return this.companiesRepository.save(company);
  }

  async register(registerCompanyDto: RegisterCompanyDto): Promise<{ company: Company; admin: User }> {
    // Create company
    const company = this.companiesRepository.create({
      name: registerCompanyDto.companyName,
      domain: registerCompanyDto.domain,
      address: registerCompanyDto.address,
      phone: registerCompanyDto.phone,
      isActive: true,
    });
    const savedCompany = await this.companiesRepository.save(company);

    // Create admin user for the company
    const hashedPassword = await bcrypt.hash(registerCompanyDto.adminPassword, 10);
    
    // Check if email already exists in this company
    const existingUser = await this.usersRepository.findOne({
      where: {
        email: registerCompanyDto.adminEmail,
        companyId: savedCompany.id,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists in this company');
    }

    const admin = this.usersRepository.create({
      email: registerCompanyDto.adminEmail,
      password: hashedPassword,
      firstName: registerCompanyDto.adminFirstName,
      lastName: registerCompanyDto.adminLastName,
      role: UserRole.ADMIN,
      companyId: savedCompany.id,
      isActive: true,
    });
    const savedAdmin = await this.usersRepository.save(admin);

    return { company: savedCompany, admin: savedAdmin };
  }

  async findAll(): Promise<Company[]> {
    return this.companiesRepository.find({
      relations: ['users'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: { id },
      relations: ['users', 'projects'],
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    await this.companiesRepository.update(id, updateCompanyDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const company = await this.findOne(id);
    await this.companiesRepository.remove(company);
  }
}

