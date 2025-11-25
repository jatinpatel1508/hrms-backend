import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../../entities/setting.entity';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
  ) {}

  async create(createSettingDto: CreateSettingDto): Promise<Setting> {
    const setting = this.settingsRepository.create(createSettingDto);
    return this.settingsRepository.save(setting);
  }

  async findAll(companyId?: string): Promise<Setting[]> {
    const where: any = {};
    if (companyId) {
      where.companyId = companyId;
    } else {
      where.companyId = null; // Global settings
    }
    return this.settingsRepository.find({ where });
  }

  async findOne(key: string, companyId?: string): Promise<Setting> {
    const where: any = { key };
    if (companyId !== undefined) {
      where.companyId = companyId || null;
    }
    const setting = await this.settingsRepository.findOne({ where });
    if (!setting) {
      throw new NotFoundException(`Setting with key ${key} not found`);
    }
    return setting;
  }

  async getValue(key: string, companyId?: string): Promise<string | null> {
    try {
      const setting = await this.findOne(key, companyId);
      return setting.value;
    } catch {
      return null;
    }
  }

  async update(key: string, updateSettingDto: UpdateSettingDto, companyId?: string): Promise<Setting> {
    const where: any = { key };
    if (companyId !== undefined) {
      where.companyId = companyId || null;
    }
    await this.settingsRepository.update(where, updateSettingDto);
    return this.findOne(key, companyId);
  }

  async setValue(key: string, value: string, companyId?: string): Promise<Setting> {
    const where: any = { key };
    if (companyId !== undefined) {
      where.companyId = companyId || null;
    }
    const existing = await this.settingsRepository.findOne({ where });
    if (existing) {
      existing.value = value;
      return this.settingsRepository.save(existing);
    } else {
      return this.create({ key, value, companyId: companyId || undefined });
    }
  }

  async remove(key: string, companyId?: string): Promise<void> {
    const where: any = { key };
    if (companyId !== undefined) {
      where.companyId = companyId || null;
    }
    await this.settingsRepository.delete(where);
  }
}

